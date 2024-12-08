import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import axiosInstance from '../../utils/axiosConfig'; // Use the configured axios instance

interface HistoryItem {
  condition: string;
  year?: string;
}

interface Allergy {
  name: string;
  severity: 'High' | 'Medium' | 'Low';
}

interface Prescription {
  _id?: string;
  medicine: string;
  dosage: string;
  timing: string;
  frequency: number;
  instructions?: string;
  times: string[];
}

interface Medication {
  name: string;
  dosage: string;
  schedule: string;
  instructions?: string;
  times: string[];
}

interface MedicalHistoryProps {
  patientId: string;
}

export default function MedicalHistory({ patientId }: MedicalHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch prescriptions
        const prescriptionsResponse = await axiosInstance.get(`/patients/${patientId}/prescriptions`);
        setPrescriptions(prescriptionsResponse.data.prescriptions);

        const mappedMedications: Medication[] = prescriptionsResponse.data.prescriptions.map((prescription: Prescription) => ({
          name: prescription.medicine,
          dosage: prescription.dosage,
          schedule: `${prescription.timing}, ${prescription.frequency}x per day`,
          instructions: prescription.instructions,
          times: prescription.times,
        }));
        setMedications(mappedMedications);

        // Fetch medical histories
        const historiesResponse = await axiosInstance.get(`/patients/${patientId}/histories`);
        setHistories(historiesResponse.data.histories);

        // Fetch allergies
        const allergiesResponse = await axiosInstance.get(`/patients/${patientId}/allergies`);
        setAllergies(allergiesResponse.data.allergies);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch medical history data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Medical History</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          <Section title="History">
            {loading ? (
              <p>Loading histories...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : histories.length === 0 ? (
              <p>No medical histories available.</p>
            ) : (
              <ul className="space-y-2">
                {histories.map((item, index) => (
                  <li key={index} className="text-gray-700">
                    {item.condition}
                    {item.year && (
                      <span className="text-gray-500 ml-2">({item.year})</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Allergies">
            {loading ? (
              <p>Loading allergies...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : allergies.length === 0 ? (
              <p>No allergies recorded.</p>
            ) : (
              <ul className="space-y-2">
                {allergies.map((allergy, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-700">{allergy.name}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                        allergy.severity
                      )}`}
                    >
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      {allergy.severity}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Current Medications">
            {loading ? (
              <p>Loading medications...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : medications.length === 0 ? (
              <p>No current medications.</p>
            ) : (
              <ul className="space-y-4">
                {medications.map((med, index) => (
                  <li key={index} className="border-l-2 border-blue-500 pl-4">
                    <p className="font-medium text-gray-900">{med.name}</p>
                    <p className="text-sm text-gray-600">Dosage: {med.dosage}</p>
                    <p className="text-sm text-gray-600">Schedule: {med.schedule}</p>
                    {med.instructions && (
                      <p className="text-sm text-gray-600">Instructions: {med.instructions}</p>
                    )}
                    {med.times && med.times.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-semibold text-gray-700">Time:</p>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {med.times.map((time, timeIndex) => (
                            <li key={timeIndex}>{time}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'High':
      return 'bg-red-100 text-red-800';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'Low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}