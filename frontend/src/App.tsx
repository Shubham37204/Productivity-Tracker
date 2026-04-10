import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './features/dashboard/Dashboard'
import Tasks from './features/tasks/Tasks'
import Achievements from './features/achievements/Achievements'
import Reports from './features/reports/Reports'
import Layout from './components/Layout'

export default function App() {
  const { isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground animate-pulse text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <SignedIn>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Layout>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </BrowserRouter>
  )
}