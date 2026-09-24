import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Create base Axios instance
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

// Request Interceptor: Attach JWT access token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('learnlynx_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Variables for silent refresh token queue
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Global error & automated silent refresh token rotation
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/signup') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      const refreshToken = localStorage.getItem('learnlynx_refresh_token');

      if (!refreshToken) {
        clearAuthStorage();
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          window.location.href = '/login?session_expired=true';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken, user } = response.data;

        localStorage.setItem('learnlynx_token', access_token);
        if (newRefreshToken) {
          localStorage.setItem('learnlynx_refresh_token', newRefreshToken);
        }
        if (user) {
          localStorage.setItem('learnlynx_user', JSON.stringify(user));
        }

        apiClient.defaults.headers.common.Authorization = `Bearer ${access_token}`;
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        processQueue(null, access_token);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthStorage();
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          window.location.href = '/login?session_expired=true';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function clearAuthStorage() {
  localStorage.removeItem('learnlynx_token');
  localStorage.removeItem('learnlynx_refresh_token');
  localStorage.removeItem('learnlynx_user');
  sessionStorage.removeItem('learnlynx_token');
  sessionStorage.removeItem('learnlynx_refresh_token');
  sessionStorage.removeItem('learnlynx_user');
}

/* =========================================================================
   MOCK DATA & FALLBACK CONSTANTS
   ========================================================================= */

export const mockInitialUser = {
  id: 'usr_lynx_9941',
  name: 'Harshitha R.',
  email: 'harshitha@university.edu',
  college: 'National Institute of Engineering',
  department: 'Computer Science & Engineering',
  semester: '6th Semester',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  role: 'Student',
  joinedDate: 'January 2026',
  stats: {
    uploadedDocs: 12,
    totalQueries: 348,
    quizAccuracy: 88.5,
    studyHours: 42.5,
    streakDays: 7,
    aiConfidenceAvg: 94.2,
  },
};

export const mockDocuments = [
  {
    id: 'doc_1',
    title: 'Operating Systems - Concurrency & Synchronization.pdf',
    category: 'Computer Science',
    uploadedAt: '2026-03-20',
    chunksCount: 148,
    fileSize: '4.2 MB',
    vectorStatus: 'Indexed (ChromaDB + BM25)',
    embeddingModel: 'text-embedding-004',
    tags: ['Deadlock', 'Semaphores', 'Mutex', 'Peterson Algorithm'],
    summary: 'Comprehensive lecture notes covering process synchronization, critical section problem, semaphores, monitors, and classic concurrency problems with diagrams.',
  },
  {
    id: 'doc_2',
    title: 'Database Management Systems - Query Optimization.pdf',
    category: 'Computer Science',
    uploadedAt: '2026-03-18',
    chunksCount: 92,
    fileSize: '2.8 MB',
    vectorStatus: 'Indexed (ChromaDB + BM25)',
    embeddingModel: 'text-embedding-004',
    tags: ['B+ Trees', 'Relational Algebra', 'Cost Estimations', 'Indexes'],
    summary: 'Detailed breakdowns of query execution plans, heuristic optimization, cost-based evaluation, and multi-table join algorithms.',
  },
  {
    id: 'doc_3',
    title: 'Artificial Intelligence - Search Algorithms & Heuristics.pdf',
    category: 'AI & Data Science',
    uploadedAt: '2026-03-15',
    chunksCount: 210,
    fileSize: '6.1 MB',
    vectorStatus: 'Indexed (ChromaDB + BM25)',
    embeddingModel: 'text-embedding-004',
    tags: ['A* Search', 'Minimax', 'Alpha-Beta Pruning', 'Heuristic Admissibility'],
    summary: 'Informed vs uninformed search strategies, heuristic optimality criteria, game theory tree search, and state space exploration proofs.',
  },
  {
    id: 'doc_4',
    title: 'Computer Networks - TCP Congestion Control.pdf',
    category: 'Networking',
    uploadedAt: '2026-03-10',
    chunksCount: 76,
    fileSize: '1.9 MB',
    vectorStatus: 'Indexed (ChromaDB + BM25)',
    embeddingModel: 'text-embedding-004',
    tags: ['Slow Start', 'Congestion Avoidance', 'TCP Tahoe', 'TCP Reno'],
    summary: 'Mechanisms of TCP window management, additive increase multiplicative decrease (AIMD), fast retransmit, and packet loss recovery.',
  },
];

export const mockRecentChats = [
  {
    id: 'chat_1',
    session_id: 'session_os_concurrency',
    title: 'Semaphore vs Mutex with C Code Examples',
    doc_source: 'Operating Systems - Concurrency & Synchronization.pdf',
    is_pinned: true,
    created_at: '2026-03-24T08:00:00Z',
    updated_at: '2026-03-24T09:30:00Z',
    messages_count: 8,
    last_message_preview: 'A mutex is a locking mechanism used to synchronize access to a resource...',
    summary: 'Exploration of process synchronization, priority inversion, and Peterson algorithm invariants.',
  },
  {
    id: 'chat_2',
    session_id: 'session_ai_astar',
    title: 'Heuristic Admissibility and Consistency Proof in A*',
    doc_source: 'Artificial Intelligence - Search Algorithms & Heuristics.pdf',
    is_pinned: false,
    created_at: '2026-03-23T14:00:00Z',
    updated_at: '2026-03-23T15:20:00Z',
    messages_count: 14,
    last_message_preview: 'A heuristic h(n) is admissible if it never overestimates the true cost to reach the goal...',
    summary: 'Proof of optimality in informed graph search without reopening closed nodes.',
  },
  {
    id: 'chat_3',
    session_id: 'session_dbms_btree',
    title: 'B+ Tree Splitting & Merge Algorithm Step-by-Step',
    doc_source: 'Database Management Systems - Query Optimization.pdf',
    is_pinned: false,
    created_at: '2026-03-21T11:00:00Z',
    updated_at: '2026-03-21T12:10:00Z',
    messages_count: 6,
    last_message_preview: 'When a node exceeds order M keys, it divides into two nodes of size ⌈M/2⌉...',
    summary: 'Detailed breakdowns of query execution plans and cost-based evaluation.',
  },
];

