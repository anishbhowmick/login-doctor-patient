import React, { useEffect, useState } from 'react';
import { Stethoscope, Calendar, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface TreatmentInfo {
  currentDiagnosis: string;
  lastUpdated: string; // ISO date string
}

interface DiagnosisInfo {
  diagnosis: string;
  timestamp: string;
  physician: string;
  nextAppointment: string;
}

export default function CurrentDiagnosis() {
  const { patient } = useAuth();
  const [diagnosisInfo, setDiagnosisInfo] = useState<DiagnosisInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTreatmentInfo = async () => {
      if (!patient?.id) {
        setError('Patient ID not found.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/patients/${patient.id}`);
        const treatmentInfo: TreatmentInfo = response.data.patient.treatmentInfo;

        if (!treatmentInfo.currentDiagnosis || !treatmentInfo.lastUpdated) {
          setError('Treatment information is incomplete.');
          setLoading(false);
          return;
        }

        const lastUpdatedDate = new Date(treatmentInfo.lastUpdated);
        const nextAppointmentDate = new Date(lastUpdatedDate);
        nextAppointmentDate.setDate(nextAppointmentDate.getDate() + 14);

        const diagnosisData: DiagnosisInfo = {
          diagnosis: treatmentInfo.currentDiagnosis,
          timestamp: treatmentInfo.lastUpdated,
          // physician: 'Dr. Michael Chen', // You might want to fetch this dynamically
          nextAppointment: nextAppointmentDate.toISOString(),
        };

        setDiagnosisInfo(diagnosisData);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching treatment info:', err);
        setError('Failed to fetch treatment information.');
        setLoading(false);
      }
    };

    fetchTreatmentInfo();
  }, [patient]);

  if (loading) {
    return <div>Loading Current Diagnosis...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!diagnosisInfo) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Current Diagnosis</h2>
      
      <div className="flex items-center space-x-2 mb-4">
        <Stethoscope className="w-5 h-5 text-blue-600" />
        <span className="text-lg font-semibold text-gray-900">Current Diagnosis</span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Latest Diagnosis</p>
          <p className="text-gray-900 mt-1">{diagnosisInfo.diagnosis}</p>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(diagnosisInfo.timestamp).toLocaleDateString()} at{' '}
            {new Date(diagnosisInfo.timestamp).toLocaleTimeString()}
          </p>
        </div>

        {/* <div>
          <p className="text-sm text-gray-500">Treating Physician</p>
          <p className="text-gray-900 mt-1 flex items-center">
            <User className="w-4 h-4 mr-2" />
            {diagnosisInfo.physician}
          </p>
        </div> */}

        <div className="flex items-center space-x-2 text-blue-600">
          <Calendar className="w-5 h-5" />
          <div>
            <p className="text-sm font-medium">Next Appointment</p>
            <p className="text-gray-900">
              {new Date(diagnosisInfo.nextAppointment).toLocaleDateString()} at{' '}
              {new Date(diagnosisInfo.nextAppointment).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}