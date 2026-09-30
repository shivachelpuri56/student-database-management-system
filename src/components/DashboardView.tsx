import React from 'react';
import {
  Users,
  Award,
  CalendarCheck,
  AlertTriangle,
  Building2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Search
} from 'lucide-react';
import { Student, StudentStatsSummary } from '../types.ts';

interface DashboardViewProps {
  stats: StudentStatsSummary | null;
  students: Student[];
  onNavigateToTab: (tab: 'dashboard' | 'students' | 'analytics' | 'chat' | 'docs') => void;
  onSelectStudent: (student: Student) => void;
  onAskAiPrompt: (prompt: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  students,
  onNavigateToTab,
  onSelectStudent,
  onAskAiPrompt
}) => {
  const recentStudents = students.slice(0, 6);

  const samplePrompts = [
    "How many students are enrolled in CSE?",
    "Show the top 5 students by CGPA.",
    "Which department has the highest average CGPA?",
    "Find students with Machine Learning and Deep Learning skills."
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white border border-slate-800 shadow-sm">
        <div className="max-w-3xl space-y-2">
          <div className="text-xs font-semibold tracking-wider uppercase text-indigo-400">
            Academic Capstone System · Production Demo
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Student Database & Conversational Intelligence
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Centralized academic records management integrated with PostgreSQL, RESTful CRUD endpoints,
            comprehensive statistical analytics, and a LangGraph-orchestrated AI engine grounded strictly in verified student data.
          </p>
        </div>

        {/* Quick Actions Row */}
        <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => onNavigateToTab('students')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-white text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Browse Directory</span>
          </button>
          <button
            onClick={() => onNavigateToTab('chat')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Conversational AI</span>
          </button>
          <button
            onClick={() => onNavigateToTab('docs')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
          >
            <span>Interactive Swagger API Docs</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards (60-30-10 palette with Tabular Numerals) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Enrolled</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {stats?.total_students ?? students.length}
          </div>
          <div className="mt-1 text-xs text-slate-500">Active student profiles</div>
        </div>

        {/* Average CGPA */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Average CGPA</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {stats?.average_cgpa ?? '8.65'} <span className="text-xs text-slate-400 font-normal">/ 10</span>
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Institute Cumulative</span>
          </div>
        </div>

        {/* Average Attendance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Average Attendance</span>
            <CalendarCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {stats?.average_attendance ?? '88.4'}%
          </div>
          <div className="mt-1 text-xs text-slate-500">Required min: 75.0%</div>
        </div>

        {/* Departments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Departments</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {stats ? Object.keys(stats.department_breakdown).length : 6}
          </div>
          <div className="mt-1 text-xs text-slate-500">CSE, ECE, EEE, MECH, CIVIL, IT</div>
        </div>

        {/* Attendance Risk */}
        <div className="bg-white p-5 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 text-xs font-medium">
            <span>Attendance Risk</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 font-mono tabular-nums">
            {stats?.attendance_risk_count ?? 4}
          </div>
          <div className="mt-1 text-xs text-amber-700 font-medium">Below 75% threshold</div>
        </div>
      </div>

      {/* 2-Column Section: Department Distribution & Conversational AI Launcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Performance Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Department Academic Metrics</h2>
              <p className="text-xs text-slate-500">Comparative student enrollment, average CGPA, and attendance rate</p>
            </div>
            <button
              onClick={() => onNavigateToTab('analytics')}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View Full Analytics</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Enrolled</th>
                  <th className="py-2.5 px-3">Average CGPA</th>
                  <th className="py-2.5 px-3">Attendance</th>
                  <th className="py-2.5 px-3">Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {stats &&
                  Object.entries(stats.department_breakdown).map(([dept, m]) => (
                    <tr key={dept} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900 font-sans">{dept}</td>
                      <td className="py-3 px-3">{m.count} students</td>
                      <td className="py-3 px-3">
                        <span className={`font-semibold ${m.avg_cgpa >= 9.0 ? 'text-indigo-600' : m.avg_cgpa >= 8.0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {m.avg_cgpa.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`${m.avg_attendance < 75 ? 'text-amber-600 font-semibold' : 'text-slate-700'}`}>
                          {m.avg_attendance.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-3 font-sans text-xs">
                        {m.avg_cgpa >= 9.0 ? (
                          <span className="text-indigo-700 font-medium">Distinction</span>
                        ) : m.avg_cgpa >= 8.0 ? (
                          <span className="text-emerald-700 font-medium">First Class</span>
                        ) : (
                          <span className="text-slate-600">Standard</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Chatbot Quick Prompts Panel */}
        <div className="bg-gradient-to-b from-indigo-50/40 via-white to-white rounded-xl border border-indigo-100 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Grounded Conversational AI</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ask natural-language queries answered with verified database data via a LangGraph-style pipeline with zero hallucination.
            </p>

            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Suggested Prompts
              </div>
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onAskAiPrompt(prompt)}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 text-xs text-slate-700 transition-all flex items-center justify-between group"
                >
                  <span className="line-clamp-1">{prompt}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-1 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => onNavigateToTab('chat')}
              className="w-full py-2 px-3 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg text-center transition-colors shadow-xs"
            >
              Open Full Chat Experience
            </button>
          </div>
        </div>

      </div>

      {/* Recent Students Directory Snapshot */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent Student Admissions</h2>
            <p className="text-xs text-slate-500">Preview of active student profiles across engineering disciplines</p>
          </div>
          <button
            onClick={() => onNavigateToTab('students')}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All Students ({students.length})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentStudents.map((student) => (
            <div
              key={student.id}
              onClick={() => onSelectStudent(student)}
              className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer bg-white group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-mono font-medium text-slate-500">
                    {student.student_id}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {student.first_name} {student.last_name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold font-mono tabular-nums text-slate-900">
                    {student.cgpa.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                    {student.attendance_percentage}% att.
                  </div>
                </div>
              </div>

              {/* Department & Academic Info (Clean typography without pill badges) */}
              <div className="mt-2.5 text-xs text-slate-500 flex items-center gap-2">
                <span className="font-medium text-slate-700">{student.department}</span>
                <span aria-hidden="true">·</span>
                <span>Year {student.year}, Sem {student.semester}</span>
                <span aria-hidden="true">·</span>
                <span>{student.city}</span>
              </div>

              {/* Skills summary */}
              <div className="mt-2 text-xs text-slate-600 line-clamp-1">
                {student.skills.slice(0, 3).join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
