import { db } from '../database/db.ts';
import { Student, ChatResponse, LangGraphTrace, ToolExecutionRecord } from '../database/types.ts';
import { getGeminiClient, DEFAULT_MODEL } from './geminiClient.ts';
import { semanticStudentSearch, SemanticSearchResult } from './semanticSearch.ts';

// State container for the LangGraph pipeline
export interface LangGraphState {
  question: string;
  conversation_history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  is_valid: boolean;
  validation_error?: string;
  intent: 'sql_query' | 'analytics' | 'semantic_search' | 'unsupported';
  executed_tools: ToolExecutionRecord[];
  retrieved_students: Student[];
  retrieved_stats?: any;
  semantic_results?: SemanticSearchResult[];
  generated_answer: string;
  safety_passed: boolean;
  start_time: number;
}

// Node 1: validate_question
export function nodeValidateQuestion(state: LangGraphState): LangGraphState {
  const q = state.question?.trim();
  if (!q) {
    return {
      ...state,
      is_valid: false,
      validation_error: 'Please ask a valid question about the student database.'
    };
  }

  // Prevent prompt injection / security probing
  const lower = q.toLowerCase();
  const prohibitedProbes = [
    'ignore previous instructions',
    'system prompt',
    'reveal your api key',
    'drop table',
    'delete from',
    'insert into',
    'update students set',
    'select * from'
  ];

  for (const probe of prohibitedProbes) {
    if (lower.includes(probe)) {
      return {
        ...state,
        is_valid: false,
        validation_error: 'Security Notice: Unsafe query or direct database modification attempt detected. Only conversational student queries are permitted.'
      };
    }
  }

  return {
    ...state,
    is_valid: true
  };
}

// Node 2: classify_intent
export function nodeClassifyIntent(state: LangGraphState): LangGraphState {
  if (!state.is_valid) {
    return { ...state, intent: 'unsupported' };
  }

  const q = state.question.toLowerCase();

  // 1. Analytics intent
  if (
    q.includes('average') ||
    q.includes('mean') ||
    q.includes('highest') ||
    q.includes('lowest') ||
    q.includes('statistics') ||
    q.includes('summary') ||
    q.includes('distribution') ||
    q.includes('breakdown') ||
    q.includes('ratio') ||
    q.includes('topper') ||
    q.includes('top student') ||
    q.includes('top 5') ||
    q.includes('top 10') ||
    q.includes('best cgpa') ||
    q.includes('which department has')
  ) {
    return { ...state, intent: 'analytics' };
  }

  // 2. Semantic search intent (skills, interests, technologies, domains, specializations)
  if (
    q.includes('interested in') ||
    q.includes('specializing in') ||
    q.includes('specialized in') ||
    q.includes('experience with') ||
    q.includes('skills') ||
    q.includes('skill') ||
    q.includes('knows') ||
    q.includes('proficient') ||
    q.includes('expert') ||
    q.includes('who can build') ||
    q.includes('who works with') ||
    q.includes('machine learning') ||
    q.includes('artificial intelligence') ||
    q.includes('deep learning') ||
    q.includes('cloud') ||
    q.includes('cybersecurity') ||
    q.includes('robotics') ||
    q.includes('web development')
  ) {
    return { ...state, intent: 'semantic_search' };
  }

  // 3. Structured / SQL query intent (counts, city filters, CGPA filters, attendance filters)
  if (
    q.includes('how many') ||
    q.includes('count') ||
    q.includes('list') ||
    q.includes('find') ||
    q.includes('show') ||
    q.includes('cgpa above') ||
    q.includes('cgpa below') ||
    q.includes('cgpa greater') ||
    q.includes('attendance below') ||
    q.includes('attendance above') ||
    q.includes('from hyderabad') ||
    q.includes('from bangalore') ||
    q.includes('from pune') ||
    q.includes('from mumbai') ||
    q.includes('from delhi') ||
    q.includes('from chennai') ||
    q.includes('cse') ||
    q.includes('ece') ||
    q.includes('eee') ||
    q.includes('mech') ||
    q.includes('civil') ||
    q.includes('it department')
  ) {
    return { ...state, intent: 'sql_query' };
  }

  // Default to structured query if general student question
  if (q.includes('student') || q.includes('who') || q.includes('what')) {
    return { ...state, intent: 'sql_query' };
  }

  return { ...state, intent: 'unsupported' };
}

