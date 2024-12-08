import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { Phone, User2, PhoneCall, Calendar, Droplet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface PersonalInfoProps {
  patientId: string;
  editable: boolean;
  onChange?: (field: keyof PersonalInfoProps['info'], value: string) => void;
}

export default function PersonalInfo({ patientId, editable, onChange }: PersonalInfoProps) {
  const { patient } = useAuth();
  const [info, setInfo] = useState({
    fullName: 'N/A',
    age: 'N/A',
    gender: 'N/A',
    bloodGroup: 'N/A',
    primaryContact: 'N/A',
    emergencyContact: 'N/A',
  });

  useEffect(() => {
    const fetchPatientInfo = async () => {
      try {
        const response = await axiosInstance.get(`https://medical-backend-l140.onrender.com/api/patients/${patientId}`);
        const patientData = response.data.patient;
        setInfo({
          fullName: `${patientData.firstName} ${patientData.lastName}`,
          age: patientData.age.toString(),
          gender: patientData.gender,
          bloodGroup: patientData.bloodGroup,
          primaryContact: patientData.primaryContact,
          emergencyContact: patientData.emergencyContact,
        });
      } catch (error) {
        console.error('Error fetching patient info:', error);
      }
    };

    fetchPatientInfo();
  }, [patientId]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoItem
          icon={User2}
          color="text-blue-600"
          label="Full Name"
          value={patient?.name || 'N/A'}
          editable={editable}
          onChange={(e) => onChange && onChange('fullName', e.target.value)}
        />
        <InfoItem
          icon={Calendar}
          color="text-blue-600"
          label="Age"
          value={patient?.age.toString() || 'N/A'}
          editable={editable}
          onChange={(e) => onChange && onChange('age', e.target.value)}
        />
        <InfoItem
          icon={Droplet}
          color="text-red-600"
          label="Blood Group"
          value={patient?.bloodGroup || 'N/A'}
          editable={editable}
          onChange={(e) => onChange && onChange('bloodGroup', e.target.value)}
        />
        <InfoItem
          icon={Phone}
          color="text-blue-600"
          label="Primary Contact"
          value={patient?.primaryContact || 'N/A'}
          editable={editable}
          onChange={(e) => onChange && onChange('primaryContact', e.target.value)}
        />
        <InfoItem
          icon={PhoneCall}
          color="text-red-600"
          label="Emergency Contact"
          value={patient?.emergencyContact || 'N/A'}
          editable={editable}
          onChange={(e) => onChange && onChange('emergencyContact', e.target.value)}
        />
        <InfoItem
          icon={User2}
          color="text-blue-600"
          label="Gender"
          value={patient?.gender || 'N/A'}
          editable={editable}
          onChange={(e) => onChange && onChange('gender', e.target.value)}
        />
      </div>
    </div>
  );
}

interface InfoItemProps {
  icon: React.ElementType;
  color: string;
  label: string;
  value: string;
  editable: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

function InfoItem({ icon: Icon, color, label, value, editable, onChange }: InfoItemProps) {
  const displayValue = value && value.trim() !== '' ? value : 'Data is not available';

  return (
    <div>
      <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
        <Icon className={`${color} w-4 h-4 mr-2`} />
        {label}
      </label>
      {editable ? (
        <input
          type="text"
          value={value}
          onChange={onChange}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      ) : (
        <p className="text-gray-900">{displayValue}</p>
      )}
    </div>
  );
}
