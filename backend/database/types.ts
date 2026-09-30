export interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  department: string;
  course: string;
  year: number;
  semester: number;
  cgpa: number;
  city: string;
  state: string;
  attendance_percentage: number;
  skills: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateStudentDto {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  department: string;
  course: string;
  year: number;
  semester: number;
  cgpa: number;
  city: string;
  state: string;
  attendance_percentage: number;
  skills: string[];
}

export type UpdateStudentDto = Partial<CreateStudentDto>;

export interface StudentFilterParams {
  department?: string;
  course?: string;
  year?: number;
  semester?: number;
  min_cgpa?: number;
  max_cgpa?: number;
  min_attendance?: number;
  max_attendance?: number;
  city?: string;
  state?: string;
  gender?: string;
  skills?: string | string[];
  search?: string;
  sort_by?: keyof Student;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface StudentStatsSummary {
  total_students: number;
  average_cgpa: number;
  average_attendance: number;
  department_breakdown: Record<string, { count: number; avg_cgpa: number; avg_attendance: number }>;
  gender_distribution: Record<string, number>;
  year_distribution: Record<string, number>;
  attendance_risk_count: number; // < 75% attendance
  cgpa_bracket_distribution: {
    exceptional_9_plus: number;
    first_class_dist_8_to_9: number;
    first_class_7_to_8: number;
    second_class_6_to_7: number;
    pass_class_below_6: number;
  };
  top_skills: Array<{ skill: string; count: number }>;
}

export interface ChatRequest {
  message: string;
  conversation_history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface ToolExecutionRecord {
  tool_name: string;
  parameters: Record<string, any>;
  records_retrieved: number;
  summary: string;
}

export interface LangGraphTrace {
  validated: boolean;
  intent: 'sql_query' | 'analytics' | 'semantic_search' | 'unsupported';
  tools_executed: ToolExecutionRecord[];
  safety_check_passed: boolean;
  grounded_record_count: number;
  latency_ms: number;
}

export interface ChatResponse {
  answer: string;
  intent: string;
  trace: LangGraphTrace;
  retrieved_students?: Partial<Student>[];
  suggested_questions: string[];
}
