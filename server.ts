import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { db, DatabaseError } from './backend/database/db.ts';
import { executeLangGraphWorkflow } from './backend/ai/langgraphWorkflow.ts';
import { openapiSpec, getSwaggerHtml, getRedocHtml } from './backend/docs/openapiSpec.ts';
import { DEFAULT_MODEL, isGeminiAvailable } from './backend/ai/geminiClient.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

// Middleware
app.use(express.json());

// CORS & security headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// ==========================================
// 1. Health Check
// ==========================================
app.get('/health', (req: Request, res: Response) => {
  const dbStatus = db.getDatabaseStatus();
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    database: {
      provider: dbStatus.provider,
      is_supabase_connected: dbStatus.is_supabase_connected,
      total_students: dbStatus.total_records
    },
    ai_engine: {
      model: DEFAULT_MODEL,
      is_available: isGeminiAvailable()
    }
  });
});

// ==========================================
// 2. OpenAPI & Swagger Documentation
// ==========================================
app.get('/openapi.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(openapiSpec);
});

app.get('/docs', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(getSwaggerHtml('/openapi.json'));
});

app.get('/redoc', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(getRedocHtml('/openapi.json'));
});

// ==========================================
// 3. REST API Endpoints
// ==========================================

// GET /api/students/stats/summary
app.get('/api/students/stats/summary', (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = db.getStatsSummary();
    res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
});

// GET /api/students/stats/top
app.get('/api/students/stats/top', (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const department = req.query.department as string | undefined;
    const topStudents = db.getTopStudents(limit, department);
    res.status(200).json(topStudents);
  } catch (err) {
    next(err);
  }
});

// POST /api/students/seed
app.post('/api/students/seed', (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = db.resetToSeed();
    res.status(200).json({
      message: 'Student database successfully reseeded with synthetic demonstration data.',
      records_seeded: count
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/students
app.get('/api/students', (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = {
      department: req.query.department as string,
      course: req.query.course as string,
      year: req.query.year ? Number(req.query.year) : undefined,
      semester: req.query.semester ? Number(req.query.semester) : undefined,
      min_cgpa: req.query.min_cgpa ? Number(req.query.min_cgpa) : undefined,
      max_cgpa: req.query.max_cgpa ? Number(req.query.max_cgpa) : undefined,
      min_attendance: req.query.min_attendance ? Number(req.query.min_attendance) : undefined,
      max_attendance: req.query.max_attendance ? Number(req.query.max_attendance) : undefined,
      city: req.query.city as string,
      gender: req.query.gender as string,
      skills: req.query.skills as string,
      search: req.query.search as string,
      sort_by: req.query.sort_by as any,
      sort_order: req.query.sort_order as any,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 50
    };

    const result = db.getAll(params);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/students
app.post('/api/students', (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = db.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    next(err);
  }
});

// GET /api/students/:id
app.get('/api/students/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = db.getById(req.params.id);
    res.status(200).json(student);
  } catch (err) {
    next(err);
  }
});

// PUT /api/students/:id
app.put('/api/students/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = db.update(req.params.id, req.body);
    res.status(200).json(student);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/students/:id
app.patch('/api/students/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = db.patch(req.params.id, req.body);
    res.status(200).json(student);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/students/:id
app.delete('/api/students/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    db.delete(req.params.id);
    res.status(200).json({ message: `Student '${req.params.id}' successfully removed.` });
  } catch (err) {
    next(err);
  }
});

// POST /api/chat (LangGraph Conversational AI Workflow)
app.post('/api/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, conversation_history } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'A non-empty "message" string is required.' });
      return;
    }

    const response = await executeLangGraphWorkflow(message.trim(), conversation_history);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 4. Global Error Handler
// ==========================================
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof DatabaseError) {
    res.status(err.status).json({
      error: err.name,
      message: err.message,
      status_code: err.status
    });
    return;
  }

  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected internal error occurred on the server.',
    status_code: 500
  });
});

// ==========================================
// 5. Frontend Integration & Server Listen
// ==========================================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(process.cwd(), 'dist');
  const hasDist = fs.existsSync(distPath);

  if (!isProduction && !hasDist) {
    // Development mode: attach Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built assets
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Student Database Management System with Conversational AI running at:`);
    console.log(`- Dashboard & UI: http://${HOST}:${PORT}`);
    console.log(`- Health Check:  http://${HOST}:${PORT}/health`);
    console.log(`- Swagger UI:    http://${HOST}:${PORT}/docs`);
    console.log(`- ReDoc UI:      http://${HOST}:${PORT}/redoc`);
    console.log(`- OpenAPI Spec:  http://${HOST}:${PORT}/openapi.json`);
  });
}

startServer();