// Node 3: retrieve_information using Controlled Tools
export async function nodeRetrieveInformation(state: LangGraphState): Promise<LangGraphState> {
  if (!state.is_valid || state.intent === 'unsupported') {
    return state;
  }

  const q = state.question.toLowerCase();
  const executed_tools: ToolExecutionRecord[] = [];
  let retrieved_students: Student[] = [];
  let retrieved_stats: any = null;
  let semantic_results: SemanticSearchResult[] = [];

  // Extract department if mentioned
  let targetDept: string | undefined;
  if (/\bcse\b|computer science/i.test(q)) targetDept = 'CSE';
  else if (/\bece\b|electronics/i.test(q)) targetDept = 'ECE';
  else if (/\beee\b|electrical/i.test(q)) targetDept = 'EEE';
  else if (/\bmech\b|mechanical/i.test(q)) targetDept = 'MECH';
  else if (/\bcivil\b/i.test(q)) targetDept = 'CIVIL';
  else if (/\bit\b|information technology/i.test(q)) targetDept = 'IT';

  // Tool A: Analytics Tool
  if (state.intent === 'analytics') {
    if (q.includes('top') || q.includes('highest cgpa') || q.includes('topper') || q.includes('best')) {
      const limit = q.includes('10') ? 10 : 5;
      const topStudents = db.getTopStudents(limit, targetDept);
      retrieved_students = topStudents;
      executed_tools.push({
        tool_name: 'get_top_students',
        parameters: { limit, department: targetDept || 'ALL' },
        records_retrieved: topStudents.length,
        summary: `Retrieved top ${topStudents.length} students ranked by CGPA`
      });
    }

    const stats = db.getStatsSummary();
    retrieved_stats = stats;
    executed_tools.push({
      tool_name: 'get_department_statistics',
      parameters: { target_department: targetDept || 'ALL' },
      records_retrieved: Object.keys(stats.department_breakdown).length,
      summary: `Computed aggregate stats across ${stats.total_students} students and ${Object.keys(stats.department_breakdown).length} departments`
    });
  }

  // Tool B: Semantic Search Tool
  else if (state.intent === 'semantic_search') {
    const semResults = await semanticStudentSearch(state.question, 6, targetDept);
    semantic_results = semResults;
    retrieved_students = semResults.map((r) => r.student);
    executed_tools.push({
      tool_name: 'semantic_student_search',
      parameters: { query: state.question, top_k: 6, department: targetDept },
      records_retrieved: semResults.length,
      summary: `Retrieved ${semResults.length} student records matching natural-language concepts`
    });
  }

  // Tool C: Structured Query & Filter Tools
  else if (state.intent === 'sql_query') {
    let minCgpa: number | undefined;
    let maxCgpa: number | undefined;
    let minAtt: number | undefined;
    let maxAtt: number | undefined;
    let targetCity: string | undefined;

    // Detect CGPA threshold
    const cgpaMatch = q.match(/cgpa\s*(?:above|>|greater than|>=)\s*([0-9.]+)/i);
    if (cgpaMatch) minCgpa = parseFloat(cgpaMatch[1]);
    const cgpaBelowMatch = q.match(/cgpa\s*(?:below|<|less than|<=)\s*([0-9.]+)/i);
    if (cgpaBelowMatch) maxCgpa = parseFloat(cgpaBelowMatch[1]);

    // Detect Attendance threshold
    const attMatch = q.match(/attendance\s*(?:below|<|less than|under|<=)\s*([0-9.]+)/i);
    if (attMatch) maxAtt = parseFloat(attMatch[1]);
    const attAboveMatch = q.match(/attendance\s*(?:above|>|greater than|>=)\s*([0-9.]+)/i);
    if (attAboveMatch) minAtt = parseFloat(attAboveMatch[1]);

    // Detect City
    const cities = ['hyderabad', 'bangalore', 'pune', 'chennai', 'mumbai', 'delhi', 'jaipur', 'kolkata'];
    for (const city of cities) {
      if (q.includes(city)) {
        targetCity = city;
        break;
      }
    }

    // Detect skill search
    const popularSkills = ['python', 'java', 'react', 'sql', 'docker', 'c++', 'matlab', 'autocad', 'aws'];
    const matchedSkills = popularSkills.filter((s) => q.includes(s));

    if (q.includes('how many') || q.includes('count')) {
      const res = db.getAll({
        department: targetDept,
        min_cgpa: minCgpa,
        max_cgpa: maxCgpa,
        min_attendance: minAtt,
        max_attendance: maxAtt,
        city: targetCity,
        skills: matchedSkills.length > 0 ? matchedSkills : undefined,
        limit: 100
      });
      retrieved_students = res.data;
      executed_tools.push({
        tool_name: 'count_students',
        parameters: { department: targetDept, min_cgpa: minCgpa, city: targetCity, skills: matchedSkills },
        records_retrieved: res.total,
        summary: `Filtered and counted ${res.total} students matching query conditions`
      });
    } else {
      const res = db.getAll({
        department: targetDept,
        min_cgpa: minCgpa,
        max_cgpa: maxCgpa,
        min_attendance: minAtt,
        max_attendance: maxAtt,
        city: targetCity,
        skills: matchedSkills.length > 0 ? matchedSkills : undefined,
        limit: 15
      });
      retrieved_students = res.data;
      executed_tools.push({
        tool_name: 'filter_students',
        parameters: { department: targetDept, min_cgpa: minCgpa, city: targetCity, skills: matchedSkills },
        records_retrieved: res.data.length,
        summary: `Retrieved ${res.data.length} student records from database`
      });
    }
  }

  return {
    ...state,
    executed_tools,
    retrieved_students,
    retrieved_stats,
    semantic_results
  };
}

