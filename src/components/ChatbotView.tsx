import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  Database,
  ChevronDown,
  ChevronUp,
  Cpu,
  Clock,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { ChatResponse, LangGraphTrace, Student } from '../types.ts';
import { sendChatMessage } from '../services/api.ts';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  trace?: LangGraphTrace;
  retrieved_students?: Partial<Student>[];
  timestamp: string;
}

interface ChatbotViewProps {
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
  onSelectStudent?: (student: Student) => void;
}

export const ChatbotView: React.FC<ChatbotViewProps> = ({
  initialPrompt,
  onClearInitialPrompt
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content:
        "Hello! I am your academic database assistant. Ask me questions about enrolled students, department analytics, CGPAs, attendance risk, or technical skills.\n\nAll my responses are **strictly grounded in the verified database** through a multi-step LangGraph workflow with anti-hallucination guardrails.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'msg-welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const res: ChatResponse = await sendChatMessage(query, history);

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: res.answer,
        trace: res.trace,
        retrieved_students: res.retrieved_students,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMessage]);
      // Auto expand the trace for transparency
      setExpandedTraceId(assistantMessage.id);
    } catch (err: any) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `Error processing query: ${err?.message || 'An unexpected error occurred. Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    "How many students are in CSE?",
    "Show the top 5 students by CGPA.",
    "Which department has the highest average CGPA?",
    "Find students with Python and React skills.",
    "Show students with attendance below 75%.",
    "Which students are located in Hyderabad?"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[550px] bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Top Chat Header */}
      <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold flex items-center gap-2">
              <span>Student Intelligence Conversational AI</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-indigo-950 text-indigo-300 border border-indigo-800/80">
                LangGraph Workflow
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
                <span>Anti-Hallucination Grounding</span>
              </span>
              <span>·</span>
              <span>Google Gemini Powered</span>
            </div>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'msg-welcome',
                role: 'assistant',
                content:
                  "Conversation reset. Ask any question about students, departments, rankings, or competencies.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ])
          }
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-slate-800 transition-colors"
          title="Reset conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] shrink-0">
          Try:
        </span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 border border-slate-200 text-slate-700 rounded-md transition-all whitespace-nowrap text-xs shadow-2xs shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/40">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          const isExpanded = expandedTraceId === message.id;

          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white shadow-2xs ${
                  isUser ? 'bg-slate-800' : 'bg-indigo-600'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble Container */}
              <div className={`max-w-2xl space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 shadow-xs rounded-tl-none'
                  }`}
                >
                  {/* Clean Markdown text formatting */}
                  <div className="whitespace-pre-wrap font-sans space-y-2">
                    {message.content.split('\n\n').map((para, i) => (
                      <p key={i}>
                        {para.split('**').map((seg, segIdx) =>
                          segIdx % 2 === 1 ? (
                            <strong key={segIdx} className="font-semibold text-slate-900">
                              {seg}
                            </strong>
                          ) : (
                            seg
                          )
                        )}
                      </p>
                    ))}
                  </div>

                  <div
                    className={`mt-2 text-[10px] font-mono tabular-nums ${
                      isUser ? 'text-slate-400 text-right' : 'text-slate-400'
                    }`}
                  >
                    {message.timestamp}
                  </div>
                </div>

                {/* LangGraph Trace Inspector (for assistant messages with trace) */}
                {message.trace && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden text-xs">
                    {/* Collapsible Header */}
                    <button
                      onClick={() => setExpandedTraceId(isExpanded ? null : message.id)}
                      className="w-full px-3.5 py-2 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-slate-600 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="font-semibold text-slate-800">
                          LangGraph Pipeline Trace
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          ({message.trace.intent})
                        </span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Grounded ({message.trace.grounded_record_count} records)</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="font-mono text-[10px]">
                          {message.trace.latency_ms}ms
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {/* Expanded Pipeline Details */}
                    {isExpanded && (
                      <div className="p-4 space-y-3 border-t border-slate-200 bg-white">
                        {/* 5-Step Pipeline Progress */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                            <span className="text-slate-400 block text-[10px]">1. Validate</span>
                            <span className="font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Passed
                            </span>
                          </div>

                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                            <span className="text-slate-400 block text-[10px]">2. Intent</span>
                            <span className="font-semibold text-slate-900 font-mono">
                              {message.trace.intent}
                            </span>
                          </div>

                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                            <span className="text-slate-400 block text-[10px]">3. DB Tools</span>
                            <span className="font-semibold text-indigo-700 font-mono">
                              {message.trace.tools_executed.length} executed
                            </span>
                          </div>

                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                            <span className="text-slate-400 block text-[10px]">4. Safety Check</span>
                            <span className="font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </span>
                          </div>

                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                            <span className="text-slate-400 block text-[10px]">5. Latency</span>
                            <span className="font-semibold text-slate-700 font-mono">
                              {message.trace.latency_ms} ms
                            </span>
                          </div>
                        </div>

                        {/* Executed Tools Breakdown */}
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                            Controlled Tools Executed:
                          </div>
                          {message.trace.tools_executed.map((tool, tIdx) => (
                            <div
                              key={tIdx}
                              className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono"
                            >
                              <div className="flex items-center justify-between text-indigo-700 font-bold">
                                <span>{tool.tool_name}()</span>
                                <span className="text-slate-500 font-normal">
                                  {tool.records_retrieved} records retrieved
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-600 mt-1">
                                {tool.summary}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Grounded Records Accordion */}
                        {message.retrieved_students && message.retrieved_students.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                              Grounding Data Passed to Gemini ({message.retrieved_students.length} students):
                            </div>
                            <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                              {message.retrieved_students.map((st, sIdx) => (
                                <div key={sIdx} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                                  <span className="font-mono font-medium text-slate-900">
                                    [{st.student_id}] {st.first_name} {st.last_name} ({st.department})
                                  </span>
                                  <span className="font-mono text-slate-600">
                                    CGPA: {st.cgpa} · Att: {st.attendance_percentage}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="px-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 text-xs text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              <span>Analyzing intent and executing database retrieval...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder="Ask anything about students, grades, departments, or skills..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-900 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white rounded-xl transition-colors font-medium flex items-center gap-1.5 shadow-xs text-xs sm:text-sm"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
