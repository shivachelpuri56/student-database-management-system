import React from 'react';
import { ExternalLink, Terminal, Code2, CheckCircle2, Shield } from 'lucide-react';

export const ApiDocsView: React.FC = () => {
  const endpoints = [
    {
      method: 'GET',
      path: '/health',
      description: 'System health check, database status, and AI engine status',
      status: '200 OK',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      method: 'GET',
      path: '/api/students',
      description: 'List and filter students with pagination, search, and multi-criteria sorting',
      status: '200 OK',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      method: 'POST',
      path: '/api/students',
      description: 'Create student with validation for unique ID, unique email, CGPA, and attendance',
      status: '201 Created / 409 Conflict / 422 Validation Error',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      method: 'GET',
      path: '/api/students/{id}',
      description: 'Retrieve individual student record by ID or student_id',
      status: '200 OK / 404 Not Found',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      method: 'PUT',
      path: '/api/students/{id}',
      description: 'Full update of student record',
      status: '200 OK / 404 Not Found / 409 / 422',
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      method: 'PATCH',
      path: '/api/students/{id}',
      description: 'Partial update of specific student attributes',
      status: '200 OK / 404 Not Found / 409 / 422',
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      method: 'DELETE',
      path: '/api/students/{id}',
      description: 'Delete student record permanently from database',
      status: '200 OK / 204 No Content / 404 Not Found',
      color: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      method: 'GET',
      path: '/api/students/stats/summary',
      description: 'Aggregated academic statistics, department breakdowns, and attendance risk audit',
      status: '200 OK',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      method: 'GET',
      path: '/api/students/stats/top',
      description: 'Top-ranked students by CGPA with optional department filter',
      status: '200 OK',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      method: 'POST',
      path: '/api/chat',
      description: 'LangGraph conversational AI workflow with controlled DB retrieval and Gemini grounding',
      status: '200 OK / 400 Bad Request',
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      method: 'POST',
      path: '/api/students/seed',
      description: 'Reseeds database with 30 synthetic demonstration student records',
      status: '200 OK',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          REST API & Swagger Documentation
        </h1>
        <p className="text-xs text-slate-500">
          Interactive OpenAPI 3.0 specification, Swagger UI testing console, and ReDoc documentation
        </p>
      </div>

      {/* External Direct Links Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href="/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xs transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-indigo-600 mb-2">
              <Terminal className="w-5 h-5" />
              <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-sm font-bold text-slate-900">Interactive Swagger UI</div>
            <p className="text-xs text-slate-500 mt-1">
              Live testing sandbox with 'Try It Out' capability on all endpoints.
            </p>
          </div>
          <div className="mt-4 text-[11px] font-mono text-indigo-600 font-medium">/docs</div>
        </a>

        <a
          href="/redoc"
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xs transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-indigo-600 mb-2">
              <Code2 className="w-5 h-5" />
              <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-sm font-bold text-slate-900">ReDoc Documentation</div>
            <p className="text-xs text-slate-500 mt-1">
              Polished 3-panel technical API reference suitable for project submission.
            </p>
          </div>
          <div className="mt-4 text-[11px] font-mono text-indigo-600 font-medium">/redoc</div>
        </a>

        <a
          href="/openapi.json"
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xs transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-indigo-600 mb-2">
              <Shield className="w-5 h-5" />
              <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-sm font-bold text-slate-900">Raw OpenAPI 3.0 JSON</div>
            <p className="text-xs text-slate-500 mt-1">
              Standard OpenAPI schema describing all endpoints, schemas, and models.
            </p>
          </div>
          <div className="mt-4 text-[11px] font-mono text-indigo-600 font-medium">/openapi.json</div>
        </a>
      </div>

      {/* API Endpoints Catalog */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">API Endpoint Catalog</h2>
          <p className="text-xs text-slate-500">
            HTTP operations, path parameters, and return codes implemented in the backend
          </p>
        </div>

        <div className="space-y-2">
          {endpoints.map((ep, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded-md font-mono font-bold text-[11px] border ${
                    ep.method === 'GET'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : ep.method === 'POST'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : ep.method === 'PUT' || ep.method === 'PATCH'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="font-mono font-semibold text-slate-900">{ep.path}</span>
              </div>

              <div className="text-slate-600 sm:max-w-md sm:text-right">
                <div>{ep.description}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{ep.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