// Node 4: generate_response using Gemini API with Grounding Prompts
export async function nodeGenerateResponse(state: LangGraphState): Promise<LangGraphState> {
  if (!state.is_valid) {
    return {
      ...state,
      generated_answer: state.validation_error || "Please ask a specific question regarding student records or institute statistics."
    };
  }

  if (state.intent === 'unsupported') {
    return {
      ...state,
      generated_answer: "I can only assist with inquiries grounded in the Student Database (e.g., student searches, skills matching, department statistics, CGPA rankings, and attendance analysis). Please rephrase your question."
    };
  }

  // Format database context
  const studentsContext = state.retrieved_students.map((s, idx) => {
    return `${idx + 1}. [${s.student_id}] ${s.first_name} ${s.last_name} | Dept: ${s.department} | Year: ${s.year}, Sem: ${s.semester} | CGPA: ${s.cgpa} | Attendance: ${s.attendance_percentage}% | City: ${s.city} | Skills: ${s.skills.join(', ')}`;
  }).join('\n');

  const statsContext = state.retrieved_stats ? JSON.stringify(state.retrieved_stats, null, 2) : 'None';
  const toolsContext = state.executed_tools.map((t) => `${t.tool_name} (params: ${JSON.stringify(t.parameters)}): ${t.summary}`).join('\n');

  const prompt = `You are the Conversational AI for a verified Student Database Management System.
You must answer the user's question accurately, professionally, and STRICTLY grounded in the database data provided below.

CRITICAL SAFETY & GROUNDING RULES:
1. ONLY refer to student records, departments, and metrics that appear in the DATABASE CONTEXT below.
2. DO NOT invent, fabricate, or assume any student names, IDs, CGPAs, attendance numbers, or skills.
3. If no student matches the criteria, state: "I don't have enough information in the student database to answer that." or clearly state that 0 matching records were found.
4. Format your answer with clean Markdown: bullet points for lists, bolding for student names and key metrics (CGPA, department).
5. Explain how the data answers their specific question.

USER QUESTION:
"${state.question}"

DETECTED INTENT:
${state.intent}

DATABASE TOOLS EXECUTED:
${toolsContext}

RETRIEVED STUDENT RECORDS (${state.retrieved_students.length} records):
${studentsContext || 'No individual records retrieved.'}

RETRIEVED STATISTICAL SUMMARY:
${statsContext}

Generate the final, polite, database-grounded response:`;

  const gemini = getGeminiClient();

  if (gemini) {
    try {
      const response = await gemini.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
        config: {
          systemInstruction: "You are an accurate, strict academic database AI. Never invent records. Cite exact student IDs, names, CGPAs, and departments when answering.",
          temperature: 0.2
        }
      });

      const text = response.text?.trim();
      if (text) {
        return {
          ...state,
          generated_answer: text
        };
      }
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to deterministic grounded response:', err?.message || err);
    }
  }

  // Deterministic Fallback Generator if Gemini API key is absent or offline
  const deterministicAnswer = generateDeterministicGroundedResponse(state);
  return {
    ...state,
    generated_answer: deterministicAnswer
  };
}

