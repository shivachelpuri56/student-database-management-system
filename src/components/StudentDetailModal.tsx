import React from 'react';
import { X, Award, Calendar, MapPin, Mail, Phone, BookOpen, Clock, Edit2 } from 'lucide-react';
import { Student } from '../types.ts';

interface StudentDetailModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  isOpen,
  onClose,
  onEdit
}) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="bg-slate-900 p-6 text-white flex items-start justify-between">
          <div>
            <div className="text-xs font-mono text-indigo-400 font-semibold tracking-wider uppercase">
              {student.student_id} · {student.department}
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1">
              {student.first_name} {student.last_name}
            </h2>
            <div className="text-xs text-slate-300 mt-0.5">
              {student.course}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Key Academic Metrics */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                <span>Cumulative CGPA</span>
              </div>
              <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
                {student.cgpa.toFixed(2)}
                <span className="text-xs text-slate-400 font-normal"> / 10.0</span>
              </div>
              <div className="text-[11px] font-medium text-slate-600 mt-0.5">
                {student.cgpa >= 9.0
                  ? 'First Class with Distinction'
                  : student.cgpa >= 8.0
                  ? 'First Class'
                  : 'Second Class'}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Attendance Rate</span>
              </div>
              <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
                {student.attendance_percentage.toFixed(1)}%
              </div>
              <div
                className={`text-[11px] font-medium mt-0.5 ${
                  student.attendance_percentage < 75 ? 'text-amber-600' : 'text-emerald-700'
                }`}
              >
                {student.attendance_percentage < 75
                  ? 'At Risk (Below 75%)'
                  : 'Eligible for Examination'}
              </div>
            </div>
          </div>

          {/* Academic Progression */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Academic Progression
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Academic Year</span>
                <span className="font-semibold text-slate-900 font-mono tabular-nums">Year {student.year}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Current Semester</span>
                <span className="font-semibold text-slate-900 font-mono tabular-nums">Semester {student.semester}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Gender & Age</span>
                <span className="font-semibold text-slate-900">{student.gender} · {student.age} yrs</span>
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Contact & Location
            </h3>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono text-slate-800">{student.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono text-slate-800">{student.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{student.city}, {student.state}</span>
              </div>
            </div>
          </div>

          {/* Technical Skills */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Technical Skills & Proficiencies
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {student.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs bg-slate-100 text-slate-800 rounded-md font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Timestamps */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums">
            <span>Registered: {new Date(student.created_at).toLocaleDateString()}</span>
            <span>Updated: {new Date(student.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onEdit(student);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-300 rounded-lg transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
