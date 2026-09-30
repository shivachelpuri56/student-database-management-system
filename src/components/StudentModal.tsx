import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Student, CreateStudentDto } from '../types.ts';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStudentDto) => Promise<void>;
  student?: Student | null; // If provided, edit mode; else create mode
  isSubmitting: boolean;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  student,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<CreateStudentDto>({
    student_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: 'Male',
    age: 20,
    department: 'CSE',
    course: 'B.Tech Computer Science & Engineering',
    year: 3,
    semester: 5,
    cgpa: 8.5,
    city: 'Hyderabad',
    state: 'Telangana',
    attendance_percentage: 85.0,
    skills: []
  });

  const [skillsInput, setSkillsInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setFormData({
        student_id: student.student_id,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        phone: student.phone,
        gender: student.gender,
        age: student.age,
        department: student.department,
        course: student.course,
        year: student.year,
        semester: student.semester,
        cgpa: student.cgpa,
        city: student.city,
        state: student.state,
        attendance_percentage: student.attendance_percentage,
        skills: [...student.skills]
      });
      setSkillsInput(student.skills.join(', '));
    } else {
      setFormData({
        student_id: `STU${new Date().getFullYear()}${Math.floor(100 + Math.random() * 900)}`,
        first_name: '',
        last_name: '',
        email: '',
        phone: '+91-',
        gender: 'Male',
        age: 20,
        department: 'CSE',
        course: 'B.Tech Computer Science & Engineering',
        year: 2,
        semester: 3,
        cgpa: 8.5,
        city: 'Hyderabad',
        state: 'Telangana',
        attendance_percentage: 88.0,
        skills: ['Python', 'SQL', 'Data Structures']
      });
      setSkillsInput('Python, SQL, Data Structures');
    }
    setErrorMessage(null);
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side quick validations
    if (!formData.student_id.trim()) {
      setErrorMessage('Student ID is required.');
      return;
    }
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setErrorMessage('First and Last names are required.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('A valid email address is required.');
      return;
    }
    if (formData.cgpa < 0 || formData.cgpa > 10) {
      setErrorMessage('CGPA must be between 0.0 and 10.0.');
      return;
    }
    if (formData.attendance_percentage < 0 || formData.attendance_percentage > 100) {
      setErrorMessage('Attendance percentage must be between 0.0% and 100.0%.');
      return;
    }
    if (formData.age < 16 || formData.age > 45) {
      setErrorMessage('Age must be between 16 and 45.');
      return;
    }

    const parsedSkills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await onSubmit({
        ...formData,
        skills: parsedSkills
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save student record.');
    }
  };

  const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {student ? 'Edit Student Record' : 'Register New Student'}
            </h2>
            <p className="text-xs text-slate-500">
              Enter verified academic details for database persistence
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Student ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student ID *
              </label>
              <input
                type="text"
                required
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
                placeholder="STU2024001"
              />
            </div>

            {/* First Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                placeholder="Aarav"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                placeholder="Sharma"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                placeholder="student@institution.edu"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
                placeholder="+91-9876543210"
              />
            </div>

            {/* Gender & Age */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  min="16"
                  max="45"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono tabular-nums"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Course */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title *</label>
              <input
                type="text"
                required
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                placeholder="B.Tech Computer Science & Engineering"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Year (1-4)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono tabular-nums"
              />
            </div>

            {/* Semester */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Semester (1-8)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono tabular-nums"
              />
            </div>

            {/* CGPA */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CGPA (0 - 10)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono tabular-nums font-semibold text-indigo-700"
              />
            </div>

            {/* Attendance */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Attendance %</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.attendance_percentage}
                onChange={(e) => setFormData({ ...formData, attendance_percentage: Number(e.target.value) })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                placeholder="Hyderabad"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                placeholder="Telangana"
              />
            </div>
          </div>

          {/* Technical Skills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Technical Skills & Competencies (comma-separated)
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
              placeholder="Python, Machine Learning, SQL, React, Docker"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Used by semantic search and conversational AI for competency matching
            </p>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : student ? 'Save Changes' : 'Register Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
