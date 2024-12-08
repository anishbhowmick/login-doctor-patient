import React from 'react';
// import { LogOut, Menu } from 'lucide-react';
import PersonalInfo from './PersonalInfo';
import MedicalHistory from './MedicalHistory';
import HealthMetrics from './HealthMetrics';
import CurrentDiagnosis from './CurrentDiagnosis';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../shared/Header';

export default function PatientDashboard() {
  const { patient, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  if (!patient) return null;

  const handleLogout = () => {
    logout();
    window.location.replace("https://medical-webpage-front.vercel.app/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header patientName={patient.name} onLogout={handleLogout} />

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg p-6">
            <nav className="space-y-2">
              {/* <NavLink active>Dashboard</NavLink>
              <NavLink>Appointments</NavLink>
              <NavLink>Messages</NavLink>
              <NavLink>Settings</NavLink> */}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow w-full px-4 sm:px-6 py-8">
        <div className="space-y-6">
          <PersonalInfo patientId={patient.id} editable={false} />
          <CurrentDiagnosis />
          <MedicalHistory patientId={patient.id} />
          <HealthMetrics />
        </div>
      </main>
    </div>
  );
}

function NavLink({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <a
      href="#"
      className={`block px-4 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-blue-50 text-blue-700 font-medium'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {children}
    </a>
  );
}