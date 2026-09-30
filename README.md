# Student Database Management System with Conversational AI Integration

A production-ready, full-stack capstone and internship project that unites academic records management, Supabase PostgreSQL storage, comprehensive statistical analytics, and a database-grounded Conversational AI assistant powered by Google Gemini and a LangGraph-style workflow.

---

## 1. Project Overview
The **Student Database Management System with Conversational AI Integration** is an enterprise-grade academic platform built for universities, training institutes, and colleges. It provides institutional administrators, faculty, and counselors with intuitive student record management alongside an AI assistant that answers analytical, structured, and semantic questions strictly grounded in verified database records.

---

## 2. Problem Statement
Educational institutions often struggle with:
1. **Disjointed Querying**: Finding students matching cross-departmental criteria (e.g., "Find 3rd-year CSE students proficient in Machine Learning with CGPA above 8.5") requires complex manual filter combinations or manual database queries.
2. **Attendance Risk Tracking**: Identifying students at risk of falling below regulatory attendance thresholds (< 75%) requires periodic manual exports and spreadsheet formulas.
3. **AI Hallucinations**: Standard LLM integrations frequently invent grades, fabricate student names, or disclose unverified facts because they lack deterministic database grounding.

---

## 3. Core Objectives
- **CRUD & Search**: Create, retrieve, paginate, search, filter, update (PUT/PATCH), and delete student profiles with robust validation.
- **Academic Analytics**: Compute real-time department benchmarks, CGPA distributions, attendance risk audits, and top performers.
- **Conversational AI**: Provide a natural-language chat interface orchestrated via a LangGraph-style workflow.
- **Controlled Retrieval**: Restrict the LLM to controlled database retrieval tools—never allowing arbitrary SQL execution.
- **Semantic Competency Search**: Match student skills and domain interests using conceptual vector similarity and domain ontologies.
- **API Documentation**: Expose interactive Swagger UI (`/docs`), ReDoc (`/redoc`), and OpenAPI 3.0 JSON (`/openapi.json`).

---

## 4. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express, RESTful APIs, OpenAPI 3.0 |
| **Database** | Supabase PostgreSQL with embedded high-performance relational fallback |
| **AI Engine** | Google Gemini (`gemini-3.8-flash`) via `@google/genai` TypeScript SDK |
| **Orchestration** | LangGraph-style multi-step deterministic pipeline |
| **Vector / Semantic** | Domain ontology mapping & cosine similarity vectors |
| **Documentation** | Swagger UI (`/docs`), ReDoc (`/redoc`), OpenAPI 3.0 (`/openapi.json`) |

---

## 5. Database Schema & Design

### Student Entity Fields:
- `id` (string, Primary Key)
- `student_id` (string, Unique, e.g. "STU2021001", Indexed)
- `first_name` (string, Required)
- `last_name` (string, Required)
- `email` (string, Unique, RFC format, Indexed)
- `phone` (string, Required)
- `gender` (enum: 'Male' | 'Female' | 'Other')
- `age` (integer, Validated: 16 to 45)
- `department` (string, e.g. CSE, ECE, EEE, MECH, CIVIL, IT, Indexed)
- `course` (string, e.g. B.Tech Computer Science & Engineering)
- `year` (integer, Validated: 1 to 5)
- `semester` (integer, Validated: 1 to 10)
- `cgpa` (float, Validated: 0.0 to 10.0, Indexed)
- `city` (string, Required)
- `state` (string, Required)
- `attendance_percentage` (float, Validated: 0.0 to 100.0, Indexed)
- `skills` (string array, Technical proficiencies, Indexed)
- `created_at` (ISO timestamp)
- `updated_at` (ISO timestamp)

### Database Constraints:
- Unique index on `student_id` (prevents duplicate student registration).
- Unique index on `email` (prevents duplicate student email).
- Domain boundary validation on age, CGPA, attendance, and semester numbers.

---

## 6. REST API Endpoints

