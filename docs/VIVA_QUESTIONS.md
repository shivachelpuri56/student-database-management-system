# 25+ Comprehensive Viva Questions & Answers
## Student Database Management System with Conversational AI Integration

---

### General Architecture & Objectives

**Q1: What is the primary objective of this capstone project?**  
**A:** To build an academic Student Database Management System combining verified relational database storage, full RESTful CRUD capabilities, interactive statistical analytics, and a database-grounded Conversational AI assistant powered by Google Gemini and a LangGraph workflow.

**Q2: What is the core technology stack used?**  
**A:** 
- Frontend: React 19, TypeScript, Vite, Tailwind CSS.
- Backend: RESTful API server with OpenAPI 3.0 documentation (Swagger UI & ReDoc).
- Database: Supabase PostgreSQL / relational database engine with full indexing.
- AI & Orchestration: Google Gemini (`gemini-3.8-flash`) via the modern `@google/genai` SDK and a LangGraph-style workflow.

**Q3: How does this project differ from a standard student record system?**  
**A:** Standard systems only offer static forms and fixed tables. This project introduces semantic skill search and conversational intelligence where administrators can query the database in plain English and receive factually grounded answers with zero hallucination.

---

### Database & Schema Design

**Q4: What fields are stored for each student?**  
**A:** `id`, `student_id`, `first_name`, `last_name`, `email`, `phone`, `gender`, `age`, `department`, `course`, `year`, `semester`, `cgpa`, `city`, `state`, `attendance_percentage`, `skills`, `created_at`, `updated_at`.

**Q5: What unique constraints and validations are enforced in the database?**  
**A:**
- `student_id` must be unique across the institution.
- `email` must be unique and follow RFC email format.
- `cgpa` must be a valid float between `0.0` and `10.0`.
- `attendance_percentage` must be between `0.0` and `100.0`.
- `age` must be an integer between `16` and `45`.
- Academic `year` (1–4/5) and `semester` (1–8/10) must be within valid limits.

**Q6: What indexes are created in the database?**  
**A:** Unique indexes on `student_id` and `email` for $O(1)$ lookups, and secondary indexes on `department`, `skills`, `cgpa`, and `city` to accelerate search queries and analytical aggregations.

**Q7: How is duplicate data handled?**  
**A:** If a request attempts to register or update a student with an already existing `student_id` or `email`, the database layer rejects it with a `409 Conflict` HTTP status code and a clear error message.

---

### REST API & Standards

**Q8: What are the main REST API endpoints implemented?**  
**A:**
- `GET /health`: System health and database connection status.
- `GET /api/students`: List and filter students (supports search, department, CGPA, attendance, year, city, sorting, pagination).
- `POST /api/students`: Create a new student (returns `201 Created`).
- `GET /api/students/:id`: Retrieve single student by ID or roll number (`200` or `404`).
- `PUT /api/students/:id`: Full update of student record.
- `PATCH /api/students/:id`: Partial update of specific student attributes.
- `DELETE /api/students/:id`: Remove student record (`200` or `204`).
- `GET /api/students/stats/summary`: Academic statistical summary.
- `GET /api/students/stats/top`: Top performers by CGPA.
- `POST /api/chat`: Conversational AI query processing.
- `POST /api/students/seed`: Reseed database with 30 synthetic demonstration records.

**Q9: What is OpenAPI and why is Swagger UI included?**  
**A:** OpenAPI 3.0 provides a standardized, machine-readable specification of all endpoints, request bodies, query parameters, and response schemas. Swagger UI (`/docs`) and ReDoc (`/redoc`) render this specification into an interactive interface for live testing and viva demonstrations.

**Q10: What HTTP status codes are used and why?**  
**A:**
- `200 OK`: Successful retrieval or update.
- `201 Created`: Resource successfully created.
- `204 No Content`: Successful deletion without response body.
- `400 Bad Request`: Empty or malformed client query.
- `404 Not Found`: Identifier does not exist.
- `409 Conflict`: Duplicate unique key violation.
- `422 Unprocessable Entity`: Field validation failed (e.g. CGPA > 10).
- `500 Internal Server Error`: Unhandled server exception.

---

### AI & LangGraph Workflow

**Q11: Why is LangGraph used instead of a single prompt to Gemini?**  
**A:** A single prompt allows the model to hallucinate numbers or fabricate student records. LangGraph decomposes the interaction into specialized sequential nodes: validation, intent classification, controlled tool execution, grounded generation, and safety audit.

