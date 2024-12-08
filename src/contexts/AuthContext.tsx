import React, { createContext, useContext, useState, useEffect }from 'react';
import axiosInstance from '../utils/axiosConfig';


export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  qualifications: string[];
  experience: number;
  avatar?: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  age: number;
  bloodGroup: string;
  primaryContact: string;
  emergencyContact: string;
  diagnosis?: string;
  diagnosisTimestamp?: string;
}

export interface AuthContextType {
  doctor: Doctor | null;
  patient: Patient | null;
  login: (email: string, password: string, role: string) => Promise<{ success: boolean; data?: any; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    // On app load, check for token and user in localStorage
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.role === 'doctor') {
        setDoctor(parsedUser);
      } else if (parsedUser.role === 'patient') {
        setPatient(parsedUser);
      }

      // Set the token in Axios headers
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const login = async (email: string, password: string, role: string) => {
    try {
      const response = await axiosInstance.post('/api/login', { email, password, role });

      if (response.status === 200) {
        const { user, token } = response.data;

        // Store user data and token in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);

        // Set the token in Axios headers
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        if (user.role === 'doctor') {
          setDoctor(user);
          setPatient(null);
        } else if (user.role === 'patient') {
          setPatient(user);
          setDoctor(null);
        }

        return { success: true, data: { user, token } };
      } else {
        return { success: false, message: response.data.error || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      return { success: false, message: error.response?.data?.error || 'Login failed' };
    }
  };

  const logout = () => {
    setDoctor(null);
    setPatient(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axiosInstance.defaults.headers.common['Authorization'];
    window.location.replace('https://medical-webpage-front.vercel.app/');
  };

  return (
    <AuthContext.Provider value={{ doctor, patient, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
