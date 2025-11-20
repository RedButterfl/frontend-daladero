import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Pages
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import AgentsChat from './pages/AgentsChat'
import GitHubIntegration from './pages/GitHubIntegration'
import MemoryManager from './pages/MemoryManager'
import FileManager from './pages/FileManager'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Route publique - Authentification */}
            <Route 
              path="/auth" 
              element={
                user ? <Navigate to="/dashboard" replace /> : <AuthPage />
              } 
            />
            
            {/* Routes protégées */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="agents" element={<AgentsChat />} />
              <Route path="github" element={<GitHubIntegration />} />
              <Route path="memories" element={<MemoryManager />} />
              <Route path="files" element={<FileManager />} />
              <Route path="profile" element={<Profile />} />
              <Route path="Settings" element={<Settings />} />
            </Route>
            
            {/* Redirection par défaut */}
            <Route path="*" element={
              user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />
            } />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#10b981',
                },
              },
              error: {
                duration: 5000,
                theme: {
                  primary: '#ef4444',
                },
              },
            }}
          />
        </div>
      </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App