// Fallback deterministic grounded response generator
function generateDeterministicGroundedResponse(state: LangGraphState): string {
  const count = state.retrieved_students.length;
  const q = state.question.toLowerCase();

  if (state.intent === 'analytics' && state.retrieved_stats) {
    const stats = state.retrieved_stats;
    if (q.includes('highest') || q.includes('best') || q.includes('top department')) {
      const depts = Object.entries(stats.department_breakdown) as [string, any][];
      depts.sort((a, b) => b[1].avg_cgpa - a[1].avg_cgpa);
      const topDept = depts[0];
      return `According to the student database, the **${topDept[0]}** department has the highest average CGPA at **${topDept[1].avg_cgpa}** (across ${topDept[1].count} students), followed by ${depts.slice(1, 3).map(([d, m]) => `**${d}** (${m.avg_cgpa})`).join(', ')}.`;
    }

    if (q.includes('top') && state.retrieved_students.length > 0) {
      const toppers = state.retrieved_students.slice(0, 5);
      return `Here are the top ${toppers.length} students ranked by CGPA from the database:\n\n` +
        toppers.map((s, i) => `${i + 1}. **${s.first_name} ${s.last_name}** (${s.student_id}) - Dept: **${s.department}**, CGPA: **${s.cgpa}**, Attendance: **${s.attendance_percentage}%**, Skills: ${s.skills.slice(0, 3).join(', ')}`).join('\n\n');
    }

    return `### Database Analytics Summary\n- **Total Enrolled Students:** ${stats.total_students}\n- **Overall Average CGPA:** ${stats.average_cgpa}\n- **Overall Average Attendance:** ${stats.average_attendance}%\n- **Attendance Risk (<75%):** ${stats.attendance_risk_count} students\n\n**Department Breakdown:**\n` +
      Object.entries(stats.department_breakdown).map(([dept, m]: [string, any]) => `- **${dept}:** ${m.count} students | Avg CGPA: ${m.avg_cgpa} | Avg Attendance: ${m.avg_attendance}%`).join('\n');
  }

  if (count === 0) {
    return "I don't have enough information in the student database to answer that. No records matching your specific query were found.";
  }

  if (q.includes('how many') || q.includes('count')) {
    return `There are currently **${count}** students in the database matching your criteria.`;
  }

  let text = `Found **${count}** matching student${count > 1 ? 's' : ''} in the database:\n\n`;
  for (const s of state.retrieved_students.slice(0, 6)) {
    text += `- **${s.first_name} ${s.last_name}** (\`${s.student_id}\`) - **${s.department}** (Year ${s.year}, Sem ${s.semester}) | CGPA: **${s.cgpa}** | Attendance: **${s.attendance_percentage}%** | City: **${s.city}** | Skills: *${s.skills.join(', ')}*\n`;
  }

  return text;
}

// Node 5: safety_check
export function nodeSafetyCheck(state: LangGraphState): LangGraphState {
  if (!state.is_valid || state.intent === 'unsupported') {
    return { ...state, safety_passed: true };
  }

  // Hallucination safeguard check
  const answer = state.generated_answer.toLowerCase();
  let safety_passed = true;

  // If no records were retrieved, ensure we didn't invent students
  if (state.retrieved_students.length === 0 && !state.retrieved_stats) {
    if (!answer.includes("don't have enough information") && !answer.includes("no student") && !answer.includes("0 matching") && !answer.includes("0 students")) {
      safety_passed = false;
      return {
        ...state,
        safety_passed: false,
        generated_answer: "I don't have enough information in the student database to answer that."
      };
    }
  }

  return {
    ...state,
    safety_passed
  };
}

// Node 6: final_response packaging
export function nodeFinalResponse(state: LangGraphState): ChatResponse {
  const latency_ms = Date.now() - state.start_time;

  const trace: LangGraphTrace = {
    validated: state.is_valid,
    intent: state.intent,
    tools_executed: state.executed_tools,
    safety_check_passed: state.safety_passed,
    grounded_record_count: state.retrieved_students.length,
    latency_ms
  };

  const suggested_questions = [
    "How many students are in CSE?",
    "Show the top 5 students by CGPA.",
    "Which department has the highest average CGPA?",
    "Find students with skills in Machine Learning.",
    "Show students with attendance below 75%.",
    "Which students are located in Hyderabad?"
  ];

  return {
    answer: state.generated_answer,
    intent: state.intent,
    trace,
    retrieved_students: state.retrieved_students.slice(0, 10).map((s) => ({
      id: s.id,
      student_id: s.student_id,
      first_name: s.first_name,
      last_name: s.last_name,
      department: s.department,
      cgpa: s.cgpa,
      attendance_percentage: s.attendance_percentage,
      skills: s.skills
    })),
    suggested_questions
  };
}

// Full LangGraph Workflow Orchestrator
export async function executeLangGraphWorkflow(
  question: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<ChatResponse> {
  const startTime = Date.now();

  let state: LangGraphState = {
    question,
    conversation_history: history,
    is_valid: true,
    intent: 'sql_query',
    executed_tools: [],
    retrieved_students: [],
    generated_answer: '',
    safety_passed: true,
    start_time: startTime
  };

  // Step 1: validate_question
  state = nodeValidateQuestion(state);

  // Step 2: classify_intent
  state = nodeClassifyIntent(state);

  // Step 3: retrieve_information
  state = await nodeRetrieveInformation(state);

  // Step 4: generate_response
  state = await nodeGenerateResponse(state);

  // Step 5: safety_check
  state = nodeSafetyCheck(state);

  // Step 6: final_response
  return nodeFinalResponse(state);
}