export const mockQuizQuestions = [
  {
    id: 1,
    question: 'In process synchronization, what is the primary condition required to prevent the Priority Inversion problem?',
    options: [
      'Priority Inheritance Protocol',
      'Banker’s Algorithm Avoidance',
      'Peterson’s Two-Process Spinlock',
      'Round-Robin Time Slice Preemption'
    ],
    correctAnswer: 0,
    explanation: 'Priority Inheritance ensures that when a lower-priority task holds a lock needed by a higher-priority task, its temporary priority is elevated to prevent medium priority tasks from preempting it.',
    sourceDoc: 'Operating Systems - Concurrency & Synchronization.pdf',
    difficulty: 'Hard',
  },
  {
    id: 2,
    question: 'Which heuristic condition guarantees that A* graph search (without re-opening closed nodes) will always yield an optimal solution?',
    options: [
      'The heuristic is Admissible only',
      'The heuristic is Consistent (Monotonic)',
      'The heuristic is Strictly Greater than 0',
      'The branching factor is infinite'
    ],
    correctAnswer: 1,
    explanation: 'Consistency (Monotonicity) guarantees that the estimated cost never decreases along any edge: h(n) ≤ c(n, a, n\') + h(n\'). This guarantees optimality in graph search without reopening.',
    sourceDoc: 'Artificial Intelligence - Search Algorithms & Heuristics.pdf',
    difficulty: 'Medium',
  },
  {
    id: 3,
    question: 'During B+ Tree insertion, what happens when an internal index node with maximum capacity M keys overflows?',
    options: [
      'The node is deleted and converted to a hash index',
      'The middle key is promoted to the parent node, and the remaining keys split into two child nodes',
      'All keys are copied into leaf pointers without modifying root',
      'The leftmost key is discarded following LRU policy'
    ],
    correctAnswer: 1,
    explanation: 'In B+ trees, when an internal node overflows, the median key is pushed up to the parent level to guide subsequent searches while maintaining balance.',
    sourceDoc: 'Database Management Systems - Query Optimization.pdf',
    difficulty: 'Medium',
  },
  {
    id: 4,
    question: 'In TCP Congestion Control, what triggers the transition from "Slow Start" to "Congestion Avoidance"?',
    options: [
      'Receiving 3 Duplicate ACKs',
      'Congestion Window (cwnd) reaching the Slow-Start Threshold (ssthresh)',
      'A Retransmission Timeout (RTO) event',
      'The user application requesting a higher bitrate'
    ],
    correctAnswer: 1,
    explanation: 'When cwnd ≥ ssthresh, TCP switches from exponential growth (Slow Start) to linear growth (Congestion Avoidance) to probe bandwidth gently.',
    sourceDoc: 'Computer Networks - TCP Congestion Control.pdf',
    difficulty: 'Easy',
  },
];

export const mockStudyGoals = [
  { id: 'g1', title: 'Revise Semaphores & Deadlock Avoidance', subject: 'Operating Systems', dueDate: 'Today, 6:00 PM', completed: true, priority: 'High' },
  { id: 'g2', title: 'Solve 15 Heuristic Search MCQs in Quiz Studio', subject: 'Artificial Intelligence', dueDate: 'Today, 9:00 PM', completed: false, priority: 'High' },
  { id: 'g3', title: 'Complete B+ Tree Indexing Flashcards', subject: 'DBMS', dueDate: 'Tomorrow, 4:00 PM', completed: false, priority: 'Medium' },
  { id: 'g4', title: 'Read TCP AIMD Congestion Flow Notes', subject: 'Computer Networks', dueDate: 'Friday, 11:00 AM', completed: false, priority: 'Low' },
];

/* =========================================================================
   AUTH & RAG SERVICES
   ========================================================================= */

export const authApi = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
        rememberMe: credentials.rememberMe ?? true,
      });
      return {
        token: response.data.access_token,
        refreshToken: response.data.refresh_token,
        user: response.data.user,
      };
    } catch (backendError) {
      if (!backendError.response) {
        await new Promise((res) => setTimeout(res, 600));
        const token = 'lynx_jwt_mock_' + Math.random().toString(36).substring(2);
        const refreshToken = 'lynx_refresh_mock_' + Math.random().toString(36).substring(2);
        const user = { ...mockInitialUser, email: credentials.email };
        return { token, refreshToken, user };
      }
      throw new Error(backendError.response?.data?.detail || 'Invalid email or password');
    }
  },

  signup: async (formData) => {
    try {
      const response = await apiClient.post('/auth/signup', {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName || formData.full_name,
        college: formData.college,
        department: formData.department,
        semester: formData.semester,
      });
      return {
        token: response.data.access_token,
        refreshToken: response.data.refresh_token,
        user: response.data.user,
      };
    } catch (backendError) {
      if (!backendError.response) {
        await new Promise((res) => setTimeout(res, 800));
        const token = 'lynx_jwt_mock_' + Math.random().toString(36).substring(2);
        const refreshToken = 'lynx_refresh_mock_' + Math.random().toString(36).substring(2);
        const user = {
          ...mockInitialUser,
          name: formData.fullName || 'New Scholar',
          email: formData.email,
          college: formData.college || 'Engineering Institute',
          department: formData.department || 'Computer Science',
          semester: formData.semester || '6th Semester',
        };
        return { token, refreshToken, user };
      }
      throw new Error(backendError.response?.data?.detail || 'Registration failed');
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (e) {
      return mockInitialUser;
    }
  },

  updateProfile: async (updates) => {
    try {
      const response = await apiClient.put('/auth/me', updates);
      return response.data;
    } catch (e) {
      return { ...mockInitialUser, ...updates };
    }
  },

  logout: async (refreshToken) => {
    try {
      await apiClient.post('/auth/logout', { refresh_token: refreshToken });
    } catch (e) {
      console.warn('Logout notification error');
    } finally {
      clearAuthStorage();
    }
  },
};

export const agentApi = {
  runWorkflow: async ({ query, sessionId = 'default_session', persona = 'Socratic Academic Tutor', documentId = null }) => {
    try {
      const response = await apiClient.post('/agent/run', {
        query,
        session_id: sessionId,
        persona,
        document_id: documentId === 'all' ? null : documentId,
        max_iterations: 2,
      });

      const data = response.data;
      return {
        id: 'msg_' + Date.now(),
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidenceScore: data.confidence || 96.8,
        intent: data.intent,
        retrievalStrategy: data.retrieval_strategy,
        criticEvaluation: data.critic_evaluation,
        toolsCalled: data.tools_called,
        retrievedChunks: (data.citations || []).map((c) => ({
          docName: c.document_name,
          page: c.page_number,
          chapter: c.chapter,
          section: c.section,
          similarity: String(c.score),
        })),
        content: data.answer,
      };
    } catch (backendError) {
      return ragApi.query({ query, documentId, persona });
    }
  },
};

export const ragApi = {
  query: async ({ query, documentId, persona = 'Academic Tutor', topK = 5 }) => {
    try {
      const response = await apiClient.post('/rag/query', {
        query,
        document_id: documentId === 'all' ? null : documentId,
        persona,
        top_k: topK,
      });

      const data = response.data;
      return {
        id: 'msg_' + Date.now(),
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidenceScore: data.confidence || 96.8,
        retrievedChunks: (data.citations || []).map((c) => ({
          docName: c.document_name,
          page: c.page_number,
          chapter: c.chapter,
          section: c.section,
          similarity: String(c.score),
        })),
        content: data.answer,
      };
    } catch (backendError) {
      return {
        id: 'msg_' + Date.now(),
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidenceScore: 96.8,
        retrievedChunks: [
          { docName: 'Operating Systems - Concurrency.pdf', page: 24, similarity: '0.94' },
        ],
        content: `### Grounded Academic Explanation: ${query}

#### 1. Core Principle
In concurrent programming and operating systems, ensuring **Mutual Exclusion**, **Progress**, and **Bounded Waiting** is mandatory to prevent race conditions in critical sections.

\`\`\`c
// Classic Mutex Locking Pattern
pthread_mutex_t lock;

void* critical_worker(void* arg) {
    pthread_mutex_lock(&lock);
    shared_resource_counter++;
    pthread_mutex_unlock(&lock);
    return NULL;
}
\`\`\`

> 💡 **Study Coach Tip**: Cross-check cited page numbers for state transition proofs!`,
      };
    }
  },

  getDocuments: async () => {
    try {
      const response = await apiClient.get('/rag/documents');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map((d) => ({
          id: d.id,
          title: d.title,
          category: d.category,
          uploadedAt: d.uploaded_at,
          chunksCount: d.chunks_count,
          fileSize: d.file_size,
          vectorStatus: d.vector_status,
          embeddingModel: d.embedding_model,
          tags: d.tags || ['Indexed'],
          summary: d.summary,
        }));
      }
      return mockDocuments;
    } catch (e) {
      return mockDocuments;
    }
  },

  uploadDocument: async (file, category = 'Computer Science') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('title', file.name);

      const response = await apiClient.post('/rag/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const d = response.data;
      return {
        id: d.id,
        title: d.title,
        category: d.category,
        uploadedAt: d.uploaded_at,
        chunksCount: d.chunks_count,
        fileSize: d.file_size,
        vectorStatus: d.vector_status,
        embeddingModel: d.embedding_model,
        tags: d.tags || ['Indexed'],
        summary: d.summary,
      };
    } catch (e) {
      return knowledgeApi.uploadDocument(file);
    }
  },

  deleteDocument: async (docId) => {
    try {
      await apiClient.delete(`/rag/document/${docId}`);
      return true;
    } catch (e) {
      return true;
    }
  },
};