| Method | Endpoint | Description | Return Codes |
|---|---|---|---|
| `GET` | `/health` | System health, database connection status, and AI engine state | `200` |
| `GET` | `/api/students` | List students with search, filters, sorting, and pagination | `200` |
| `POST` | `/api/students` | Register a new student record with strict validation | `201`, `409`, `422` |
| `GET` | `/api/students/{id}` | Retrieve individual student by internal ID or `student_id` | `200`, `404` |
| `PUT` | `/api/students/{id}` | Full update of existing student profile | `200`, `404`, `409`, `422` |
| `PATCH` | `/api/students/{id}` | Partial update of specific student fields | `200`, `404`, `409`, `422` |
| `DELETE` | `/api/students/{id}` | Remove a student record permanently | `200`, `204`, `404` |
| `GET` | `/api/students/stats/summary` | Summary stats: averages, department breakdown, attendance risk | `200` |
| `GET` | `/api/students/stats/top` | Top performing students ranked by CGPA | `200` |
| `POST` | `/api/chat` | Conversational AI query execution via LangGraph | `200`, `400` |
| `POST` | `/api/students/seed` | Reseeds database with 30 synthetic student records | `200` |

---

## 7. AI Chatbot & LangGraph Workflow

The chatbot employs a 6-step deterministic LangGraph pipeline:

```
User Query
   │
   ▼
1. validate_question  ──[Invalid / Probe]──► Return Safety Notice
   │
   ▼
2. classify_intent    ──► [sql_query | analytics | semantic_search | unsupported]
   │
   ▼
3. retrieve_information ──► Execute Controlled Database Tools:
   │                         - count_students
   │                         - filter_students
   │                         - get_department_statistics
   │                         - get_top_students
   │                         - semantic_student_search
   │
   ▼
4. generate_response  ──► Server-Side Gemini API (gemini-3.8-flash) with Grounding Context
   │
   ▼
5. safety_check       ──► Anti-Hallucination Guardrail Check
   │                      (Enforces fallback if no matching records exist)
   │
   ▼
6. final_response     ──► Natural-Language Answer + Execution Trace + Grounded Records
```

---

## 8. Semantic Search Implementation
When queries ask conceptual questions (e.g., *"Who has experience with deep learning?"* or *"Find students interested in web development"*):
1. **Ontological Concept Expansion**: Maps natural-language domains to technical skill sets.
2. **Term Vector Projection**: Converts student profiles and user queries into normalized frequency vectors.
3. **Cosine Similarity**: Calculates vector similarity scores with word-boundary protection.
4. **Ranked Matching**: Returns the top matching candidates with relevance scores and match rationales.

---

## 9. Environment Variables

Configure in `.env`:

```bash
# GEMINI_API_KEY: Injected by AI Studio or Google Cloud
GEMINI_API_KEY="your-gemini-api-key"

# GEMINI_MODEL: Configurable model alias (default: gemini-3.8-flash)
GEMINI_MODEL="gemini-3.8-flash"

# PORT: Server port (defaults to 3000)
PORT=3000

# SUPABASE_URL: Optional Supabase PostgreSQL project URL
SUPABASE_URL="https://your-project.supabase.co"

# SUPABASE_ANON_KEY: Supabase anonymous client key
SUPABASE_ANON_KEY="your-anon-key"

# SUPABASE_SERVICE_ROLE_KEY: Optional backend-only service key
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

---

## 10. How to Run Locally

### Prerequisites:
- Node.js 20+ installed
- npm or yarn

### Steps:
1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your environment variables in `.env` (or copy `.env.example`).
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open your browser:
   - Application Dashboard: `http://localhost:3000`
   - Interactive Swagger Docs: `http://localhost:3000/docs`
   - ReDoc Reference: `http://localhost:3000/redoc`
   - Health Check: `http://localhost:3000/health`

---

## 11. Automated Testing

Run the comprehensive automated test suite:

```bash
npm run test
```

### Verified Test Scope:
- **Health Check**: Database status and seed record verification.
- **Student CRUD**: Creation, pagination, department filter, CGPA filter, fuzzy search, single ID lookup.
- **Validation**: Rejection of invalid CGPA (> 10.0), attendance, age.
- **Duplicate Conflicts**: Conflict 409 on duplicate student ID and email.
- **Updates**: Partial update (PATCH) and full update (PUT).
- **Deletion**: Permanent record removal.
- **Analytics**: Statistics summary and top 5 CGPA rankings.
- **Semantic Search**: Conceptual matching for AI & machine learning.
- **Conversational AI**: LangGraph workflow for structured, analytical, and semantic queries.
- **Anti-Hallucination**: Query for non-existent domain safely produces grounded refusal.

---

## 12. Academic Viva Resources
- **Project Explanation Guide**: [`docs/PROJECT_EXPLANATION.md`](docs/PROJECT_EXPLANATION.md)
- **25+ Viva Questions and Answers**: [`docs/VIVA_QUESTIONS.md`](docs/VIVA_QUESTIONS.md)
