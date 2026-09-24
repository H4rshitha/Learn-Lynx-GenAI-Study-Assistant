import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDocuments, mockRecentChats, mockStudyGoals, knowledgeApi, chatApi } from '../api/client';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem('learnlynx_docs');
    return saved ? JSON.parse(saved) : mockDocuments;
  });

  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('learnlynx_chats');
    return saved ? JSON.parse(saved) : mockRecentChats;
  });

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('learnlynx_goals');
    return saved ? JSON.parse(saved) : mockStudyGoals;
  });

  const [aiConfig, setAiConfig] = useState(() => {
    const saved = localStorage.getItem('learnlynx_ai_config');
    return saved
      ? JSON.parse(saved)
      : {
          model: 'Gemini 1.5 Pro (RAG Enhanced)',
          temperature: 0.3,
          topKChunks: 4,
          persona: 'Socratic Academic Tutor',
          embeddingModel: 'text-embedding-004',
          ragGrounding: true,
          webSearchFallback: false,
        };
  });

  const [stats, setStats] = useState({
    uploadedDocs: documents.length,
    totalQueries: 348,
    quizAccuracy: 88.5,
    studyHours: 42.5,
    streakDays: 7,
    aiConfidenceAvg: 94.2,
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('learnlynx_docs', JSON.stringify(documents));
    setStats((prev) => ({ ...prev, uploadedDocs: documents.length }));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('learnlynx_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('learnlynx_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('learnlynx_ai_config', JSON.stringify(aiConfig));
  }, [aiConfig]);

  const addDocument = async (fileData) => {
    const newDoc = await knowledgeApi.uploadDocument(fileData);
    setDocuments((prev) => [newDoc, ...prev]);
    return newDoc;
  };

  const deleteDocument = (id) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const addChat = (newChat) => {
    setChats((prev) => [newChat, ...prev]);
    setStats((prev) => ({ ...prev, totalQueries: prev.totalQueries + 1 }));
  };

  const toggleGoal = (id) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  const addGoal = (goal) => {
    const newGoal = {
      id: 'g_' + Date.now(),
      title: goal.title,
      subject: goal.subject || 'General Studies',
      dueDate: goal.dueDate || 'Today, 8:00 PM',
      priority: goal.priority || 'Medium',
      completed: false,
    };
    setGoals((prev) => [newGoal, ...prev]);
  };

  const deleteGoal = (id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const updateAiConfig = (updates) => {
    setAiConfig((prev) => ({ ...prev, ...updates }));
  };

  const value = {
    documents,
    addDocument,
    deleteDocument,
    chats,
    addChat,
    goals,
    toggleGoal,
    addGoal,
    deleteGoal,
    aiConfig,
    updateAiConfig,
    stats,
    setStats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
