import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { StudentsView } from './components/StudentsView.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { ChatbotView } from './components/ChatbotView.tsx';
import { ApiDocsView } from './components/ApiDocsView.tsx';
import { StudentModal } from './components/StudentModal.tsx';
import { StudentDetailModal } from './components/StudentDetailModal.tsx';
import {
  Student,
  CreateStudentDto,
  StudentFilterParams,
  StudentStatsSummary,
  SystemHealth
} from './types.ts';
import {
  fetchHealth,
  fetchStudents,
  fetchStatsSummary,
  createStudent,
  updateStudent,
  deleteStudent,
  reseedDatabase
} from './services/api.ts';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'analytics' | 'chat' | 'docs'>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<StudentStatsSummary | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [filterParams, setFilterParams] = useState<StudentFilterParams>({
    page: 1,
    limit: 50,
    sort_by: 'student_id',
    sort_order: 'asc'
  });

  // Modals & Triggers
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [initialAiPrompt, setInitialAiPrompt] = useState<string | null>(null);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReseeding, setIsReseeding] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Data Loading
  const loadStudents = async (params: StudentFilterParams = filterParams) => {
    setIsLoading(true);
    try {
      const res = await fetchStudents(params);
      setStudents(res.data);
      setTotalStudents(res.total);
      setCurrentPage(res.page);
      setTotalPages(res.total_pages);
    } catch (err: any) {
      showNotification('error', `Failed to load students: ${err?.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await fetchStatsSummary();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadHealthStatus = async () => {
    try {
      const h = await fetchHealth();
      setHealth(h);
    } catch (err) {
      console.error('Health check failed:', err);
    }
  };

  useEffect(() => {
    loadHealthStatus();
    loadStats();
    loadStudents();
  }, []);

  const handleFilterChange = (newParams: Partial<StudentFilterParams>) => {
    const updated = { ...filterParams, ...newParams };
    setFilterParams(updated);
    loadStudents(updated);
  };

  const handleResetFilters = () => {
    const reset: StudentFilterParams = {
      page: 1,
      limit: 50,
      sort_by: 'student_id',
      sort_order: 'asc'
    };
    setFilterParams(reset);
    loadStudents(reset);
  };

  const handleCreateOrUpdateStudent = async (data: CreateStudentDto) => {
    setIsSubmitting(true);
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, data);
        showNotification('success', `Student '${data.first_name} ${data.last_name}' updated successfully.`);
      } else {
        await createStudent(data);
        showNotification('success', `Student '${data.first_name} ${data.last_name}' registered successfully.`);
      }
      setIsStudentModalOpen(false);
      setEditingStudent(null);
      await loadStudents();
      await loadStats();
      await loadHealthStatus();
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete student "${name}"? This action is permanent.`)) {
      return;
    }

    try {
      await deleteStudent(id);
      showNotification('success', `Student "${name}" deleted.`);
      await loadStudents();
      await loadStats();
      await loadHealthStatus();
    } catch (err: any) {
      showNotification('error', `Failed to delete student: ${err?.message || err}`);
    }
  };

  const handleReseed = async () => {
    if (!confirm('Reseed database to original 30 synthetic student records?')) {
      return;
    }
    setIsReseeding(true);
    try {
      const res = await reseedDatabase();
      showNotification('success', `${res.records_seeded} synthetic student records restored.`);
      await loadStudents();
      await loadStats();
      await loadHealthStatus();
    } catch (err: any) {
      showNotification('error', `Reseed failed: ${err?.message || err}`);
    } finally {
      setIsReseeding(false);
    }
  };

  const handleAskAiPrompt = (prompt: string) => {
    setInitialAiPrompt(prompt);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setEditingStudent(null);
          setIsStudentModalOpen(true);
        }}
        onReseed={handleReseed}
        isReseeding={isReseeding}
        health={health}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            students={students}
            onNavigateToTab={setActiveTab}
            onSelectStudent={(s) => setDetailStudent(s)}
            onAskAiPrompt={handleAskAiPrompt}
          />
        )}

        {activeTab === 'students' && (
          <StudentsView
            students={students}
            totalStudents={totalStudents}
            currentPage={currentPage}
            totalPages={totalPages}
            filterParams={filterParams}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onSelectStudent={(s) => setDetailStudent(s)}
            onEditStudent={(s) => {
              setEditingStudent(s);
              setIsStudentModalOpen(true);
            }}
            onDeleteStudent={handleDeleteStudent}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            stats={stats}
            onSelectStudent={(s) => setDetailStudent(s)}
            onAskAiPrompt={handleAskAiPrompt}
          />
        )}

        {activeTab === 'chat' && (
          <ChatbotView
            initialPrompt={initialAiPrompt}
            onClearInitialPrompt={() => setInitialAiPrompt(null)}
            onSelectStudent={(s) => setDetailStudent(s)}
          />
        )}

        {activeTab === 'docs' && <ApiDocsView />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Student Database Management System with Conversational AI · Final Year Capstone Project
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>FastAPI & Express REST API</span>
            <span aria-hidden="true">·</span>
            <span>Supabase PostgreSQL</span>
            <span aria-hidden="true">·</span>
            <span>Google Gemini</span>
            <span aria-hidden="true">·</span>
            <span>LangGraph Workflow</span>
          </div>
        </div>
      </footer>

      {/* Add / Edit Student Modal */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setEditingStudent(null);
        }}
        onSubmit={handleCreateOrUpdateStudent}
        student={editingStudent}
        isSubmitting={isSubmitting}
      />

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={detailStudent}
        isOpen={!!detailStudent}
        onClose={() => setDetailStudent(null)}
        onEdit={(s) => {
          setEditingStudent(s);
          setIsStudentModalOpen(true);
        }}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div
            className={`px-4 py-3 rounded-xl border shadow-lg flex items-center gap-2 text-xs font-medium ${
              notification.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-800'
                : 'bg-rose-900 text-white border-rose-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
