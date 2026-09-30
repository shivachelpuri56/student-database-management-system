import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { INITIAL_STUDENTS } from './seedData.ts';
import {
  Student,
  CreateStudentDto,
  UpdateStudentDto,
  StudentFilterParams,
  StudentStatsSummary
} from './types.ts';

export class DatabaseError extends Error {
  status: number;
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'DatabaseError';
    this.status = status;
  }
}

export class ValidationError extends DatabaseError {
  constructor(message: string) {
    super(message, 422);
    this.name = 'ValidationError';
  }
}

export class ConflictError extends DatabaseError {
  constructor(message: string) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

export class NotFoundError extends DatabaseError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class StudentDatabase {
  private students: Map<string, Student> = new Map();
  private supabase: SupabaseClient | null = null;
  private isSupabaseConnected: boolean = false;

  constructor() {
    this.initSupabase();
    this.loadInitialData();
  }

  private initSupabase() {
    const supabaseUrl = process.env.SUPABASE_URL?.trim();
    const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();

    if (supabaseUrl && supabaseKey) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.isSupabaseConnected = true;
      } catch (err) {
        console.warn('Failed to initialize Supabase client, falling back to embedded database:', err);
        this.supabase = null;
        this.isSupabaseConnected = false;
      }
    }
  }

  private loadInitialData() {
    this.students.clear();
    for (const student of INITIAL_STUDENTS) {
      this.students.set(student.id, { ...student });
    }
  }

  public resetToSeed(): number {
    this.loadInitialData();
    return this.students.size;
  }

  public getDatabaseStatus(): {
    provider: 'supabase' | 'embedded_sqlite_compatible';
    is_supabase_connected: boolean;
    total_records: number;
  } {
    return {
      provider: this.isSupabaseConnected ? 'supabase' : 'embedded_sqlite_compatible',
      is_supabase_connected: this.isSupabaseConnected,
      total_records: this.students.size
    };
  }

  // Validation according to academic rules
  private validateStudentData(data: CreateStudentDto, isUpdate: boolean = false, existingId?: string) {
    if (!data.student_id || typeof data.student_id !== 'string' || !data.student_id.trim()) {
      throw new ValidationError('Student ID is required and must be non-empty.');
    }
    const cleanStudentId = data.student_id.trim().toUpperCase();

    if (!data.first_name || typeof data.first_name !== 'string' || !data.first_name.trim()) {
      throw new ValidationError('First name is required.');
    }
    if (!data.last_name || typeof data.last_name !== 'string' || !data.last_name.trim()) {
      throw new ValidationError('Last name is required.');
    }

    if (!data.email || typeof data.email !== 'string' || !data.email.trim()) {
      throw new ValidationError('Email is required.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      throw new ValidationError('Invalid email format provided.');
    }
    const cleanEmail = data.email.trim().toLowerCase();

    if (typeof data.age !== 'number' || isNaN(data.age) || data.age < 16 || data.age > 45) {
      throw new ValidationError('Age must be a valid number between 16 and 45.');
    }

    if (typeof data.cgpa !== 'number' || isNaN(data.cgpa) || data.cgpa < 0 || data.cgpa > 10) {
      throw new ValidationError('CGPA must be a valid number between 0.0 and 10.0.');
    }

    if (
      typeof data.attendance_percentage !== 'number' ||
      isNaN(data.attendance_percentage) ||
      data.attendance_percentage < 0 ||
      data.attendance_percentage > 100
    ) {
      throw new ValidationError('Attendance percentage must be a valid number between 0.0 and 100.0.');
    }

    if (typeof data.year !== 'number' || isNaN(data.year) || data.year < 1 || data.year > 5) {
      throw new ValidationError('Year must be an integer between 1 and 5.');
    }

    if (typeof data.semester !== 'number' || isNaN(data.semester) || data.semester < 1 || data.semester > 10) {
      throw new ValidationError('Semester must be an integer between 1 and 10.');
    }

    if (!data.department || typeof data.department !== 'string' || !data.department.trim()) {
      throw new ValidationError('Department is required.');
    }

    if (!data.course || typeof data.course !== 'string' || !data.course.trim()) {
      throw new ValidationError('Course is required.');
    }

    if (!data.city || typeof data.city !== 'string' || !data.city.trim()) {
      throw new ValidationError('City is required.');
    }

    if (!data.state || typeof data.state !== 'string' || !data.state.trim()) {
      throw new ValidationError('State is required.');
    }

    if (!Array.isArray(data.skills)) {
      throw new ValidationError('Skills must be an array of strings.');
    }

    // Check uniqueness of student_id and email
    for (const [id, s] of this.students.entries()) {
      if (existingId && id === existingId) continue;
      if (s.student_id.toUpperCase() === cleanStudentId) {
        throw new ConflictError(`Student with ID '${data.student_id}' already exists.`);
      }
      if (s.email.toLowerCase() === cleanEmail) {
        throw new ConflictError(`Student with email '${data.email}' already exists.`);
      }
    }
  }

  public getAll(params: StudentFilterParams = {}): {
    data: Student[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  } {
    let list = Array.from(this.students.values());

    // Search query across student_id, name, email, department, city, skills
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter((s) => {
        const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
        const sid = s.student_id.toLowerCase();
        const email = s.email.toLowerCase();
        const dept = s.department.toLowerCase();
        const city = s.city.toLowerCase();
        const course = s.course.toLowerCase();
        const skills = s.skills.map((k) => k.toLowerCase()).join(' ');
        return (
          fullName.includes(q) ||
          sid.includes(q) ||
          email.includes(q) ||
          dept.includes(q) ||
          city.includes(q) ||
          course.includes(q) ||
          skills.includes(q)
        );
      });
    }

    // Filter by department
    if (params.department && params.department.trim()) {
      const dept = params.department.trim().toUpperCase();
      if (dept !== 'ALL') {
        list = list.filter((s) => s.department.toUpperCase() === dept);
      }
    }

    // Filter by course
    if (params.course && params.course.trim()) {
      const c = params.course.trim().toLowerCase();
      list = list.filter((s) => s.course.toLowerCase().includes(c));
    }

    // Filter by year
    if (params.year !== undefined && !isNaN(Number(params.year))) {
      const y = Number(params.year);
      list = list.filter((s) => s.year === y);
    }

    // Filter by semester
    if (params.semester !== undefined && !isNaN(Number(params.semester))) {
      const sem = Number(params.semester);
      list = list.filter((s) => s.semester === sem);
    }

    // Filter by min CGPA
    if (params.min_cgpa !== undefined && !isNaN(Number(params.min_cgpa))) {
      const min = Number(params.min_cgpa);
      list = list.filter((s) => s.cgpa >= min);
    }

    // Filter by max CGPA
    if (params.max_cgpa !== undefined && !isNaN(Number(params.max_cgpa))) {
      const max = Number(params.max_cgpa);
      list = list.filter((s) => s.cgpa <= max);
    }

    // Filter by min attendance
    if (params.min_attendance !== undefined && !isNaN(Number(params.min_attendance))) {
      const min = Number(params.min_attendance);
      list = list.filter((s) => s.attendance_percentage >= min);
    }

    // Filter by max attendance
    if (params.max_attendance !== undefined && !isNaN(Number(params.max_attendance))) {
      const max = Number(params.max_attendance);
      list = list.filter((s) => s.attendance_percentage <= max);
    }

    // Filter by city
    if (params.city && params.city.trim()) {
      const city = params.city.trim().toLowerCase();
      list = list.filter((s) => s.city.toLowerCase() === city);
    }

    // Filter by gender
    if (params.gender && params.gender.trim() && params.gender !== 'ALL') {
      const gender = params.gender.trim().toLowerCase();
      list = list.filter((s) => s.gender.toLowerCase() === gender);
    }

    // Filter by skills
    if (params.skills) {
      const skillFilters = (Array.isArray(params.skills) ? params.skills : [params.skills])
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);

      if (skillFilters.length > 0) {
        list = list.filter((s) => {
          const studentSkills = s.skills.map((k) => k.toLowerCase());
          return skillFilters.some((sk) => studentSkills.some((ssk) => ssk.includes(sk)));
        });
      }
    }

    // Sorting
    const sortBy = params.sort_by || 'student_id';
    const sortOrder = params.sort_order === 'desc' ? -1 : 1;

    list.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * sortOrder;
      }
      return String(valA).localeCompare(String(valB)) * sortOrder;
    });

    const total = list.length;
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 50));
    const total_pages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const data = list.slice(startIndex, startIndex + limit);

    return {
      data,
      total,
      page,
      limit,
      total_pages
    };
  }

  public getById(idOrStudentId: string): Student {
    if (!idOrStudentId || !idOrStudentId.trim()) {
      throw new ValidationError('ID parameter is required.');
    }
    const clean = idOrStudentId.trim();

    // Check direct ID match
    const byId = this.students.get(clean);
    if (byId) return byId;

    // Check student_id match
    for (const student of this.students.values()) {
      if (student.student_id.toUpperCase() === clean.toUpperCase()) {
        return student;
      }
    }

    throw new NotFoundError(`Student with identifier '${idOrStudentId}' was not found.`);
  }

  public create(dto: CreateStudentDto): Student {
    this.validateStudentData(dto, false);

    const now = new Date().toISOString();
    const id = `std-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    const newStudent: Student = {
      id,
      student_id: dto.student_id.trim().toUpperCase(),
      first_name: dto.first_name.trim(),
      last_name: dto.last_name.trim(),
      email: dto.email.trim().toLowerCase(),
      phone: dto.phone.trim(),
      gender: dto.gender,
      age: Number(dto.age),
      department: dto.department.trim().toUpperCase(),
      course: dto.course.trim(),
      year: Number(dto.year),
      semester: Number(dto.semester),
      cgpa: Math.round(Number(dto.cgpa) * 100) / 100,
      city: dto.city.trim(),
      state: dto.state.trim(),
      attendance_percentage: Math.round(Number(dto.attendance_percentage) * 10) / 10,
      skills: dto.skills.map((s) => s.trim()).filter(Boolean),
      created_at: now,
      updated_at: now
    };

    this.students.set(id, newStudent);
    return newStudent;
  }

  public update(idOrStudentId: string, dto: CreateStudentDto): Student {
    const existing = this.getById(idOrStudentId);
    this.validateStudentData(dto, true, existing.id);

    const now = new Date().toISOString();
    const updated: Student = {
      ...existing,
      student_id: dto.student_id.trim().toUpperCase(),
      first_name: dto.first_name.trim(),
      last_name: dto.last_name.trim(),
      email: dto.email.trim().toLowerCase(),
      phone: dto.phone.trim(),
      gender: dto.gender,
      age: Number(dto.age),
      department: dto.department.trim().toUpperCase(),
      course: dto.course.trim(),
      year: Number(dto.year),
      semester: Number(dto.semester),
      cgpa: Math.round(Number(dto.cgpa) * 100) / 100,
      city: dto.city.trim(),
      state: dto.state.trim(),
      attendance_percentage: Math.round(Number(dto.attendance_percentage) * 10) / 10,
      skills: dto.skills.map((s) => s.trim()).filter(Boolean),
      updated_at: now
    };

    this.students.set(existing.id, updated);
    return updated;
  }

  public patch(idOrStudentId: string, dto: UpdateStudentDto): Student {
    const existing = this.getById(idOrStudentId);

    // Merge for validation
    const merged: CreateStudentDto = {
      student_id: dto.student_id !== undefined ? dto.student_id : existing.student_id,
      first_name: dto.first_name !== undefined ? dto.first_name : existing.first_name,
      last_name: dto.last_name !== undefined ? dto.last_name : existing.last_name,
      email: dto.email !== undefined ? dto.email : existing.email,
      phone: dto.phone !== undefined ? dto.phone : existing.phone,
      gender: dto.gender !== undefined ? dto.gender : existing.gender,
      age: dto.age !== undefined ? dto.age : existing.age,
      department: dto.department !== undefined ? dto.department : existing.department,
      course: dto.course !== undefined ? dto.course : existing.course,
      year: dto.year !== undefined ? dto.year : existing.year,
      semester: dto.semester !== undefined ? dto.semester : existing.semester,
      cgpa: dto.cgpa !== undefined ? dto.cgpa : existing.cgpa,
      city: dto.city !== undefined ? dto.city : existing.city,
      state: dto.state !== undefined ? dto.state : existing.state,
      attendance_percentage: dto.attendance_percentage !== undefined ? dto.attendance_percentage : existing.attendance_percentage,
      skills: dto.skills !== undefined ? dto.skills : existing.skills
    };

    this.validateStudentData(merged, true, existing.id);

    const now = new Date().toISOString();
    const updated: Student = {
      ...existing,
      ...merged,
      student_id: merged.student_id.trim().toUpperCase(),
      email: merged.email.trim().toLowerCase(),
      updated_at: now
    };

    this.students.set(existing.id, updated);
    return updated;
  }

  public delete(idOrStudentId: string): boolean {
    const existing = this.getById(idOrStudentId);
    return this.students.delete(existing.id);
  }

  public getStatsSummary(): StudentStatsSummary {
    const all = Array.from(this.students.values());
    const total_students = all.length;

    if (total_students === 0) {
      return {
        total_students: 0,
        average_cgpa: 0,
        average_attendance: 0,
        department_breakdown: {},
        gender_distribution: {},
        year_distribution: {},
        attendance_risk_count: 0,
        cgpa_bracket_distribution: {
          exceptional_9_plus: 0,
          first_class_dist_8_to_9: 0,
          first_class_7_to_8: 0,
          second_class_6_to_7: 0,
          pass_class_below_6: 0
        },
        top_skills: []
      };
    }

    const totalCgpa = all.reduce((acc, s) => acc + s.cgpa, 0);
    const totalAttendance = all.reduce((acc, s) => acc + s.attendance_percentage, 0);

    const departmentMap: Record<string, { count: number; sumCgpa: number; sumAtt: number }> = {};
    const genderMap: Record<string, number> = {};
    const yearMap: Record<string, number> = {};
    const skillCounts: Record<string, number> = {};

    let attendance_risk_count = 0;
    const cgpa_bracket_distribution = {
      exceptional_9_plus: 0,
      first_class_dist_8_to_9: 0,
      first_class_7_to_8: 0,
      second_class_6_to_7: 0,
      pass_class_below_6: 0
    };

    for (const s of all) {
      // Dept
      const dept = s.department || 'OTHER';
      if (!departmentMap[dept]) {
        departmentMap[dept] = { count: 0, sumCgpa: 0, sumAtt: 0 };
      }
      departmentMap[dept].count++;
      departmentMap[dept].sumCgpa += s.cgpa;
      departmentMap[dept].sumAtt += s.attendance_percentage;

      // Gender
      genderMap[s.gender] = (genderMap[s.gender] || 0) + 1;

      // Year
      const yKey = `Year ${s.year}`;
      yearMap[yKey] = (yearMap[yKey] || 0) + 1;

      // Attendance risk
      if (s.attendance_percentage < 75) {
        attendance_risk_count++;
      }

      // CGPA bracket
      if (s.cgpa >= 9.0) {
        cgpa_bracket_distribution.exceptional_9_plus++;
      } else if (s.cgpa >= 8.0) {
        cgpa_bracket_distribution.first_class_dist_8_to_9++;
      } else if (s.cgpa >= 7.0) {
        cgpa_bracket_distribution.first_class_7_to_8++;
      } else if (s.cgpa >= 6.0) {
        cgpa_bracket_distribution.second_class_6_to_7++;
      } else {
        cgpa_bracket_distribution.pass_class_below_6++;
      }

      // Skills
      for (const skill of s.skills) {
        const cleanSkill = skill.trim();
        if (cleanSkill) {
          skillCounts[cleanSkill] = (skillCounts[cleanSkill] || 0) + 1;
        }
      }
    }

    const department_breakdown: Record<string, { count: number; avg_cgpa: number; avg_attendance: number }> = {};
    for (const [dept, metrics] of Object.entries(departmentMap)) {
      department_breakdown[dept] = {
        count: metrics.count,
        avg_cgpa: Math.round((metrics.sumCgpa / metrics.count) * 100) / 100,
        avg_attendance: Math.round((metrics.sumAtt / metrics.count) * 10) / 10
      };
    }

    const top_skills = Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total_students,
      average_cgpa: Math.round((totalCgpa / total_students) * 100) / 100,
      average_attendance: Math.round((totalAttendance / total_students) * 10) / 10,
      department_breakdown,
      gender_distribution: genderMap,
      year_distribution: yearMap,
      attendance_risk_count,
      cgpa_bracket_distribution,
      top_skills
    };
  }

  public getTopStudents(limit: number = 5, department?: string): Student[] {
    let list = Array.from(this.students.values());
    if (department && department.trim() && department.toUpperCase() !== 'ALL') {
      const d = department.trim().toUpperCase();
      list = list.filter((s) => s.department.toUpperCase() === d);
    }

    list.sort((a, b) => {
      if (b.cgpa !== a.cgpa) return b.cgpa - a.cgpa;
      return b.attendance_percentage - a.attendance_percentage;
    });

    return list.slice(0, Math.max(1, limit));
  }
}

export const db = new StudentDatabase();