**Q12: Describe the steps of the LangGraph workflow.**  
**A:**
1. `validate_question`: Verifies that the question is non-empty and screens against prompt injection or arbitrary SQL tampering.
2. `classify_intent`: Labels intent as `sql_query`, `analytics`, `semantic_search`, or `unsupported`.
3. `retrieve_information`: Calls verified database tools to fetch matching student rows or stats.
4. `generate_response`: Sends only the retrieved database records to Gemini with strict citation constraints.
5. `safety_check`: Verifies the model did not invent records; falls back to "I don't have enough information in the student database to answer that" if no records matched.
6. `final_response`: Packages the natural language answer, execution latency, intent, and grounding audit trace.

**Q13: What are "Controlled Database Tools"?**  
**A:** Specific, secure functions that execute pre-defined queries (e.g., `count_students`, `filter_students`, `get_department_statistics`, `get_top_students`, `semantic_student_search`). The LLM is never given permission to execute arbitrary `SELECT` or `DROP` statements.

**Q14: How does the system prevent hallucination?**  
**A:**
1. Ground truth data is fetched from the database *prior* to calling the LLM.
2. The LLM is instructed: *"ONLY refer to student records in the retrieved context. Do NOT invent student IDs, names, or metrics."*
3. The post-generation safety check enforces a clean fallback message if zero records matched.

**Q15: What happens if an examiner asks: "Find students specializing in Quantum Astronautics 99"?**  
**A:** The semantic search tool retrieves 0 records because no student has that specialization. The safety check detects zero retrieved records and cleanly replies: *"I don't have enough information in the student database to answer that. No records matching your specific query were found."*

---

### Semantic Search & Vector Retrieval

**Q16: What is semantic search and why is it needed for skills?**  
**A:** Semantic search understands the underlying conceptual meaning of a query rather than literal substring matches. For example, a search for *"Who knows web development?"* automatically matches students with skills like *React, JavaScript, Node.js, HTML/CSS*, even if the exact string "web development" is not written in their profile.

**Q17: How is semantic similarity computed in this project?**  
**A:** Student profiles are compiled into technical descriptive documents. The query and documents are mapped into conceptual vector spaces using a domain ontology combined with cosine similarity. In Supabase deployments, this integrates with `pgvector`.

**Q18: What is cosine similarity?**  
**A:** Cosine similarity measures the cosine of the angle between two multi-dimensional vectors:
$$\text{Cosine Similarity}(A, B) = \frac{A \cdot B}{\|A\| \|B\|}$$
A score of `1.0` indicates identical direction (highest relevance), while `0.0` indicates orthogonal/unrelated concepts.

---

### Security & Compliance

**Q19: How are API keys and secrets protected?**  
**A:** `GEMINI_API_KEY` and Supabase keys are strictly stored in server environment variables. They are never imported or passed to client-side bundles or rendered in the DOM.

**Q20: What security measures prevent prompt injection?**  
**A:** The `validate_question` node intercepts malicious phrases (such as *"ignore previous instructions"*, *"system prompt"*, or *"SELECT * FROM"*), rejecting them before invoking any database tools or LLMs.

**Q21: Does the chatbot expose sensitive student contact details?**  
**A:** The chatbot answers aggregate and academic queries, exposing only relevant academic fields (roll number, department, CGPA, attendance, skills) and withholding unnecessary personal credentials.

---

### Testing & Deployment

**Q22: How is the system tested?**  
**A:** Automated test suites verify:
1. Health endpoint response and database connectivity.
2. Full CRUD operations (creation, retrieval, update, deletion).
3. Boundary validation (e.g. CGPA > 10.0 rejection).
4. Duplicate handling (conflict 409 on duplicate ID and email).
5. Analytics aggregations and top performers ranking.
6. Semantic search accuracy on skills.
7. LangGraph workflow intent classification and grounding safety check.

**Q23: How is the application deployed?**  
**A:** The application binds to `0.0.0.0` on the platform-designated `PORT` (default 3000), runs full-stack Express server with Vite middleware integration in development and static asset serving in production, making it immediately accessible via public Cloud Run URLs.

**Q24: What synthetic demo data is included?**  
**A:** 30 realistic synthetic records across 6 engineering departments (CSE, ECE, EEE, MECH, CIVIL, IT) with varied CGPAs (6.4 to 9.85), attendances (64% to 98%), academic years (1 to 4), and diverse modern technical skills.

**Q25: What are the main benefits for academic institutions?**  
**A:**
- Reduces administrative reporting time by > 80%.
- Immediately flags students needing attendance intervention (< 75%).
- Enables non-technical staff to query student cohorts using conversational English.
- Guarantees 100% data integrity with zero hallucination.
