import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import PinLogin from './pages/PinLogin'
import Home from './pages/Home'
import NewRecord from './pages/NewRecord'
import FormView from './pages/FormView'

function ProtectedRoute({ children, allowedRoles }) {
  const { role } = useAuth()
  if (!role) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PinLogin />} />
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['operative', 'manager', 'supervisor']}>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new"
            element={
              <ProtectedRoute allowedRoles={['operative', 'manager', 'supervisor']}>
                <NewRecord />
              </ProtectedRoute>
            }
          />
          <Route
            path="/record/:id"
            element={
              <ProtectedRoute allowedRoles={['operative', 'manager', 'supervisor']}>
                <FormView />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
