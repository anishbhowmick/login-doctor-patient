import React from 'react';
import { Clock, LogOut }from 'lucide-react';
import Greeting from './Greeting';
import StatsCards from './StatsCards';
import PatientManagement from './PatientManagement';
import { useCurrentTime } from '../../hooks/useCurrentTime';
import { useAuth } from '../../contexts/AuthContext';

export default function DoctorDashboard() {
  const { time, date } = useCurrentTime();
  const { doctor, logout } = useAuth();

  if (!doctor) return null;

  const handleLogout = () => {
    logout();
    window.location.replace("https://medical-webpage-front.vercel.app/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{doctor.name}</h2>
            <p className="text-sm text-blue-600">{doctor.specialty}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            {doctor.avatar && (
              <div className="relative w-20 h-20 mx-auto">
                <img
                  src={doctor.avatar}
                  alt={doctor.name}
                  className="rounded-full object-cover shadow-md"
                />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              </div>
            )}
            <h2 className="text-xl font-bold text-gray-900 text-center mt-4">{doctor.name}</h2>
            <p className="text-sm text-blue-600 text-center">{doctor.specialty}</p>
            <div className="text-xs text-gray-500 text-center">
              {doctor.qualifications?.length > 0 ? doctor.qualifications.join(', ') : 'N/A'}
              <br />
              {doctor.experience || 0} years of experience
            </div>
          </div>
          
          <nav className="space-y-1">
            {/* <NavItem active>Dashboard</NavItem>
            <NavItem>Patients</NavItem>
            <NavItem>Appointments</NavItem>
            <NavItem>Messages</NavItem>
            <NavItem>Settings</NavItem> */}
            <NavItem onClick={handleLogout}>
              <span className="flex items-center">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </span>
            </NavItem>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <Greeting doctorName={doctor.name.split(' ')[0]} />
              <p className="text-gray-600 mt-1">Welcome to your dashboard</p>
            </div>
            
            <div className="mt-4 lg:mt-0 w-full lg:w-auto">
              <div className="flex items-center justify-center lg:justify-end text-2xl font-mono text-gray-700 mb-1">
                <Clock className="w-5 h-5 mr-2" />
                {time}
              </div>
              <p className="text-gray-600 text-center lg:text-right">{date}</p>
            </div>
          </div>

          <StatsCards
            stats={{
              totalPatients: 1234,
              appointmentsToday: 8,
              criticalCases: 3,
            }}
          />
          
          <div className="mt-8">
            <PatientManagement />
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({
  children,
  active = false,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-blue-50 text-blue-700 font-medium'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}
