import { db, ValidationError, ConflictError, NotFoundError } from '../backend/database/db.ts';
import { executeLangGraphWorkflow } from '../backend/ai/langgraphWorkflow.ts';
import { semanticStudentSearch } from '../backend/ai/semanticSearch.ts';

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  message: string;
  duration_ms: number;
}

const results: TestResult[] = [];

async function runTest(category: string, name: string, fn: () => Promise<void> | void) {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    results.push({ name, category, passed: true, message: 'OK', duration_ms: duration });
    console.log(`  ✓ [${category}] ${name} (${duration}ms)`);
  } catch (err: any) {
    const duration = Date.now() - start;
    results.push({ name, category, passed: false, message: err?.message || String(err), duration_ms: duration });
    console.error(`  ✗ [${category}] ${name} - FAILED: ${err?.message || err}`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function main() {
  console.log('====================================================');
  console.log('STUDENT DATABASE & CONVERSATIONAL AI TEST SUITE');
  console.log('====================================================\n');

  // Reset database to ensure clean state
  db.resetToSeed();

  // Test 1: Health & Database Status
  await runTest('Health Check', 'Verify Database Status and Seed Count', () => {
    const status = db.getDatabaseStatus();
    assert(status.total_records >= 25, `Expected at least 25 seed records, got ${status.total_records}`);
    assert(typeof status.is_supabase_connected === 'boolean', 'is_supabase_connected must be boolean');
  });

  // Test 2: Student Retrieval & Pagination
  await runTest('Student CRUD', 'Retrieve all students with pagination', () => {
    const res = db.getAll({ page: 1, limit: 10 });
    assert(res.data.length === 10, `Expected 10 students, got ${res.data.length}`);
    assert(res.total >= 30, `Total should be >= 30, got ${res.total}`);
    assert(res.total_pages >= 3, `Expected at least 3 pages, got ${res.total_pages}`);
  });

  // Test 3: Department Filter
  await runTest('Student CRUD', 'Filter students by department (CSE)', () => {
    const res = db.getAll({ department: 'CSE' });
    assert(res.data.length > 0, 'Expected CSE students to be returned');
    for (const s of res.data) {
      assert(s.department === 'CSE', `Expected department CSE, got ${s.department}`);
    }
  });

  // Test 4: CGPA & Attendance Filters
  await runTest('Student CRUD', 'Filter students with CGPA >= 9.0 and Attendance >= 90', () => {
    const res = db.getAll({ min_cgpa: 9.0, min_attendance: 90 });
    assert(res.data.length > 0, 'Expected high performers list');
    for (const s of res.data) {
      assert(s.cgpa >= 9.0, `Expected CGPA >= 9.0, got ${s.cgpa}`);
      assert(s.attendance_percentage >= 90, `Expected Attendance >= 90, got ${s.attendance_percentage}`);
    }
  });

  // Test 5: Search Query
  await runTest('Student CRUD', 'Fuzzy search by name or skill ("Machine Learning")', () => {
    const res = db.getAll({ search: 'Machine Learning' });
    assert(res.data.length > 0, 'Expected students matching Machine Learning');
  });

  // Test 6: Single Student Retrieval
  await runTest('Student CRUD', 'Retrieve single student by ID', () => {
    const student = db.getById('std-001');
    assert(student.first_name === 'Aarav', `Expected Aarav, got ${student.first_name}`);
    assert(student.student_id === 'STU2021001', `Expected STU2021001, got ${student.student_id}`);
  });

  // Test 7: Student Creation
  let createdId = '';
  await runTest('Student CRUD', 'Create new student with valid inputs', () => {
    const newStudent = db.create({
      student_id: 'STU2025999',
      first_name: 'Vikrant',
      last_name: 'Verma',
      email: 'vikrant.verma@institution.edu',
      phone: '+91-9988776655',
      gender: 'Male',
      age: 21,
      department: 'CSE',
      course: 'B.Tech Computer Science',
      year: 3,
      semester: 6,
      cgpa: 8.85,
      city: 'Hyderabad',
      state: 'Telangana',
      attendance_percentage: 91.5,
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker']
    });
    createdId = newStudent.id;
    assert(newStudent.student_id === 'STU2025999', 'Student ID mismatch');
    assert(newStudent.cgpa === 8.85, 'CGPA mismatch');
  });

  // Test 8: Validation Error Handling (422)
  await runTest('Validation', 'Reject invalid CGPA (> 10.0)', () => {
    let errorCaught = false;
    try {
      db.create({
        student_id: 'STU2025888',
        first_name: 'Invalid',
        last_name: 'CGPA',
        email: 'invalid.cgpa@institution.edu',
        phone: '+91-9988776654',
        gender: 'Male',
        age: 21,
        department: 'CSE',
        course: 'B.Tech',
        year: 3,
        semester: 6,
        cgpa: 11.5, // Invalid!
        city: 'Hyderabad',
        state: 'Telangana',
        attendance_percentage: 85,
        skills: ['Python']
      });
    } catch (err: any) {
      errorCaught = err instanceof ValidationError;
    }
    assert(errorCaught, 'Expected ValidationError on CGPA > 10.0');
  });

  // Test 9: Duplicate Student ID Conflict (409)
  await runTest('Duplicate Handling', 'Reject duplicate student_id', () => {
    let conflictCaught = false;
    try {
      db.create({
        student_id: 'STU2021001', // Already exists!
        first_name: 'Duplicate',
        last_name: 'Student',
        email: 'duplicate.stu@institution.edu',
        phone: '+91-9988776653',
        gender: 'Male',
        age: 22,
        department: 'CSE',
        course: 'B.Tech',
        year: 4,
        semester: 7,
        cgpa: 8.5,
        city: 'Hyderabad',
        state: 'Telangana',
        attendance_percentage: 85,
        skills: ['Java']
      });
    } catch (err: any) {
      conflictCaught = err instanceof ConflictError;
    }
    assert(conflictCaught, 'Expected ConflictError on duplicate student_id');
  });

  // Test 10: Duplicate Email Conflict (409)
  await runTest('Duplicate Handling', 'Reject duplicate student email', () => {
    let conflictCaught = false;
    try {
      db.create({
        student_id: 'STU2025777',
        first_name: 'Unique',
        last_name: 'ID',
        email: 'aarav.sharma@institution.edu', // Duplicate email!
        phone: '+91-9988776652',
        gender: 'Male',
        age: 22,
        department: 'CSE',
        course: 'B.Tech',
        year: 4,
        semester: 7,
        cgpa: 8.5,
        city: 'Hyderabad',
        state: 'Telangana',
        attendance_percentage: 85,
        skills: ['Java']
      });
    } catch (err: any) {
      conflictCaught = err instanceof ConflictError;
    }
    assert(conflictCaught, 'Expected ConflictError on duplicate email');
  });

  // Test 11: Partial Update (PATCH)
  await runTest('Student CRUD', 'Partial update student (PATCH attendance and CGPA)', () => {
    const updated = db.patch(createdId, {
      cgpa: 9.10,
      attendance_percentage: 95.0
    });
    assert(updated.cgpa === 9.10, `Expected 9.10, got ${updated.cgpa}`);
    assert(updated.attendance_percentage === 95.0, `Expected 95.0, got ${updated.attendance_percentage}`);
  });

  // Test 12: Delete Student
  await runTest('Student CRUD', 'Delete student by ID', () => {
    const deleted = db.delete(createdId);
    assert(deleted === true, 'Delete operation returned false');
    let notFoundCaught = false;
    try {
      db.getById(createdId);
    } catch (err: any) {
      notFoundCaught = err instanceof NotFoundError;
    }
    assert(notFoundCaught, 'Student should not be found after deletion');
  });

  // Test 13: Statistics Summary
  await runTest('Analytics', 'Calculate database statistics summary', () => {
    const stats = db.getStatsSummary();
    assert(stats.total_students >= 30, `Expected total_students >= 30, got ${stats.total_students}`);
    assert(stats.average_cgpa > 7.0 && stats.average_cgpa < 10.0, `Invalid average CGPA ${stats.average_cgpa}`);
    assert(stats.attendance_risk_count > 0, 'Expected some students with attendance < 75%');
    assert(Object.keys(stats.department_breakdown).length >= 5, 'Expected at least 5 departments');
  });

  // Test 14: Top Students by CGPA
  await runTest('Analytics', 'Retrieve top 5 students ranked by CGPA', () => {
    const toppers = db.getTopStudents(5);
    assert(toppers.length === 5, `Expected 5 toppers, got ${toppers.length}`);
    for (let i = 0; i < toppers.length - 1; i++) {
      assert(toppers[i].cgpa >= toppers[i + 1].cgpa, 'Toppers must be ordered descending by CGPA');
    }
  });

  // Test 15: Semantic Search
  await runTest('Semantic Search', 'Semantic query for "artificial intelligence and machine learning"', async () => {
    const matches = await semanticStudentSearch('Find students interested in artificial intelligence and deep learning', 5);
    assert(matches.length > 0, 'Expected semantic matches');
    assert(matches[0].score > 0.2, 'Top match should have high semantic relevance');
    assert(matches[0].match_reasons.length > 0, 'Match reasons should be documented');
  });

  // Test 16: Chatbot - Structured Query Workflow
  await runTest('Conversational AI', 'LangGraph workflow: "How many students are in CSE?"', async () => {
    const response = await executeLangGraphWorkflow('How many students are in CSE?');
    assert(response.trace.validated === true, 'Validation node failed');
    assert(response.trace.intent === 'sql_query', `Expected sql_query intent, got ${response.trace.intent}`);
    assert(response.trace.tools_executed.some((t) => t.tool_name === 'count_students' || t.tool_name === 'filter_students'), 'Expected count or filter tool');
    assert(response.answer.length > 0, 'Empty chatbot answer');
  });

  // Test 17: Chatbot - Analytics Query Workflow
  await runTest('Conversational AI', 'LangGraph workflow: "Which department has the highest average CGPA?"', async () => {
    const response = await executeLangGraphWorkflow('Which department has the highest average CGPA?');
    assert(response.trace.intent === 'analytics', `Expected analytics intent, got ${response.trace.intent}`);
    assert(response.trace.tools_executed.some((t) => t.tool_name === 'get_department_statistics'), 'Expected stats tool');
    assert(response.answer.includes('CGPA') || response.answer.includes('department'), 'Answer should discuss CGPA');
  });

  // Test 18: Chatbot - Semantic Query Workflow
  await runTest('Conversational AI', 'LangGraph workflow: "Who has experience with cloud technologies and docker?"', async () => {
    const response = await executeLangGraphWorkflow('Who has experience with cloud technologies and docker?');
    assert(response.trace.intent === 'semantic_search', `Expected semantic_search intent, got ${response.trace.intent}`);
    assert(response.trace.tools_executed.some((t) => t.tool_name === 'semantic_student_search'), 'Expected semantic search tool');
    assert(response.trace.grounded_record_count > 0, 'Expected retrieved student records');
  });

  // Test 19: Chatbot - Anti-Hallucination & Safety Grounding
  await runTest('Conversational AI', 'Anti-Hallucination: Query for non-existent domain ("Quantum Astronautics 99")', async () => {
    const response = await executeLangGraphWorkflow('Find students specializing in Quantum Astronautics 99');
    assert(response.trace.safety_check_passed === true, 'Safety check should handle zero matches safely');
    assert(
      response.answer.includes("don't have enough information") ||
      response.answer.includes("0 matching") ||
      response.answer.includes("no student") ||
      response.retrieved_students?.length === 0,
      'AI must not invent non-existent student profiles'
    );
  });

  // Summary Report
  console.log('\n====================================================');
  console.log('TEST RESULTS SUMMARY:');
  console.log('====================================================');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`TOTAL TESTS:  ${results.length}`);
  console.log(`PASSED:       ${passed}`);
  console.log(`FAILED:       ${failed}`);

  if (failed > 0) {
    console.error('\nFAILED TESTS:');
    results.filter((r) => !r.passed).forEach((r) => {
      console.error(`- [${r.category}] ${r.name}: ${r.message}`);
    });
    process.exit(1);
  } else {
    console.log('\nALL TESTS PASSED SUCCESSFULLY! ✓✓✓\n');
  }
}

main().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
