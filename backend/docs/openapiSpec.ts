export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Student Database Management System with Conversational AI API",
    version: "1.0.0",
    description: "Production-grade RESTful API for student academic records management, Supabase PostgreSQL storage, analytical statistics, and database-grounded Conversational AI with LangGraph workflow and Google Gemini."
  },
  servers: [
    {
      url: "/",
      description: "Current Application Host"
    }
  ],
  paths: {
    "/health": {
      get: {
        summary: "Health Check",
        description: "Returns system health, database connection state, total student count, and AI model status.",
        responses: {
          "200": {
            description: "System is healthy and responsive",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "healthy" },
                    timestamp: { type: "string", format: "date-time" },
                    database: {
                      type: "object",
                      properties: {
                        provider: { type: "string", example: "supabase / embedded" },
                        is_supabase_connected: { type: "boolean", example: true },
                        total_records: { type: "integer", example: 30 }
                      }
                    },
                    ai_engine: {
                      type: "object",
                      properties: {
                        model: { type: "string", example: "gemini-3.8-flash" },
                        is_available: { type: "boolean", example: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/students": {
      get: {
        summary: "List and Filter Students",
        description: "Retrieve a paginated list of students with comprehensive multi-criteria filtering, search, and sorting.",
        parameters: [
          { name: "department", in: "query", schema: { type: "string" }, description: "Filter by department (e.g., CSE, ECE, EEE, MECH, CIVIL, IT)" },
          { name: "course", in: "query", schema: { type: "string" }, description: "Filter by course name substring" },
          { name: "year", in: "query", schema: { type: "integer" }, description: "Filter by academic year (1-4)" },
          { name: "semester", in: "query", schema: { type: "integer" }, description: "Filter by semester (1-8)" },
          { name: "min_cgpa", in: "query", schema: { type: "number" }, description: "Minimum CGPA (0.0 - 10.0)" },
          { name: "max_cgpa", in: "query", schema: { type: "number" }, description: "Maximum CGPA (0.0 - 10.0)" },
          { name: "min_attendance", in: "query", schema: { type: "number" }, description: "Minimum attendance percentage (0.0 - 100.0)" },
          { name: "max_attendance", in: "query", schema: { type: "number" }, description: "Maximum attendance percentage (0.0 - 100.0)" },
          { name: "city", in: "query", schema: { type: "string" }, description: "Filter by student city" },
          { name: "gender", in: "query", schema: { type: "string", enum: ["Male", "Female", "Other"] }, description: "Filter by gender" },
          { name: "skills", in: "query", schema: { type: "string" }, description: "Filter by skill keyword (e.g., Python, React)" },
          { name: "search", in: "query", schema: { type: "string" }, description: "Fuzzy text search across student ID, name, email, city, and skills" },
          { name: "sort_by", in: "query", schema: { type: "string", default: "student_id" }, description: "Sort field" },
          { name: "sort_order", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "asc" }, description: "Sort direction" },
          { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number" },
          { name: "limit", in: "query", schema: { type: "integer", default: 50 }, description: "Items per page" }
        ],
        responses: {
          "200": {
            description: "List of students successfully retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/Student" } },
                    total: { type: "integer" },
                    page: { type: "integer" },
                    limit: { type: "integer" },
                    total_pages: { type: "integer" }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: "Create a Student Record",
        description: "Add a new student with strict validation for unique student ID, email, CGPA range (0-10), and attendance (0-100).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateStudentDto" }
            }
          }
        },
        responses: {
          "201": {
            description: "Student created successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Student" }
              }
            }
          },
          "409": { description: "Conflict: Duplicate student ID or email" },
          "422": { description: "Validation Error: Invalid input parameters" }
        }
      }
    },
    "/api/students/{id}": {
      get: {
        summary: "Get Student by ID",
        description: "Retrieve complete details of a single student by internal ID or registration student_id.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Unique student record ID or student_id" }
        ],
        responses: {
          "200": {
            description: "Student details retrieved",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Student" }
              }
            }
          },
          "404": { description: "Student not found" }
        }
      },
      put: {
        summary: "Full Update of Student Record",
        description: "Replaces all editable fields of an existing student record.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateStudentDto" }
            }
          }
        },
        responses: {
          "200": { description: "Student updated successfully", content: { "application/json": { schema: { $ref: "#/components/schemas/Student" } } } },
          "404": { description: "Student not found" },
          "409": { description: "Conflict: Duplicate student ID or email" },
          "422": { description: "Validation error" }
        }
      },
      patch: {
        summary: "Partial Update of Student Record",
        description: "Updates specified fields of an existing student record.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateStudentDto" }
            }
          }
        },
        responses: {
          "200": { description: "Student updated successfully", content: { "application/json": { schema: { $ref: "#/components/schemas/Student" } } } },
          "404": { description: "Student not found" },
          "409": { description: "Conflict with existing records" },
          "422": { description: "Validation error" }
        }
      },
      delete: {
        summary: "Delete Student Record",
        description: "Permanently removes a student record from the database.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": { description: "Student deleted successfully" },
          "204": { description: "No Content (Deleted)" },
          "404": { description: "Student not found" }
        }
      }
    },
    "/api/students/stats/summary": {
      get: {
        summary: "Get Academic Statistics Summary",
        description: "Aggregates overall metrics including department breakdown, average CGPA, attendance risk (<75%), and top skills.",
        responses: {
          "200": {
            description: "Statistics summary",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StudentStatsSummary" }
              }
            }
          }
        }
      }
    },
    "/api/students/stats/top": {
      get: {
        summary: "Get Top Performing Students",
        description: "Retrieves top students ranked by CGPA with optional department filtering.",
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer", default: 5 }, description: "Number of students to retrieve" },
          { name: "department", in: "query", schema: { type: "string" }, description: "Filter by department" }
        ],
        responses: {
          "200": {
            description: "List of top performing students",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Student" }
                }
              }
            }
          }
        }
      }
    },
    "/api/chat": {
      post: {
        summary: "Ask Conversational AI",
        description: "Submits a query to the LangGraph-style workflow using controlled database retrieval tools and Google Gemini grounding.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["message"],
                properties: {
                  message: { type: "string", example: "How many students are enrolled in CSE?" },
                  conversation_history: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        role: { type: "string", enum: ["user", "assistant"] },
                        content: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Database-grounded conversational response",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ChatResponse" }
              }
            }
          },
          "400": { description: "Bad request: Empty message" }
        }
      }
    },
    "/api/students/seed": {
      post: {
        summary: "Reset / Reseed Database",
        description: "Resets the database with 30 diverse synthetic student records for demonstration and viva testing.",
        responses: {
          "200": {
            description: "Database reseeded successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    records_seeded: { type: "integer" }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Student: {
        type: "object",
        properties: {
          id: { type: "string", example: "std-001" },
          student_id: { type: "string", example: "STU2021001" },
          first_name: { type: "string", example: "Aarav" },
          last_name: { type: "string", example: "Sharma" },
          email: { type: "string", format: "email", example: "aarav.sharma@institution.edu" },
          phone: { type: "string", example: "+91-9876543201" },
          gender: { type: "string", enum: ["Male", "Female", "Other"], example: "Male" },
          age: { type: "integer", example: 21 },
          department: { type: "string", example: "CSE" },
          course: { type: "string", example: "B.Tech Computer Science & Engineering" },
          year: { type: "integer", example: 4 },
          semester: { type: "integer", example: 7 },
          cgpa: { type: "number", format: "float", example: 9.42 },
          city: { type: "string", example: "Hyderabad" },
          state: { type: "string", example: "Telangana" },
          attendance_percentage: { type: "number", format: "float", example: 92.5 },
          skills: { type: "array", items: { type: "string" }, example: ["Python", "Machine Learning", "SQL"] },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" }
        }
      },
      CreateStudentDto: {
        type: "object",
        required: [
          "student_id",
          "first_name",
          "last_name",
          "email",
          "phone",
          "gender",
          "age",
          "department",
          "course",
          "year",
          "semester",
          "cgpa",
          "city",
          "state",
          "attendance_percentage",
          "skills"
        ],
        properties: {
          student_id: { type: "string", example: "STU2024099" },
          first_name: { type: "string", example: "Tarun" },
          last_name: { type: "string", example: "Kumar" },
          email: { type: "string", format: "email", example: "tarun.kumar@institution.edu" },
          phone: { type: "string", example: "+91-9876543299" },
          gender: { type: "string", enum: ["Male", "Female", "Other"], example: "Male" },
          age: { type: "integer", minimum: 16, maximum: 45, example: 20 },
          department: { type: "string", example: "CSE" },
          course: { type: "string", example: "B.Tech Computer Science" },
          year: { type: "integer", minimum: 1, maximum: 5, example: 3 },
          semester: { type: "integer", minimum: 1, maximum: 10, example: 5 },
          cgpa: { type: "number", minimum: 0, maximum: 10, example: 8.75 },
          city: { type: "string", example: "Bangalore" },
          state: { type: "string", example: "Karnataka" },
          attendance_percentage: { type: "number", minimum: 0, maximum: 100, example: 89.5 },
          skills: { type: "array", items: { type: "string" }, example: ["Python", "React", "PostgreSQL"] }
        }
      },
      UpdateStudentDto: {
        type: "object",
        properties: {
          first_name: { type: "string" },
          last_name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          gender: { type: "string" },
          age: { type: "integer" },
          department: { type: "string" },
          course: { type: "string" },
          year: { type: "integer" },
          semester: { type: "integer" },
          cgpa: { type: "number" },
          city: { type: "string" },
          state: { type: "string" },
          attendance_percentage: { type: "number" },
          skills: { type: "array", items: { type: "string" } }
        }
      },
      StudentStatsSummary: {
        type: "object",
        properties: {
          total_students: { type: "integer", example: 30 },
          average_cgpa: { type: "number", example: 8.65 },
          average_attendance: { type: "number", example: 87.2 },
          department_breakdown: { type: "object" },
          gender_distribution: { type: "object" },
          year_distribution: { type: "object" },
          attendance_risk_count: { type: "integer", example: 4 },
          cgpa_bracket_distribution: { type: "object" },
          top_skills: { type: "array", items: { type: "object" } }
        }
      },
      ChatResponse: {
        type: "object",
        properties: {
          answer: { type: "string" },
          intent: { type: "string", example: "sql_query" },
          trace: {
            type: "object",
            properties: {
              validated: { type: "boolean" },
              intent: { type: "string" },
              tools_executed: { type: "array", items: { type: "object" } },
              safety_check_passed: { type: "boolean" },
              grounded_record_count: { type: "integer" },
              latency_ms: { type: "integer" }
            }
          },
          suggested_questions: { type: "array", items: { type: "string" } }
        }
      }
    }
  }
};