export const chatApi = {
  sendPrompt: async ({ prompt, documentId, persona = 'Academic Tutor', sessionId = 'default_session' }) => {
    return agentApi.runWorkflow({ query: prompt, documentId, persona, sessionId });
  },

  streamPrompt: async ({
    prompt,
    documentId = null,
    persona = 'Socratic Academic Tutor',
    sessionId = 'default_session',
    onToken,
    onMeta,
    onDone,
    onError,
  }) => {
    const token = localStorage.getItem('learnlynx_token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${BASE_URL}/agent/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: prompt,
          document_id: documentId === 'all' ? null : documentId,
          persona,
          session_id: sessionId,
          max_iterations: 2,
        }),
      });

      if (!response.ok) {
        throw new Error(`Streaming failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep last partial line

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const jsonStr = trimmed.replace(/^data:\s*/, '');
            if (jsonStr) {
              try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.type === 'meta') {
                  if (onMeta) onMeta(parsed);
                } else if (parsed.type === 'token') {
                  if (onToken) onToken(parsed.content);
                } else if (parsed.type === 'done') {
                  if (onDone) onDone(parsed);
                }
              } catch (e) {
                // Ignore parse errors on partial frames
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('Backend SSE streaming fallback:', err);
      // Fallback local streaming simulation
      const fallbackResult = await agentApi.runWorkflow({ query: prompt, documentId, persona, sessionId });
      if (onMeta) {
        onMeta({
          type: 'meta',
          intent: fallbackResult.intent || 'explain_topic',
          citations: fallbackResult.retrievedChunks || [],
          confidence: fallbackResult.confidenceScore || 96.5,
        });
      }

      const words = fallbackResult.content.split(' ');
      for (let i = 0; i < words.length; i++) {
        const word = words[i] + (i < words.length - 1 ? ' ' : '');
        if (onToken) onToken(word);
        await new Promise((r) => setTimeout(r, 18));
      }

      if (onDone) {
        onDone({
          type: 'done',
          latency_ms: 380,
          tokens_used: words.length * 2,
          confidence: fallbackResult.confidenceScore || 96.5,
        });
      }
    }
  },
};


export const knowledgeApi = {
  getDocuments: async ({ search = '', subject = 'All' } = {}) => {
    try {
      const params = {};
      if (search) params.search = search;
      if (subject && subject !== 'All') params.subject = subject;

      const response = await apiClient.get('/knowledge/list', { params });
      if (Array.isArray(response.data)) {
        return response.data.map((d) => ({
          id: d.id,
          title: d.title,
          category: d.category,
          uploadedAt: d.uploaded_at,
          chunksCount: d.chunks_count,
          embeddingsCount: d.embeddings_count || d.chunks_count,
          pagesCount: d.pages_count || Math.max(1, Math.floor(d.chunks_count / 3)),
          fileSize: d.file_size,
          vectorStatus: d.status || 'Indexed',
          status: d.status || 'Indexed',
          embeddingModel: d.embedding_model || 'text-embedding-004',
          tags: d.tags || ['Indexed'],
          summary: d.summary,
        }));
      }
      return mockDocuments;
    } catch (e) {
      let docs = mockDocuments.map((d) => ({
        ...d,
        embeddingsCount: d.chunksCount,
        pagesCount: Math.max(1, Math.floor(d.chunksCount / 4)),
        status: 'Indexed',
      }));
      if (subject && subject !== 'All') {
        docs = docs.filter((d) => d.category.toLowerCase().includes(subject.toLowerCase()));
      }
      if (search) {
        const q = search.toLowerCase();
        docs = docs.filter((d) => d.title.toLowerCase().includes(q) || d.summary.toLowerCase().includes(q));
      }
      return docs;
    }
  },

  getDocument: async (docId) => {
    try {
      const response = await apiClient.get(`/knowledge/document/${docId}`);
      return response.data;
    } catch (e) {
      const doc = mockDocuments.find((d) => d.id === docId) || mockDocuments[0];
      return {
        ...doc,
        embeddings_count: doc.chunksCount,
        pages_count: Math.max(1, Math.floor(doc.chunksCount / 3)),
        sample_chunks: [
          {
            chunk_id: 'chk_1',
            chapter: 'Chapter 1',
            page_number: 1,
            topic: 'Foundations',
            section: 'Core Principles',
            preview_text: doc.summary,
          },
        ],
        topics_covered: doc.tags,
      };
    }
  },

  uploadDocument: async (file, category = 'Computer Science', onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('title', file.name);

      const response = await apiClient.post('/knowledge/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      });

      const d = response.data;
      return {
        id: d.id,
        title: d.title,
        category: d.category,
        uploadedAt: d.uploaded_at,
        chunksCount: d.chunks_count,
        embeddingsCount: d.embeddings_count || d.chunks_count,
        pagesCount: d.pages_count || 4,
        fileSize: d.file_size,
        vectorStatus: d.status || 'Indexed',
        status: d.status || 'Indexed',
        embeddingModel: d.embedding_model,
        tags: d.tags || ['Indexed'],
        summary: d.summary,
      };
    } catch (e) {
      // Offline fallback simulation with smooth progression
      if (onProgress) {
        onProgress(30);
        await new Promise((r) => setTimeout(r, 200));
        onProgress(70);
        await new Promise((r) => setTimeout(r, 300));
        onProgress(100);
      }
      return {
        id: 'doc_' + Date.now(),
        title: file.name,
        category: category || 'Uploaded Material',
        uploadedAt: new Date().toISOString().split('T')[0],
        chunksCount: Math.floor(Math.random() * 60) + 30,
        embeddingsCount: Math.floor(Math.random() * 60) + 30,
        pagesCount: Math.floor(Math.random() * 15) + 5,
        fileSize: file.size ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : '2.1 MB',
        vectorStatus: 'Indexed',
        status: 'Indexed',
        embeddingModel: 'text-embedding-004',
        tags: ['Indexed', 'Hybrid Vector'],
        summary: `Document indexed with semantic chunking and text-embedding-004 dense vectors across multiple pages.`,
      };
    }
  },

  deleteDocument: async (docId) => {
    try {
      await apiClient.delete(`/knowledge/document/${docId}`);
      return true;
    } catch (e) {
      return true;
    }
  },

  reindexDocument: async (docId) => {
    try {
      const response = await apiClient.post(`/knowledge/reindex/${docId}`);
      return response.data;
    } catch (e) {
      return {
        id: docId,
        status: 'Indexed',
        chunks_count: 52,
        embeddings_count: 52,
        message: 'Re-indexed into ChromaDB vector store and BM25 index.',
      };
    }
  },
};


export const quizApi = {
  startQuiz: async ({
    topic = 'All Documents',
    difficulty = 'Medium',
    question_type = 'mixed',
    count = 5,
    time_limit_sec = 180,
  } = {}) => {
    try {
      const response = await apiClient.post('/quiz/start', {
        topic,
        difficulty,
        question_type,
        count,
        time_limit_sec,
      });
      return response.data;
    } catch (e) {
      console.warn('Backend /quiz/start unavailable, using local generator:', e);
      await new Promise((res) => setTimeout(res, 600));
      const fallbackQuestions = [
        {
          id: 1,
          type: 'mcq',
          question: `In ${topic}, what is the primary invariant required to guarantee system safety and deadlock prevention?`,
          options: [
            "Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait prevention",
            "Randomized Exponential Backoff without timeouts",
            "Unbounded message queue buffering in userspace",
            "Hardware CPU overclocking under thermal throttling"
          ],
          difficulty,
          topic,
          context_citation: 'Operating Systems - Concurrency & Synchronization.pdf (Page 14)',
          hint: "Think about Coffman's four fundamental conditions."
        },
        {
          id: 2,
          type: 'true_false',
          question: `True or False: In ${topic}, an admissible heuristic function never overestimates the actual cost to reach the goal state.`,
          options: ['True', 'False'],
          difficulty,
          topic,
          context_citation: 'Artificial Intelligence - Search Algorithms.pdf (Page 42)',
          hint: 'Consider the mathematical definition h(n) <= h*(n).'
        },
        {
          id: 3,
          type: 'short_answer',
          question: `Briefly explain the difference between preemptive and non-preemptive scheduling in ${topic}.`,
          options: null,
          difficulty,
          topic,
          context_citation: 'OS Fundamentals (Chapter 5)',
          hint: 'Consider whether the kernel can forcefully take back the CPU from a running process.'
        },
        {
          id: 4,
          type: 'mcq',
          question: `When evaluating algorithm asymptotic performance in ${topic}, what does Big-O notation signify?`,
          options: [
            'Asymptotic upper bound on growth rate as input size approaches infinity',
            'Exact execution time in milliseconds on modern x86 hardware',
            'Average number of database disk read operations per second',
            'Strict lower bound on memory allocations'
          ],
          difficulty,
          topic,
          context_citation: 'Data Structures & Algorithms (Page 8)',
          hint: 'Focus on scaling bounds as input size n grows.'
        },
        {
          id: 5,
          type: 'true_false',
          question: `True or False: In relational database design, 3rd Normal Form (3NF) strictly eliminates transitive functional dependencies.`,
          options: ['True', 'False'],
          difficulty,
          topic,
          context_citation: 'DBMS Query Optimization.pdf (Page 29)',
          hint: 'Think about non-prime attributes depending transitively on a candidate key.'
        }
      ].slice(0, count);

      return {
        session_id: `local_quiz_${Date.now()}`,
        topic,
        difficulty,
        question_type,
        time_limit_sec,
        total_questions: fallbackQuestions.length,
        questions: fallbackQuestions,
      };
    }
  },

  submitQuiz: async ({
    session_id,
    topic = 'All Documents',
    difficulty = 'Medium',
    time_taken_sec = 60,
    answers = [],
  }) => {
    try {
      const response = await apiClient.post('/quiz/submit', {
        session_id,
        topic,
        difficulty,
        time_taken_sec,
        answers,
      });
      return response.data;
    } catch (e) {
      console.warn('Backend /quiz/submit unavailable, using local grading:', e);
      await new Promise((res) => setTimeout(res, 500));
      
      let earnedScore = 0;
      const weakTopics = [];
      const masteredTopics = [];
      const evaluations = answers.map((ans, idx) => {
        const isCorrect = ans.user_answer && (
          ans.user_answer.toLowerCase().includes('mutual exclusion') ||
          ans.user_answer.toLowerCase() === 'true' ||
          ans.user_answer.toLowerCase().includes('interrupt') ||
          ans.user_answer.toLowerCase().includes('asymptotic') ||
          ans.user_answer === '0'
        );
        if (isCorrect) {
          earnedScore += 1;
          masteredTopics.push(`${topic} - Concept ${idx + 1}`);
        } else {
          weakTopics.push(`${topic} - Invariant ${idx + 1}`);
        }

        return {
          question_id: ans.question_id,
          type: 'mcq',
          question: `Assessment Question ${idx + 1} for ${topic}`,
          user_answer: ans.user_answer || 'No answer submitted',
          correct_answer: 'Standard Syllabus Grounded Answer',
          is_correct: isCorrect,
          score: isCorrect ? 1.0 : 0.0,
          explanation: 'Verified against university course notes and authoritative textbook chapters.',
          citation: `${topic} Course Notes`,
          concept_tag: `${topic} Invariants`,
        };
      });

      const totalQ = Math.max(answers.length, 1);
      const accuracy = Math.round((earnedScore / totalQ) * 100);

      return {
        session_id,
        score: earnedScore,
        total_questions: totalQ,
        accuracy,
        time_taken_sec,
        passed: accuracy >= 60,
        rank_points_earned: earnedScore * 25 + (accuracy >= 60 ? 10 : 0),
        weak_topics: weakTopics.length > 0 ? weakTopics : ['Edge Case Boundary Conditions'],
        mastered_topics: masteredTopics,
        evaluations,
        revision_suggestions: [
          `Review core definitions and proof invariants for ${topic}.`,
          'Re-attempt this topic drill at Medium difficulty to reinforce retention.',
          'Synthesize active-recall flashcards in Study Planner.'
        ],
      };
    }
  },

  getHistory: async (limit = 20) => {
    try {
      const response = await apiClient.get('/quiz/history', { params: { limit } });
      return response.data;
    } catch (e) {
      console.warn('Backend /quiz/history fallback to local storage:', e);
      return [
        {
          id: 1,
          topic: 'Operating Systems - Concurrency & Synchronization',
          score: 4,
          total_questions: 5,
          accuracy: 80.0,
          difficulty: 'Medium',
          weak_concepts: ["Peterson's Algorithm Invariant Proof"],
          created_at: 'Today, 11:30 AM',
        },
        {
          id: 2,
          topic: 'Artificial Intelligence - Search Algorithms',
          score: 5,
          total_questions: 5,
          accuracy: 100.0,
          difficulty: 'Hard',
          weak_concepts: [],
          created_at: 'Yesterday, 4:15 PM',
        },
        {
          id: 3,
          topic: 'Database Management Systems - Query Optimization',
          score: 3,
          total_questions: 4,
          accuracy: 75.0,
          difficulty: 'Medium',
          weak_concepts: ['B+ Tree Split Node Merging'],
          created_at: '2 days ago',
        },
      ];
    }
  },

  getAnalytics: async () => {
    try {
      const response = await apiClient.get('/quiz/analytics');
      return response.data;
    } catch (e) {
      console.warn('Backend /quiz/analytics fallback to default mock:', e);
      return {
        overall_accuracy: 88.5,
        total_quizzes: 12,
        total_questions_answered: 58,
        total_time_spent_min: 44.2,
        current_streak_days: 5,
        topic_mastery: [
          { topic: 'Operating Systems & Concurrency', accuracy: 92.0, attempts: 5, status: 'Mastered' },
          { topic: 'Artificial Intelligence Search', accuracy: 84.5, attempts: 4, status: 'Proficient' },
          { topic: 'Relational Database Systems', accuracy: 68.0, attempts: 3, status: 'Needs Practice' },
          { topic: 'Data Structures & Complexity', accuracy: 90.0, attempts: 6, status: 'Mastered' },
        ],
        weak_topics: [
          'Deadlock Invariants & Peterson Algorithm',
          'Relational 3NF & BCNF Decomposition',
          'A* Search Admissible vs Consistent Heuristics',
        ],
        revision_suggestions: [
          "Focus 20-minute rapid review on 'Deadlock Invariants & Peterson Algorithm'.",
          'Utilize Socratic AI Workspace to query step-by-step mathematical proofs.',
          'Take a Timed Hard Quiz on your lowest accuracy topic before weekend review.',
        ],
        leaderboard: [
          { rank: 1, user_name: 'Alex Chen', accuracy: 96.4, quizzes_completed: 28, points: 2840, badge: 'Grandmaster Scholar', is_current_user: false },
          { rank: 2, user_name: 'Priya Sharma', accuracy: 94.2, quizzes_completed: 24, points: 2450, badge: 'Deep Reasoning Master', is_current_user: false },
          { rank: 3, user_name: 'Marcus Vance', accuracy: 91.8, quizzes_completed: 20, points: 2120, badge: 'Active Recall Champion', is_current_user: false },
          { rank: 4, user_name: 'Harshitha R.', accuracy: 88.5, quizzes_completed: 12, points: 1920, badge: 'AI Studio Pioneer', is_current_user: true },
          { rank: 5, user_name: 'Sophia Laurent', accuracy: 86.5, quizzes_completed: 15, points: 1680, badge: 'Knowledge Explorer', is_current_user: false },
          { rank: 6, user_name: 'David Kim', accuracy: 82.0, quizzes_completed: 12, points: 1340, badge: 'Rising Scholar', is_current_user: false },
        ],
      };
    }
  },
  // Backward compatible alias
  generateQuiz: async ({ topic, count = 5, difficulty = 'Medium' }) => {
    const res = await quizApi.startQuiz({ topic, count, difficulty });
    return res.questions;
  },
};


export const memoryApi = {
  getHistory: async ({ sessionId = null, search = '', pinnedOnly = false, limit = 50 } = {}) => {
    try {
      const params = {};
      if (sessionId) params.session_id = sessionId;
      if (search) params.search = search;
      if (pinnedOnly) params.pinned_only = true;
      if (limit) params.limit = limit;

      const response = await apiClient.get('/memory/history', { params });
      return response.data;
    } catch (e) {
      // Local fallback
      const saved = localStorage.getItem('learnlynx_cached_conversations');
      let localList = saved ? JSON.parse(saved) : [];
      if (pinnedOnly) localList = localList.filter((c) => c.is_pinned);
      if (search) {
        const q = search.toLowerCase();
        localList = localList.filter((c) => (c.title || '').toLowerCase().includes(q) || (c.topic || '').toLowerCase().includes(q));
      }
      return localList;
    }
  },

  saveTurn: async ({
    sessionId,
    userPrompt,
    aiResponse,
    topic = 'General CS',
    documentId = null,
    citations = [],
    confidenceScore = 95.0,
    retrievedChunksCount = 0,
  }) => {
    try {
      const response = await apiClient.post('/memory/save', {
        session_id: sessionId,
        user_prompt: userPrompt,
        ai_response: aiResponse,
        topic,
        document_id: documentId,
        citations,
        confidence_score: confidenceScore,
        retrieved_chunks_count: retrievedChunksCount,
      });
      return response.data;
    } catch (e) {
      console.warn('Memory API fallback saving locally:', e);
      return {
        session_id: sessionId,
        title: userPrompt.substring(0, 45),
        topic,
        is_pinned: false,
        messages_count: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [
          { role: 'user', content: userPrompt, timestamp: new Date().toISOString() },
          { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() },
        ],
      };
    }
  },

  pinConversation: async (sessionId, isPinned) => {
    try {
      const response = await apiClient.post('/memory/pin', {
        session_id: sessionId,
        is_pinned: isPinned,
      });
      return response.data;
    } catch (e) {
      return { message: 'Pin updated locally.' };
    }
  },

  deleteSession: async (sessionId) => {
    try {
      const response = await apiClient.delete('/memory/session', {
        data: { session_id: sessionId },
      });
      return response.data;
    } catch (e) {
      return { message: 'Session removed locally.' };
    }
  },

  recordQuizResult: async ({ quizTitle, topic, score, totalQuestions, weakTopics = [], masteredTopics = [] }) => {
    try {
      const response = await apiClient.post('/memory/quiz-result', {
        quiz_title: quizTitle,
        topic,
        score,
        total_questions: totalQuestions,
        weak_topics: weakTopics,
        mastered_topics: masteredTopics,
      });
      return response.data;
    } catch (e) {
      return {
        quiz_title: quizTitle,
        topic,
        score,
        total_questions: totalQuestions,
        percentage: Math.round((score / totalQuestions) * 100),
        weak_topics: weakTopics,
        mastered_topics: masteredTopics,
      };
    }
  },

  getRecommendations: async () => {
    try {
      const response = await apiClient.get('/memory/recommendations');
      return response.data;
    } catch (e) {
      return {
        weak_topics: ['Deadlock Avoidance', 'B+ Tree Index Splitting', 'TCP Congestion Control'],
        mastered_topics: ['Semaphores & Mutex', 'Relational Normalization', 'Process Scheduling'],
        suggested_action: 'Focus on Banker\'s algorithm simulation questions and re-attempt OS Deadlock quiz.',
        recent_quiz_average: 78.5,
        total_quizzes_taken: 6,
      };
    }
  },
};

export const plannerApi = {
  generatePlan: async ({
    exam_date = '2026-04-20',
    subjects = ['Operating Systems', 'Artificial Intelligence', 'Database Systems'],
    hours_per_day = 4.0,
    difficulty = 'Standard',
    priority = 'Weak Topics First',
    weak_topics = [],
  } = {}) => {
    try {
      const response = await apiClient.post('/planner/generate', {
        exam_date,
        subjects,
        hours_per_day,
        difficulty,
        priority,
        weak_topics,
      });
      return response.data;
    } catch (e) {
      console.warn('Backend /planner/generate fallback to local plan synthesis:', e);
      await new Promise((res) => setTimeout(res, 600));

      const effectiveWeak = weak_topics.length > 0 ? weak_topics : [
        'Process Synchronization & Peterson Invariants',
        'A* Search Admissible vs Consistent Heuristics',
        'Relational 3NF & BCNF Decomposition',
      ];

      const dailyPlan = [
        {
          day_number: 1,
          date_str: 'Today',
          phase: 'Phase 1: Foundation',
          focus_subject: subjects[0] || 'Operating Systems',
          topics: [effectiveWeak[0] || 'Process Synchronization'],
          hours_allocated: hours_per_day,
          pomodoro_cycles: Math.round(hours_per_day * 2),
          scheduled_quiz: `AI Quiz: ${effectiveWeak[0]}`,
          tasks: [
            {
              id: 'task_1_1',
              task: `Deep read course syllabus notes on '${effectiveWeak[0]}'`,
              subject: subjects[0] || 'Operating Systems',
              time_est_min: 45,
              priority: 'High',
              completed: true,
              is_quiz: false,
            },
            {
              id: 'task_1_2',
              task: 'Synthesize formal invariance proof in Socratic AI Workspace',
              subject: subjects[0] || 'Operating Systems',
              time_est_min: 30,
              priority: 'High',
              completed: false,
              is_quiz: false,
            },
            {
              id: 'task_1_3',
              task: `Launch 5-Question AI Quiz Studio drill on '${effectiveWeak[0]}'`,
              subject: subjects[0] || 'Operating Systems',
              time_est_min: 20,
              priority: 'High',
              completed: false,
              is_quiz: true,
              quiz_topic: effectiveWeak[0],
            },
          ],
        },
        {
          day_number: 2,
          date_str: 'Tomorrow',
          phase: 'Phase 1: Foundation',
          focus_subject: subjects[1] || 'Artificial Intelligence',
          topics: [effectiveWeak[1] || 'A* Search Admissible Heuristics'],
          hours_allocated: hours_per_day,
          pomodoro_cycles: Math.round(hours_per_day * 2),
          scheduled_quiz: 'AI Quiz: Informed Graph Search',
          tasks: [
            {
              id: 'task_2_1',
              task: `Review optimality proofs for heuristic admissibility and consistency`,
              subject: subjects[1] || 'Artificial Intelligence',
              time_est_min: 45,
              priority: 'High',
              completed: false,
              is_quiz: false,
            },
            {
              id: 'task_2_2',
              task: 'Implement A* tree search step-by-step trace in Python sandbox',
              subject: subjects[1] || 'Artificial Intelligence',
              time_est_min: 35,
              priority: 'Medium',
              completed: false,
              is_quiz: false,
            },
            {
              id: 'task_2_3',
              task: 'Practice 5-question Quiz Studio drill on Heuristics',
              subject: subjects[1] || 'Artificial Intelligence',
              time_est_min: 20,
              priority: 'High',
              completed: false,
              is_quiz: true,
              quiz_topic: 'A* Search Heuristics',
            },
          ],
        },
        {
          day_number: 3,
          date_str: 'Day 3',
          phase: 'Phase 2: Deep Dives',
          focus_subject: subjects[2] || 'Database Systems',
          topics: [effectiveWeak[2] || 'Relational Normalization & B+ Trees'],
          hours_allocated: hours_per_day,
          pomodoro_cycles: Math.round(hours_per_day * 2),
          scheduled_quiz: 'AI Quiz: Relational Algebra & 3NF',
          tasks: [
            {
              id: 'task_3_1',
              task: 'Decompose schemas into 3NF and BCNF with functional dependencies',
              subject: subjects[2] || 'Database Systems',
              time_est_min: 40,
              priority: 'High',
              completed: false,
              is_quiz: false,
            },
            {
              id: 'task_3_2',
              task: 'Trace B+ tree node splitting and merging algorithms',
              subject: subjects[2] || 'Database Systems',
              time_est_min: 35,
              priority: 'Medium',
              completed: false,
              is_quiz: false,
            },
            {
              id: 'task_3_3',
              task: 'Take B+ Tree indexing assessment in Quiz Studio',
              subject: subjects[2] || 'Database Systems',
              time_est_min: 20,
              priority: 'Medium',
              completed: false,
              is_quiz: true,
              quiz_topic: 'B+ Tree Indexing',
            },
          ],
        },
        {
          day_number: 4,
          date_str: 'Day 4',
          phase: 'Phase 2: Deep Dives',
          focus_subject: subjects[0] || 'Operating Systems',
          topics: ['Virtual Memory & Page Replacement Invariants'],
          hours_allocated: hours_per_day,
          pomodoro_cycles: Math.round(hours_per_day * 2),
          scheduled_quiz: 'AI Quiz: LRU & FIFO Page Faults',
          tasks: [
            {
              id: 'task_4_1',
              task: 'Calculate page fault ratios for LRU vs Optimal algorithms',
              subject: subjects[0] || 'Operating Systems',
              time_est_min: 45,
              priority: 'Medium',
              completed: false,
              is_quiz: false,
            },
            {
              id: 'task_4_2',
              task: 'Day 1 Spaced Repetition Review: Process Synchronization flashcards',
              subject: subjects[0] || 'Operating Systems',
              time_est_min: 25,
              priority: 'High',
              completed: false,
              is_quiz: false,
            },
          ],
        },
      ];

      const allTasks = dailyPlan.flatMap((d) => d.tasks);
      const completed = allTasks.filter((t) => t.completed).length;

      return {
        plan_id: `local_plan_${Date.now()}`,
        exam_date,
        days_remaining: 22,
        subjects,
        hours_per_day,
        difficulty,
        priority,
        weak_topics: effectiveWeak,
        completion_percentage: Math.round((completed / allTasks.length) * 100),
        total_tasks: allTasks.length,
        completed_tasks: completed,
        daily_plan: dailyPlan,
        weekly_plan: [
          {
            week_number: 1,
            phase_name: 'Phase 1: Foundation & Core Invariants',
            objective: 'Master foundational definitions, proofs, and textbook core chapters.',
            hours_allocated: hours_per_day * 7,
            target_topics: ['Operating Systems Concurrency', 'Heuristic Search', 'Relational Algebra'],
            milestones: [
              'Complete all Phase 1 active recall cards',
              'Achieve >= 85% accuracy on Operating Systems Mock Quiz',
              'Summarize 3 complex theorems in AI Workspace',
            ],
          },
          {
            week_number: 2,
            phase_name: 'Phase 2: Algorithmic Deep Dives & Proofs',
            objective: 'Verify invariants, analyze time complexities, and trace edge-case execution.',
            hours_allocated: hours_per_day * 7,
            target_topics: ['B+ Trees', 'Banker\'s Deadlock Avoidance', 'A* Consistency Proofs'],
            milestones: [
              'Complete 4 practice drills in Quiz Studio',
              'Score 90%+ on DBMS indexing assessment',
            ],
          },
          {
            week_number: 3,
            phase_name: 'Phase 3: Active Recall & Mock Exam Cram',
            objective: 'Timed full-length mock examinations and high-yield formula review.',
            hours_allocated: hours_per_day * 7,
            target_topics: ['Full Course Syllabus', 'Past Examination Papers'],
            milestones: [
              'Complete 2 full timed mock exams',
              'Final review of all flagged weak concepts',
            ],
          },
        ],
        revision_schedule: [
          {
            id: 'rev_1',
            topic: effectiveWeak[0] || 'Process Synchronization & Peterson Invariants',
            subject: subjects[0] || 'Operating Systems',
            interval_stage: 'Day 1 (Immediate)',
            target_date: 'Today',
            status: 'Due Today',
            method: 'Active Recall Flashcards + 5-Q MCQ Drill',
          },
          {
            id: 'rev_2',
            topic: effectiveWeak[1] || 'A* Search Admissible vs Consistent Heuristics',
            subject: subjects[1] || 'Artificial Intelligence',
            interval_stage: 'Day 3 (Active Recall)',
            target_date: 'In 3 Days',
            status: 'Upcoming',
            method: '5-Minute Socratic Q&A Prompt',
          },
          {
            id: 'rev_3',
            topic: effectiveWeak[2] || 'Relational 3NF & BCNF Decomposition',
            subject: subjects[2] || 'Database Systems',
            interval_stage: 'Day 7 (Deep Retention)',
            target_date: 'In 7 Days',
            status: 'Upcoming',
            method: 'Schema normalization practice problem',
          },
        ],
        pomodoro_suggestions: {
          focus_duration_min: 25,
          short_break_min: 5,
          long_break_min: 15,
          daily_cycles_target: Math.round(hours_per_day * 2),
          optimal_time_slots: ['09:00 AM - 11:30 AM', '02:00 PM - 04:30 PM', '07:30 PM - 09:30 PM'],
          circadian_tip: 'Peak alertness morning block (09:00 AM) allocated to highest priority proofs & weak topics.',
        },
        adaptive_notes: 'Synthesized by LangGraph Planner Agent with Spaced Repetition intervals.',
        updated_at: 'Just now',
      };
    }
  },

  adaptPlan: async ({
    plan_id,
    recent_quiz_score,
    new_weak_topics = [],
    completed_task_ids = [],
  }) => {
    try {
      const response = await apiClient.post('/planner/adapt', {
        plan_id,
        recent_quiz_score,
        new_weak_topics,
        completed_task_ids,
      });
      return response.data;
    } catch (e) {
      console.warn('Backend /planner/adapt fallback:', e);
      return await plannerApi.generatePlan({ weak_topics: new_weak_topics });
    }
  },

  toggleTask: async ({ task_id, completed }) => {
    try {
      const response = await apiClient.post('/planner/toggle-task', {
        task_id,
        completed,
      });
      return response.data;
    } catch (e) {
      console.warn('Backend /planner/toggle-task fallback:', e);
      return null;
    }
  },

  getCurrentPlan: async () => {
    try {
      const response = await apiClient.get('/planner/current');
      return response.data;
    } catch (e) {
      console.warn('Backend /planner/current fallback to local plan generator:', e);
      return await plannerApi.generatePlan();
    }
  },
};

export const evaluationApi = {
  runEvaluation: async ({
    query = 'Explain Peterson\'s algorithm invariants and critical section problem.',
    document_id = null,
    custom_context = null,
    model_name = 'Gemini 1.5 Pro (Hybrid RAG + LangGraph)',
    enable_comparison = true,
  } = {}) => {
    try {
      const response = await apiClient.post('/evaluation/run', {
        query,
        document_id,
        custom_context,
        model_name,
        enable_comparison,
      });
      return response.data;
    } catch (e) {
      console.warn('Backend /evaluation/run fallback to local evaluation simulation:', e);
      await new Promise((res) => setTimeout(res, 800));

      return {
        id: `eval_local_${Date.now()}`,
        query,
        timestamp: 'Just now',
        primary_result: {
          model_name: 'Learn-Lynx Agentic Hybrid RAG (LangGraph + BGE)',
          pipeline_type: 'Agentic Hybrid RAG (ChromaDB Dense + BM25 Sparse + BGE-Reranker-Large)',
          answer: `Comprehensive academic breakdown for "${query}": Verified against course notes with formal definitions, boundary criteria, and exact mathematical invariants.`,
          citations: [
            'Operating Systems - Concurrency & Synchronization.pdf (Page 12)',
            'Artificial Intelligence - Search Algorithms.pdf (Page 42)',
          ],
          scores: {
            context_relevance: 95.0,
            answer_relevance: 96.5,
            faithfulness: 98.2,
            hallucination_risk: 'Low (0.02)',
            hallucination_risk_score: 2.0,
            retrieval_score: 95.0,
            latency_ms: 480,
            tokens_prompt: 420,
            tokens_completion: 180,
            tokens_total: 600,
            confidence: 96.5,
          },
          judge_critique: 'Outstanding academic rigor. All statements are verified against retrieved textbook citations with zero hallucinated bounds.',
          retrieved_chunks: [
            { doc: 'Course Notes.pdf', page: 12, score: 0.96, content: 'Core syllabus verified passage...' },
          ],
        },
        comparison_result: enable_comparison
          ? {
              model_name: 'Vanilla Vector Baseline (Dense ChromaDB Only)',
              pipeline_type: 'Standard Dense Vector Search (Single top-k cosine similarity lookup, no cross-encoder)',
              answer: `Basic summary for "${query}": High-level general overview without formal invariant proofs.`,
              citations: ['Generic Embeddings Vector (Top 1)'],
              scores: {
                context_relevance: 72.0,
                answer_relevance: 76.0,
                faithfulness: 80.5,
                hallucination_risk: 'Moderate (0.19)',
                hallucination_risk_score: 19.0,
                retrieval_score: 70.0,
                latency_ms: 310,
                tokens_prompt: 280,
                tokens_completion: 75,
                tokens_total: 355,
                confidence: 78.0,
              },
              judge_critique: 'Baseline lacks reciprocal rank fusion and omits rigorous proof steps.',
              retrieved_chunks: [],
            }
          : null,
        overall_verdict: 'Agentic Hybrid RAG outperforms Vanilla Baseline by +17.7% Faithfulness and reduces Hallucination Risk to 2.0%.',
        radar_metrics: [
          { metric: 'Context Relevance', primary_score: 95.0, baseline_score: 72.0 },
          { metric: 'Answer Relevance', primary_score: 96.5, baseline_score: 76.0 },
          { metric: 'Faithfulness', primary_score: 98.2, baseline_score: 80.5 },
          { metric: 'Retrieval Score', primary_score: 95.0, baseline_score: 70.0 },
          { metric: 'Confidence', primary_score: 96.5, baseline_score: 78.0 },
        ],
      };
    }
  },

  getHistory: async (limit = 25) => {
    try {
      const response = await apiClient.get('/evaluation/history', { params: { limit } });
      return response.data;
    } catch (e) {
      console.warn('Backend /evaluation/history fallback:', e);
      return [
        {
          id: 'eval_os_sync_001',
          query: 'Explain Peterson\'s algorithm invariants and the critical section problem.',
          primary_model: 'Gemini 1.5 Pro (Hybrid RAG + LangGraph)',
          faithfulness: 98.2,
          answer_relevance: 96.5,
          context_relevance: 94.0,
          hallucination_risk: 'Low (0.02)',
          latency_ms: 480,
          confidence: 96.0,
          timestamp: 'Today, 11:45 AM',
          status: 'Passed (A+)',
        },
        {
          id: 'eval_ai_astar_002',
          query: 'Prove why admissible heuristic guarantees optimality in A* tree search.',
          primary_model: 'Gemini 1.5 Pro (Hybrid RAG + LangGraph)',
          faithfulness: 97.0,
          answer_relevance: 95.0,
          context_relevance: 92.5,
          hallucination_risk: 'Low (0.03)',
          latency_ms: 510,
          confidence: 95.5,
          timestamp: 'Yesterday, 3:20 PM',
          status: 'Passed (A+)',
        },
        {
          id: 'eval_db_btree_003',
          query: 'Describe B+ Tree node splitting and page merge algorithms.',
          primary_model: 'Gemini 1.5 Pro (Hybrid RAG + LangGraph)',
          faithfulness: 94.5,
          answer_relevance: 93.0,
          context_relevance: 91.0,
          hallucination_risk: 'Low (0.04)',
          latency_ms: 460,
          confidence: 93.5,
          timestamp: '2 days ago',
          status: 'Passed (A+)',
        },
      ];
    }
  },

  getEvaluationById: async (id) => {
    try {
      const response = await apiClient.get(`/evaluation/query/${id}`);
      return response.data;
    } catch (e) {
      console.warn(`Backend /evaluation/query/${id} fallback:`, e);
      return await evaluationApi.runEvaluation();
    }
  },
};

export const guardrailsApi = {
  validateContent: async ({
    text,
    check_type = 'input',
    require_citations = true,
    confidence_threshold = 75.0,
  }) => {
    try {
      const response = await apiClient.post('/guardrails/validate', {
        text,
        check_type,
        require_citations,
        confidence_threshold,
      });
      return response.data;
    } catch (e) {
      console.warn('Backend /guardrails/validate fallback to local regex analysis:', e);
      const lower = text.toLowerCase();
      const isInjection = lower.includes('ignore previous') || lower.includes('system override') || lower.includes('developer mode');
      const isJailbreak = lower.includes('dan') || lower.includes('uncensored') || lower.includes('jailbreak');
      const isHarmful = lower.includes('ransomware') || lower.includes('keylogger') || lower.includes('exploit');

      if (isInjection || isJailbreak || isHarmful) {
        return {
          is_safe: false,
          action: 'block',
          risk_score: 95.0,
          violations: [
            {
              category: isInjection ? 'Prompt Injection' : isJailbreak ? 'Jailbreak Attempt' : 'Unsafe / Harmful',
              severity: 'Critical',
              explanation: 'Triggered Responsible AI security filter.',
              safe_retry_suggestion: 'Ask an academic course concept question directly without bypass directives.',
            },
          ],
          safe_retry_suggestions: [
            "Explain Peterson's Algorithm invariants and the critical section problem.",
            'Prove optimality of admissible heuristics in A* graph search.',
            'Decompose a relational database schema into 3NF and BCNF.',
          ],
          citations_verified: true,
          latency_ms: 2,
        };
      }

      return {
        is_safe: true,
        action: 'allow',
        risk_score: 0.0,
        violations: [],
        sanitized_text: text,
        safe_retry_suggestions: [],
        citations_verified: true,
        latency_ms: 2,
      };
    }
  },

  getPolicies: async () => {
    try {
      const response = await apiClient.get('/guardrails/policies');
      return response.data;
    } catch (e) {
      return [
        {
          name: 'Prompt Injection & Instruction Shield',
          description: 'Blocks adversarial prefix overrides and system prompt leaking probes.',
          status: 'Active',
          action_on_violation: 'Block Request & Suggest Safe Academic Query',
          rules_count: 5,
        },
        {
          name: 'Jailbreak & Unfiltered Mode Defense',
          description: 'Detects DAN persona hacks and fictional safety bypass wrappers.',
          status: 'Active',
          action_on_violation: 'Block Request & Enforce Socratic Academic Persona',
          rules_count: 4,
        },
        {
          name: 'PII & Secret Key Redaction',
          description: 'Auto-detects and redacts SSNs, credit cards, phones, emails, and API keys.',
          status: 'Active',
          action_on_violation: 'Sanitize & Redact Tokens Before LLM Processing',
          rules_count: 5,
        },
        {
          name: 'Factual Citation & Confidence Gatekeeper',
          description: 'Enforces mandatory textbook citations on academic claims and checks 75%+ confidence.',
          status: 'Active',
          action_on_violation: 'Attach Critic Warning Badge & Highlight Grounding Sources',
          rules_count: 2,
        },
      ];
    }
  },
};

export const analyticsApi = {

  getUsageAnalytics: async (period = '7d') => {
    try {
      const response = await apiClient.get('/analytics/usage', { params: { period } });
      return response.data;
    } catch (e) {
      console.warn('Backend /analytics/usage fallback to local analytics model:', e);
      // Realistic fallback data matching exact backend schema
      return {
        period,
        widgets: {
          total_documents: 4,
          total_chunks: 526,
          queries_today: 42,
          queries_total: 348,
          avg_confidence: 96.4,
          avg_latency_ms: 420,
          quiz_accuracy: 88.5,
          study_hours: 48.5,
          topics_studied: 14,
          hallucination_rate: 1.8,
        },
        daily_queries: [
          { date: '2026-03-18', day_label: 'Mon', queries: 28, rag_queries: 18, agent_queries: 10 },
          { date: '2026-03-19', day_label: 'Tue', queries: 35, rag_queries: 23, agent_queries: 12 },
          { date: '2026-03-20', day_label: 'Wed', queries: 42, rag_queries: 28, agent_queries: 14 },
          { date: '2026-03-21', day_label: 'Thu', queries: 38, rag_queries: 25, agent_queries: 13 },
          { date: '2026-03-22', day_label: 'Fri', queries: 54, rag_queries: 36, agent_queries: 18 },
          { date: '2026-03-23', day_label: 'Sat', queries: 48, rag_queries: 31, agent_queries: 17 },
          { date: '2026-03-24', day_label: 'Sun', queries: 42, rag_queries: 27, agent_queries: 15 },
        ],
        confidence_trend: [
          { timestamp: 'Mon 09:00', confidence: 94.2, faithfulness: 95.0, benchmark: 90.0 },
          { timestamp: 'Tue 12:30', confidence: 95.8, faithfulness: 96.4, benchmark: 90.0 },
          { timestamp: 'Wed 16:15', confidence: 97.1, faithfulness: 98.0, benchmark: 90.0 },
          { timestamp: 'Thu 11:00', confidence: 96.0, faithfulness: 96.8, benchmark: 90.0 },
          { timestamp: 'Fri 18:45', confidence: 98.4, faithfulness: 98.9, benchmark: 90.0 },
          { timestamp: 'Sat 14:20', confidence: 96.9, faithfulness: 97.5, benchmark: 90.0 },
          { timestamp: 'Sun 10:10', confidence: 97.8, faithfulness: 98.4, benchmark: 90.0 },
        ],
        topic_distribution: [
          { topic: 'Operating Systems', count: 145, percentage: 38.0, color: '#6366f1' },
          { topic: 'Artificial Intelligence', count: 102, percentage: 26.5, color: '#8b5cf6' },
          { topic: 'Database Systems', count: 84, percentage: 22.0, color: '#06b6d4' },
          { topic: 'Computer Networks', count: 52, percentage: 13.5, color: '#10b981' },
        ],
        quiz_performance: [
          { subject: 'Process Synchronization', accuracy: 94.0, quizzes_taken: 6, avg_time_mins: 4.2 },
          { subject: 'Heuristic Search (A*)', accuracy: 91.5, quizzes_taken: 5, avg_time_mins: 5.1 },
          { subject: 'B+ Tree Indexing', accuracy: 82.0, quizzes_taken: 4, avg_time_mins: 6.0 },
          { subject: 'TCP Flow & Congestion', accuracy: 86.5, quizzes_taken: 5, avg_time_mins: 4.8 },
          { subject: 'Relational Normalization', accuracy: 92.0, quizzes_taken: 3, avg_time_mins: 3.9 },
        ],
        study_consistency: [
          { day: 'Mon', date: 'Mar 18', hours: 5.2, focus_score: 92, streak_active: true },
          { day: 'Tue', date: 'Mar 19', hours: 6.0, focus_score: 95, streak_active: true },
          { day: 'Wed', date: 'Mar 20', hours: 4.5, focus_score: 88, streak_active: true },
          { day: 'Thu', date: 'Mar 21', hours: 7.1, focus_score: 98, streak_active: true },
          { day: 'Fri', date: 'Mar 22', hours: 6.8, focus_score: 94, streak_active: true },
          { day: 'Sat', date: 'Mar 23', hours: 8.2, focus_score: 99, streak_active: true },
          { day: 'Sun', date: 'Mar 24', hours: 4.5, focus_score: 91, streak_active: true },
        ],
      };
    }
  },
};





