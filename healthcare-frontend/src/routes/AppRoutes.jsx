import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Loading from '../components/common/Loading.jsx'
import ProtectedRoute from '../components/common/ProtectedRoute.jsx'
import AdminRoute from '../components/common/AdminRoute.jsx'
import PatientRoute from '../components/common/PatientRoute.jsx'
import RootRedirect from '../components/common/RootRedirect.jsx'
import AuthRoute from '../components/common/AuthRoute.jsx'

// Lazy load Patient pages
const HomePage = lazy(() => import('../pages/Patient/HomePage.jsx'))
const SymptomChecker = lazy(() => import('../pages/Patient/SymptomChecker.jsx'))
const DietAssistance = lazy(() => import('../pages/Patient/DietAssistance.jsx'))
const ActiveAI = lazy(() => import('../pages/Patient/ActiveAI.jsx'))
const About = lazy(() => import('../pages/Patient/About.jsx'))
const Profile = lazy(() => import('../pages/Patient/Profile.jsx'))
const Saved = lazy(() => import('../pages/Patient/Saved.jsx'))
const ShowTipDetails = lazy(() => import('../pages/Patient/ShowTipDetails.jsx'))
const ArticleDetail = lazy(() => import('../pages/Patient/ArticleDetail.jsx'))

// Lazy load Auth pages
const Login = lazy(() => import('../pages/Auth/Login.jsx'))
const Register = lazy(() => import('../pages/Auth/Register.jsx'))

// Lazy load Admin pages
const AdminDashboard = lazy(() => import('../pages/Admin/AdminDashboard.jsx'))
const AdminProfile = lazy(() => import('../pages/Admin/AdminProfile.jsx'))
const ManageUsers = lazy(() => import('../pages/Admin/ManageUsers.jsx'))
const ManageArticles = lazy(() => import('../pages/Admin/ManageArticles.jsx'))
const ManageHealthyTips = lazy(() => import('../pages/Admin/ManageHealthyTips.jsx'))
const ManageAboutPage = lazy(() => import('../pages/Admin/ManageAboutPage.jsx'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading message="Loading page..." />}>
      <Routes>
      <Route 
        path="/patient/home" 
        element={
          <PatientRoute>
            <HomePage />
          </PatientRoute>
        } 
      />

      <Route 
        path="/auth/login" 
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        } 
      />
      <Route 
        path="/auth/register" 
        element={
          <AuthRoute>
            <Register />
          </AuthRoute>
        } 
      />

      <Route 
        path="/patient/dashboard" 
        element={<Navigate to="/patient/home" replace />} 
      />
      <Route 
        path="/patient/symptom-checker" 
        element={
          <PatientRoute>
            <ProtectedRoute>
              <SymptomChecker />
            </ProtectedRoute>
          </PatientRoute>
        } 
      />
      <Route 
        path="/patient/diet-assistance" 
        element={
          <PatientRoute>
            <ProtectedRoute>
              <DietAssistance />
            </ProtectedRoute>
          </PatientRoute>
        } 
      />
      <Route 
        path="/patient/active-ai" 
        element={
          <PatientRoute>
            <ProtectedRoute>
              <ActiveAI />
            </ProtectedRoute>
          </PatientRoute>
        } 
      />
      <Route 
        path="/patient/about" 
        element={
          <PatientRoute>
            <About />
          </PatientRoute>
        } 
      />
      <Route 
        path="/patient/profile" 
        element={
          <PatientRoute>
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </PatientRoute>
        } 
      />
      <Route 
        path="/patient/saved" 
        element={
          <PatientRoute>
            <ProtectedRoute>
              <Saved />
            </ProtectedRoute>
          </PatientRoute>
        } 
      />
      <Route 
        path="/patient/tip/:id" 
        element={
          <PatientRoute>
            <ShowTipDetails />
          </PatientRoute>
        } 
      />
      <Route 
        path="/patient/article/:id" 
        element={
          <PatientRoute>
            <ArticleDetail />
          </PatientRoute>
        } 
      />

      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/profile" 
        element={
          <AdminRoute>
            <AdminProfile />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/manage-users" 
        element={
          <AdminRoute>
            <ManageUsers />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/manage-articles" 
        element={
          <AdminRoute>
            <ManageArticles />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/manage-healthy-tips" 
        element={
          <AdminRoute>
            <ManageHealthyTips />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/manage-about-page" 
        element={
          <AdminRoute>
            <ManageAboutPage />
          </AdminRoute>
        } 
      />

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
      </Routes>
    </Suspense>
  )
}