export function getSwaggerHtml(specUrl: string = '/openapi.json'): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>API Documentation - Student Database AI</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.18.2/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.18.2/favicon-32x32.png" />
  <style>
    body { margin: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .topbar { display: none; }
    .header-bar {
      background: #0f172a;
      color: #ffffff;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #1e293b;
    }
    .header-title { font-size: 18px; font-weight: 600; letter-spacing: -0.01em; }
    .header-links a {
      color: #94a3b8;
      text-decoration: none;
      margin-left: 16px;
      font-size: 14px;
      transition: color 0.15s ease;
    }
    .header-links a:hover { color: #ffffff; }
  </style>
</head>
<body>
  <div class="header-bar">
    <div class="header-title">Student Database + AI API Specification (Swagger UI)</div>
    <div class="header-links">
      <a href="/">Back to Dashboard</a>
      <a href="/redoc">View ReDoc</a>
      <a href="/openapi.json" target="_blank">OpenAPI JSON</a>
    </div>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.18.2/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.18.2/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "${specUrl}",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`;
}

export function getRedocHtml(specUrl: string = '/openapi.json'): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <title>API Reference - Student Database AI</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
  <style>
    body { margin: 0; padding: 0; }
    .header-bar {
      background: #0f172a;
      color: #ffffff;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #1e293b;
    }
    .header-title { font-size: 16px; font-weight: 600; }
    .header-links a { color: #94a3b8; text-decoration: none; margin-left: 16px; font-size: 13px; }
    .header-links a:hover { color: #ffffff; }
  </style>
</head>
<body>
  <div class="header-bar">
    <div class="header-title">Student Database Management System - ReDoc Reference</div>
    <div class="header-links">
      <a href="/">Dashboard</a>
      <a href="/docs">Swagger UI</a>
      <a href="/openapi.json" target="_blank">OpenAPI JSON</a>
    </div>
  </div>
  <redoc spec-url="${specUrl}"></redoc>
  <script src="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"></script>
</body>
</html>`;
}
