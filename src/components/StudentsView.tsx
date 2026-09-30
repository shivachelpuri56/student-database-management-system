import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
  ArrowUpDown,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Student, StudentFilterParams } from '../types.ts';

interface StudentsViewProps {
  students: Student[];
  totalStudents: number;
  currentPage: number;
  totalPages: number;
  filterParams: StudentFilterParams;
  onFilterChange: (newParams: Partial<StudentFilterParams>) => void;
  onResetFilters: () => void;
  onSelectStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string, name: string) => void;
  isLoading: boolean;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  totalStudents,
  currentPage,
  totalPages,
  filterParams,
  onFilterChange,
  onResetFilters,
  onSelectStudent,
  onEditStudent,
  onDeleteStudent,
  isLoading
}) => {
  const [searchInput, setSearchInput] = useState(filterParams.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ search: searchInput, page: 1 });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onFilterChange({ search: '', page: 1 });
  };

  const departments = ['ALL', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];

  return (
    <div className="space-y-6">
      {/* View Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Student Directory</h1>
          <p className="text-xs text-slate-500">
            Search, filter, view, edit, and manage verified academic records
          </p>
        </div>
        <div className="text-xs text-slate-500 font-mono tabular-nums">
          Showing <span className="font-semibold text-slate-900">{students.length}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalStudents}</span> records
        </div>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by student ID, name, email, city, or skills..."
              className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-900"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Department Filter Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">Dept:</span>
            <select
              value={filterParams.department || 'ALL'}
              onChange={(e) => onFilterChange({ department: e.target.value === 'ALL' ? undefined : e.target.value, page: 1 })}
              className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'ALL' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">Year:</span>
            <select
              value={filterParams.year || ''}
              onChange={(e) => onFilterChange({ year: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
              className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
            >
              <option value="">All Years</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>
          </div>

          {/* Min CGPA Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">CGPA:</span>
            <select
              value={filterParams.min_cgpa || ''}
              onChange={(e) => onFilterChange({ min_cgpa: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
              className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
            >
              <option value="">Any CGPA</option>
              <option value="9.0">&ge; 9.0 (Distinction)</option>
              <option value="8.0">&ge; 8.0 (First Class)</option>
              <option value="7.0">&ge; 7.0</option>
            </select>
          </div>

          {/* Reset button */}
          {(filterParams.department || filterParams.year || filterParams.min_cgpa || filterParams.search || filterParams.max_attendance) && (
            <button
              onClick={onResetFilters}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Quick Filter Segmented Buttons (Functional interactive tab controls) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium">Quick Filters:</span>
          
          <button
            onClick={() => onFilterChange({ department: undefined, max_attendance: undefined, min_cgpa: undefined, page: 1 })}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              !filterParams.department && !filterParams.max_attendance && !filterParams.min_cgpa
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All
          </button>

          <button
            onClick={() => onFilterChange({ min_cgpa: 9.0, max_attendance: undefined, page: 1 })}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterParams.min_cgpa === 9.0
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Toppers (CGPA &ge; 9.0)
          </button>

          <button
            onClick={() => onFilterChange({ max_attendance: 74.9, min_cgpa: undefined, page: 1 })}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterParams.max_attendance === 74.9
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Attendance Risk (&lt; 75%)
          </button>

          <button
            onClick={() => onFilterChange({ skills: 'Python', page: 1 })}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterParams.skills === 'Python'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Python Developers
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-500">Loading student directory...</div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-semibold text-slate-800">No students found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No student records matched your current query or filter criteria. Try clearing the filters.
            </p>
            <button
              onClick={onResetFilters}
              className="mt-3 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Full Name & Contact</th>
                  <th className="py-3 px-4">Department & Course</th>
                  <th className="py-3 px-4">Year / Sem</th>
                  <th className="py-3 px-4">
                    <button
                      onClick={() =>
                        onFilterChange({
                          sort_by: 'cgpa',
                          sort_order: filterParams.sort_order === 'asc' ? 'desc' : 'asc'
                        })
                      }
                      className="flex items-center gap-1 hover:text-slate-900 font-semibold"
                    >
                      <span>CGPA</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      onClick={() =>
                        onFilterChange({
                          sort_by: 'attendance_percentage',
                          sort_order: filterParams.sort_order === 'asc' ? 'desc' : 'asc'
                        })
                      }
                      className="flex items-center gap-1 hover:text-slate-900 font-semibold"
                    >
                      <span>Attendance</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Skills</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Student ID */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                      {student.student_id}
                    </td>

                    {/* Name & Contact */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 whitespace-nowrap">
                        {student.first_name} {student.last_name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {student.email}
                      </div>
                    </td>

                    {/* Department & Course */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{student.department}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {student.course}
                      </div>
                    </td>

                    {/* Year / Semester */}
                    <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap">
                      Year {student.year} · Sem {student.semester}
                    </td>

                    {/* CGPA */}
                    <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap">
                      <span
                        className={`font-bold ${
                          student.cgpa >= 9.0
                            ? 'text-indigo-600'
                            : student.cgpa >= 8.0
                            ? 'text-emerald-600'
                            : 'text-slate-700'
                        }`}
                      >
                        {student.cgpa.toFixed(2)}
                      </span>
                    </td>

                    {/* Attendance */}
                    <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap">
                      <span
                        className={
                          student.attendance_percentage < 75
                            ? 'text-amber-700 font-semibold'
                            : 'text-slate-700'
                        }
                      >
                        {student.attendance_percentage.toFixed(1)}%
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {student.city}, {student.state}
                    </td>

                    {/* Skills (Quiet unboxed text with commas, anti-slop) */}
                    <td className="py-3 px-4 max-w-[200px] truncate text-slate-600 text-[11px]">
                      {student.skills.slice(0, 3).join(', ')}
                      {student.skills.length > 3 && ` +${student.skills.length - 3}`}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectStudent(student)}
                          title="View Profile"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditStudent(student)}
                          title="Edit Student"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteStudent(student.id, `${student.first_name} ${student.last_name}`)}
                          title="Delete Student"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="bg-slate-50/70 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Page <span className="font-semibold text-slate-900">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onFilterChange({ page: Math.max(1, currentPage - 1) })}
              disabled={currentPage <= 1}
              className="p-1.5 border border-slate-200 rounded-md hover:bg-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onFilterChange({ page: Math.min(totalPages, currentPage + 1) })}
              disabled={currentPage >= totalPages}
              className="p-1.5 border border-slate-200 rounded-md hover:bg-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
