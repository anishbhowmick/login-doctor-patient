import React from 'react';
import { Stethoscope } from 'lucide-react';
import SignInForm from './components/auth/SignInForm';
import DoctorDashboard from './components/dashboard/DoctorDashboard';
import PatientDashboard from './components/patient/PatientDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const { doctor, patient } = useAuth();

  return (
    <Routes>
      <Route
        path="/doctor-dashboard"
        element={doctor ? <DoctorDashboard /> : <SignInForm />}
      />
      <Route
        path="/patient-dashboard"
        element={patient ? <PatientDashboard /> : <SignInForm />}
      />
      <Route
        path="/"
        element={
          doctor ? (
            <DoctorDashboard />
          ) : patient ? (
            <PatientDashboard />
          ) : (
            <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center p-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg w-full max-w-[450px] p-8">
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <Stethoscope className="h-12 w-12 text-[#4A90E2]" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome to HealthConnect Portal
                  </h1>
                  <p className="text-gray-600">
                    Secure access to your healthcare dashboard
                  </p>
                </div>
                
                <SignInForm />
              </div>
            </div>
          )
        }
      />
      {/* Add more routes as needed */}
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;