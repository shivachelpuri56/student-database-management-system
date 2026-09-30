import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  AlertTriangle,
  BarChart3,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Student, StudentStatsSummary } from '../types.ts';
import { fetchTopStudents } from '../services/api.ts';

interface AnalyticsViewProps {
  stats: StudentStatsSummary | null;
  onSelectStudent: (student: Student) => void;
  onAskAiPrompt: (prompt: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  stats,
  onSelectStudent,
  onAskAiPrompt
}) => {
  const [topStudents, setTopStudents] = useState<Student[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [isLoadingTop, setIsLoadingTop] = useState(false);

  useEffect(() => {
    async function loadToppers() {
      setIsLoadingTop(true);
      try {
        const data = await fetchTopStudents(5, selectedDept);
        setTopStudents(data);
      } catch (err) {
        console.error('Failed to load toppers:', err);
      } finally {
        setIsLoadingTop(false);
      }
    }
    loadToppers();
  }, [selectedDept]);

  const departments = ['ALL', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Academic Analytics & Statistics
        </h1>
        <p className="text-xs text-slate-500">
          Institutional grade distributions, department benchmarks, attendance audits, and top performers
        </p>
      </div>

      {/* Top 5 Toppers Section with Department Filter */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Academic Merit List (Top Performers by CGPA)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Ranked highest cumulative grade point averages
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filter Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'Entire Institute' : d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoadingTop ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading top performers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Student ID</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">CGPA</th>
                  <th className="py-2.5 px-3">Attendance</th>
                  <th className="py-2.5 px-3">Key Skills</th>
                  <th className="py-2.5 px-3 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {topStudents.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-bold text-indigo-700">#{idx + 1}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">{s.student_id}</td>
                    <td className="py-3 px-3 font-sans font-semibold text-slate-900">{s.first_name} {s.last_name}</td>
                    <td className="py-3 px-3 font-sans font-medium text-slate-700">{s.department}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-indigo-600 text-sm">{s.cgpa.toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-3">{s.attendance_percentage.toFixed(1)}%</td>
                    <td className="py-3 px-3 font-sans text-[11px] text-slate-600 max-w-[200px] truncate">
                      {s.skills.slice(0, 3).join(', ')}
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      <button
                        onClick={() => onSelectStudent(s)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2-Column: Department Metrics & CGPA Bracket Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Average CGPA Comparison */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Department CGPA Benchmarks</h2>
              <p className="text-xs text-slate-500">Average CGPA across enrolled departments</p>
            </div>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3.5">
            {stats &&
              Object.entries(stats.department_breakdown)
                .sort((a, b) => b[1].avg_cgpa - a[1].avg_cgpa)
                .map(([dept, m]) => {
                  const percentage = (m.avg_cgpa / 10.0) * 100;
                  return (
                    <div key={dept} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{dept}</span>
                        <span className="font-mono tabular-nums font-bold text-slate-900">
                          {m.avg_cgpa.toFixed(2)} <span className="text-slate-400 font-normal">/ 10</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            m.avg_cgpa >= 9.0
                              ? 'bg-indigo-600'
                              : m.avg_cgpa >= 8.0
                              ? 'bg-emerald-600'
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums">
                        <span>{m.count} enrolled students</span>
                        <span>Avg Attendance: {m.avg_attendance.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>

        {/* CGPA Distribution Brackets */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">CGPA Bracket Distribution</h2>
              <p className="text-xs text-slate-500">Academic performance classification</p>
            </div>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>

          {stats && (
            <div className="space-y-3">
              {/* 9.0+ */}
              <div className="p-3 rounded-lg border border-indigo-100 bg-indigo-50/20 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-indigo-950">Exceptional (&ge; 9.0)</div>
                  <div className="text-[11px] text-indigo-700">First Class with Distinction Honors</div>
                </div>
                <div className="text-xl font-bold font-mono tabular-nums text-indigo-600">
                  {stats.cgpa_bracket_distribution.exceptional_9_plus}
                </div>
              </div>

              {/* 8.0 - 8.99 */}
              <div className="p-3 rounded-lg border border-emerald-100 bg-emerald-50/20 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-emerald-950">First Class Distinction (8.0 - 8.99)</div>
                  <div className="text-[11px] text-emerald-700">Top Tier Academic Standing</div>
                </div>
                <div className="text-xl font-bold font-mono tabular-nums text-emerald-600">
                  {stats.cgpa_bracket_distribution.first_class_dist_8_to_9}
                </div>
              </div>

              {/* 7.0 - 7.99 */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900">First Class (7.0 - 7.99)</div>
                  <div className="text-[11px] text-slate-500">Above Average Graduation Standing</div>
                </div>
                <div className="text-xl font-bold font-mono tabular-nums text-slate-800">
                  {stats.cgpa_bracket_distribution.first_class_7_to_8}
                </div>
              </div>

              {/* 6.0 - 6.99 */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900">Second Class (6.0 - 6.99)</div>
                  <div className="text-[11px] text-slate-500">Standard Academic Standing</div>
                </div>
                <div className="text-xl font-bold font-mono tabular-nums text-slate-800">
                  {stats.cgpa_bracket_distribution.second_class_6_to_7}
                </div>
              </div>

              {/* < 6.0 */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900">Pass Class (&lt; 6.0)</div>
                  <div className="text-[11px] text-slate-500">Remedial Focus Required</div>
                </div>
                <div className="text-xl font-bold font-mono tabular-nums text-slate-800">
                  {stats.cgpa_bracket_distribution.pass_class_below_6}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Top Technical Skills Distribution */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">In-Demand Technical Skills Distribution</h2>
            <p className="text-xs text-slate-500">Most frequent competencies recorded across all student profiles</p>
          </div>
          <button
            onClick={() => onAskAiPrompt("Which students know Python and Machine Learning?")}
            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Search Skills via AI</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {stats?.top_skills.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-center"
            >
              <div className="text-xs font-semibold text-slate-900 truncate" title={item.skill}>
                {item.skill}
              </div>
              <div className="mt-1 text-lg font-bold font-mono tabular-nums text-indigo-600">
                {item.count}
              </div>
              <div className="text-[10px] text-slate-400">students</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
