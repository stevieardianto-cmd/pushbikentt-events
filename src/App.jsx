import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Classes from './pages/Classes'
import Register from './pages/Register'
import Schedule from './pages/Schedule'
import Results from './pages/Results'
import History from './pages/History'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import ManageAdmins from './pages/admin/ManageAdmins'

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/classes" element={<PublicLayout><Classes /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
          <Route path="/schedule" element={<PublicLayout><Schedule /></PublicLayout>} />
          <Route path="/results" element={<PublicLayout><Results /></PublicLayout>} />
          <Route path="/history" element={<PublicLayout><History /></PublicLayout>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/admin/manage" element={
            <ProtectedRoute requireSuperAdmin={true}><ManageAdmins /></ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App