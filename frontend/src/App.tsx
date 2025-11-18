import { Routes, Route } from 'react-router-dom'
import { Toaster } from './components/ui/toaster'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProjectPage } from './pages/ProjectPage'
import { EditorPage } from './pages/EditorPage'
import { ExplorePage } from './pages/ExplorePage'
import { ProfilePage } from './pages/ProfilePage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/explore" element={<ExplorePage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="/:username" element={<ProfilePage />} />
          <Route path="/:username/:projectSlug" element={<ProjectPage />} />

          <Route
            path="/:username/:projectSlug/edit"
            element={
              <ProtectedRoute>
                <EditorPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

export default App
