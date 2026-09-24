import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { CommandPalette } from './components/common/CommandPalette';

// Create a client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 3, // 3 minutes
      retry: 1,
    },
  },
});

// Routing wrappers
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { PublicRoute } from './components/routing/PublicRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { AIWorkspacePage } from './pages/AIWorkspacePage';
import { RecentChatsPage } from './pages/RecentChatsPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { QuizStudioPage } from './pages/QuizStudioPage';
import { StudyPlannerPage } from './pages/StudyPlannerPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <AuthProvider>
                <AppProvider>
                  <CommandPalette />
                  <Routes>

              {/* Public Landing & Marketing */}
              <Route path="/" element={<LandingPage />} />

              {/* Authentication Routes (redirect to dashboard if already logged in) */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <SignupPage />
                  </PublicRoute>
                }
              />

              {/* Protected Student Workspace Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workspace"
                element={
                  <ProtectedRoute>
                    <AIWorkspacePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recent-chats"
                element={
                  <ProtectedRoute>
                    <RecentChatsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/knowledge-base"
                element={
                  <ProtectedRoute>
                    <KnowledgeBasePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/quiz-studio"
                element={
                  <ProtectedRoute>
                    <QuizStudioPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/study-planner"
                element={
                  <ProtectedRoute>
                    <StudyPlannerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>

        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;


