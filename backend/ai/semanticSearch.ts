import { Student } from '../database/types.ts';
import { db } from '../database/db.ts';
import { getGeminiClient } from './geminiClient.ts';

// Semantic synonym dictionary to map natural language intents to technical domains
const CONCEPT_ONTOLOGY: Record<string, string[]> = {
  'artificial intelligence': ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural networks', 'transformers', 'nlp', 'computer vision', 'pytorch', 'tensorflow', 'large language models', 'llms'],
  'machine learning': ['ml', 'machine learning', 'deep learning', 'data science', 'pytorch', 'tensorflow', 'scikit-learn', 'algorithms', 'opencv'],
  'web development': ['react', 'javascript', 'typescript', 'node.js', 'frontend', 'html/css', 'express', 'full stack', 'full stack development', 'tailwind css'],
  'cloud computing': ['cloud computing', 'aws', 'docker', 'kubernetes', 'devops', 'terraform', 'microservices', 'linux', 'cloud'],
  'data science': ['data science', 'sql', 'python', 'tableau', 'r', 'data structures', 'statistics', 'analytics'],
  'cybersecurity': ['cybersecurity', 'network security', 'ethical hacking', 'cryptography', 'penetration testing', 'linux', 'security'],
  'embedded systems': ['embedded systems', 'iot', 'arduino', 'microcontrollers', 'vlsi', 'signal processing', 'c', 'c++', 'verilog', 'fpga'],
  'robotics & mechatronics': ['robotics', 'mechatronics', 'automation', 'solidworks', 'ansys', 'autocad', '3d printing', 'plc programming', 'scada'],
  'electrical & renewable energy': ['power systems', 'smart grids', 'renewable energy', 'solar pv design', 'power electronics', 'electric vehicles', 'battery management', 'simulink', 'matlab'],
  'civil & structural engineering': ['staad pro', 'autocad', 'revit', 'gis', 'surveying', 'structural analysis', 'geotechnical engineering', 'environmental engineering']
};

export interface SemanticSearchResult {
  student: Student;
  score: number;
  match_reasons: string[];
}

export function buildStudentDocument(s: Student): string {
  return `${s.first_name} ${s.last_name} (${s.student_id}) Department: ${s.department} Course: ${s.course} Year: ${s.year} Semester: ${s.semester} CGPA: ${s.cgpa} Attendance: ${s.attendance_percentage}% Location: ${s.city}, ${s.state} Technical Skills: ${s.skills.join(', ')}`;
}

function matchesSkillWord(query: string, skill: string): boolean {
  const clean = skill.trim().toLowerCase();
  // Escape regex special chars (like C++, C#)
  const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
  return regex.test(query);
}

// Tokenize and extract n-grams
function extractTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9#+/\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

// Cosine similarity between two frequency vectors
function calculateCosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const [term, weightA] of vecA.entries()) {
    normA += weightA * weightA;
    const weightB = vecB.get(term);
    if (weightB) {
      dotProduct += weightA * weightB;
    }
  }

  for (const weightB of vecB.values()) {
    normB += weightB * weightB;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Semantic student search
export async function semanticStudentSearch(
  query: string,
  topK: number = 5,
  filterDepartment?: string
): Promise<SemanticSearchResult[]> {
  const queryTokens = extractTokens(query);
  const normalizedQuery = query.toLowerCase();

  // Identify ontological concepts matching the query
  const matchedConcepts: string[] = [];
  const expandedTerms = new Set<string>(queryTokens);

  for (const [concept, keywords] of Object.entries(CONCEPT_ONTOLOGY)) {
    if (
      normalizedQuery.includes(concept) ||
      keywords.some((kw) => matchesSkillWord(normalizedQuery, kw))
    ) {
      matchedConcepts.push(concept);
      keywords.forEach((kw) => {
        extractTokens(kw).forEach((t) => expandedTerms.add(t));
      });
    }
  }

  // Build query term vector with boost for ontological keywords
  const queryVec = new Map<string, number>();
  for (const token of queryTokens) {
    queryVec.set(token, (queryVec.get(token) || 0) + 2.0);
  }
  for (const term of expandedTerms) {
    if (!queryVec.has(term)) {
      queryVec.set(term, 1.0);
    }
  }

  const { data: allStudents } = db.getAll({
    department: filterDepartment,
    limit: 100
  });

  const results: SemanticSearchResult[] = [];

  for (const student of allStudents) {
    const docText = buildStudentDocument(student);
    const docTokens = extractTokens(docText);

    const docVec = new Map<string, number>();
    for (const token of docTokens) {
      docVec.set(token, (docVec.get(token) || 0) + 1.0);
    }

    // Direct skill boost with word-boundary matching
    let directSkillMatchCount = 0;
    const matchReasons: string[] = [];

    for (const skill of student.skills) {
      const cleanSkill = skill.toLowerCase();
      if (matchesSkillWord(normalizedQuery, cleanSkill)) {
        directSkillMatchCount += 2;
        matchReasons.push(`Direct skill match: ${skill}`);
      } else {
        // Concept match
        for (const concept of matchedConcepts) {
          const conceptKeywords = CONCEPT_ONTOLOGY[concept] || [];
          if (conceptKeywords.some((kw) => matchesSkillWord(cleanSkill, kw) || matchesSkillWord(kw, cleanSkill))) {
            directSkillMatchCount += 1.5;
            matchReasons.push(`Domain expertise (${concept}): ${skill}`);
            break;
          }
        }
      }
    }

    // Cosine similarity
    const baseCosine = calculateCosineSimilarity(queryVec, docVec);
    // Combine base text cosine similarity with semantic domain boost
    const finalScore = Math.min(1.0, baseCosine * 0.5 + (directSkillMatchCount * 0.12));

    if (matchReasons.length > 0 || (finalScore >= 0.3 && matchedConcepts.length > 0)) {
      results.push({
        student,
        score: Math.round(finalScore * 100) / 100,
        match_reasons: Array.from(new Set(matchReasons)).slice(0, 3)
      });
    }
  }

  // Sort descending by relevance score, secondary sort by CGPA
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.student.cgpa - a.student.cgpa;
  });

  return results.slice(0, topK);
}
