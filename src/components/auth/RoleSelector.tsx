import React from 'react';
import { User, Stethoscope } from 'lucide-react';

interface RoleSelectorProps {
  value: string;
  onChange: (role: string) => void;
  error?: string;
}

const roles = [
  { id: 'patient', label: 'Patient', icon: User },
  { id: 'doctor', label: 'Doctor', icon: Stethoscope },
];

export default function RoleSelector({ value, onChange, error }: RoleSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Select Role <span className="text-red-500">*</span>
      </label>
      <div className="mt-1 grid grid-cols-2 gap-4">
        {roles.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`
              flex flex-col items-center justify-center p-4 border rounded-md transition-all duration-200
              ${value === id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <Icon className="h-8 w-8 mb-2" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}