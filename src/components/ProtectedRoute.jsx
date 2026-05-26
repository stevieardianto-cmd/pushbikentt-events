import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children, requireSuperAdmin = false }) {
  const { user, adminRole, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-yellow-400 text-xl font-bold animate-pulse">Loading...</div>
    </div>
  )

  if (!user || !adminRole) return <Navigate to="/admin/login" replace />

  if (requireSuperAdmin && adminRole.role !== 'super_admin')
    return <Navigate to="/admin" replace />

  return children
}

export default ProtectedRoute