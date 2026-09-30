import {
  Student,
  CreateStudentDto,
  UpdateStudentDto,
  StudentFilterParams,
  StudentStatsSummary,
  ChatResponse,
  SystemHealth
} from '../types.ts';

const BASE_URL = '';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Request failed with status ${res.status}`;
    try {
      const errorJson = await res.json();
      errorMsg = errorJson.message || errorJson.error || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export async function fetchHealth(): Promise<SystemHealth> {
  const res = await fetch(`${BASE_URL}/health`);
  return handleResponse<SystemHealth>(res);
}

export async function fetchStudents(params: StudentFilterParams = {}): Promise<{
  data: Student[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });

  const res = await fetch(`${BASE_URL}/api/students?${query.toString()}`);
  return handleResponse(res);
}

export async function fetchStudentById(id: string): Promise<Student> {
  const res = await fetch(`${BASE_URL}/api/students/${encodeURIComponent(id)}`);
  return handleResponse<Student>(res);
}

export async function createStudent(data: CreateStudentDto): Promise<Student> {
  const res = await fetch(`${BASE_URL}/api/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse<Student>(res);
}

export async function updateStudent(id: string, data: CreateStudentDto): Promise<Student> {
  const res = await fetch(`${BASE_URL}/api/students/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse<Student>(res);
}

export async function patchStudent(id: string, data: UpdateStudentDto): Promise<Student> {
  const res = await fetch(`${BASE_URL}/api/students/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse<Student>(res);
}

export async function deleteStudent(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/students/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    let errorMsg = `Failed to delete student (${res.status})`;
    try {
      const errorJson = await res.json();
      errorMsg = errorJson.message || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
}

export async function fetchStatsSummary(): Promise<StudentStatsSummary> {
  const res = await fetch(`${BASE_URL}/api/students/stats/summary`);
  return handleResponse<StudentStatsSummary>(res);
}

export async function fetchTopStudents(limit: number = 5, department?: string): Promise<Student[]> {
  const query = new URLSearchParams({ limit: String(limit) });
  if (department && department !== 'ALL') {
    query.append('department', department);
  }
  const res = await fetch(`${BASE_URL}/api/students/stats/top?${query.toString()}`);
  return handleResponse<Student[]>(res);
}

export async function sendChatMessage(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<ChatResponse> {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversation_history: history })
  });
  return handleResponse<ChatResponse>(res);
}

export async function reseedDatabase(): Promise<{ message: string; records_seeded: number }> {
  const res = await fetch(`${BASE_URL}/api/students/seed`, {
    method: 'POST'
  });
  return handleResponse(res);
}
