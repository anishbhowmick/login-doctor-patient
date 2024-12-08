import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { Search } from 'lucide-react';
import PatientDetails from '../dashboard/PatientDetails'; // Import the PatientDetails component

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  lastVisit?: string;
  lastUpdated?: string;
  status?: string;
  // Add other relevant fields as needed
}

export default function PatientManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const fetchPatients = async () => {
      if (searchTerm.trim() === '') {
        setPatients([]);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get('/api/patients/search', {
          params: { query: searchTerm },
        });

        setPatients(response.data.patients);
        setHasSearched(true);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || 'Error fetching patients');
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call to avoid excessive requests
    const delayDebounceFn = setTimeout(() => {
      fetchPatients();
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleCloseDetails = () => {
    setSelectedPatient(null);
  };

  return (
    <div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search patients by name or ID..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {hasSearched && (
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          ) : patients.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Patient ID</th>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Last Visit</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient._id} className="border-b">
                    <td className="py-3 px-4">{patient._id}</td>
                    <td className="py-3 px-4">{`${patient.firstName} ${patient.lastName}`}</td>
                    <td className="py-3 px-4">
                      {patient.lastUpdated ? (
                        new Date(patient.lastUpdated).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })
                      ) : patient.lastVisit ? (
                        new Date(patient.lastVisit).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="py-3 px-4">{patient.status || 'N/A'}</td>
                    <td className="py-3 px-4">
                      {/* Action Buttons */}
                      <button
                        className="text-blue-600 hover:underline mr-2"
                        onClick={() => handleViewDetails(patient)}
                      >
                        View
                      </button>
                      {/* Example: <button className="text-red-600 hover:underline">Delete</button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No patients found.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal for Patient Details */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-11/12 max-w-3xl p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={handleCloseDetails}
            >
              &times;
            </button>
            <PatientDetails patientId={selectedPatient._id} onClose={handleCloseDetails} />
          </div>
        </div>
      )}
    </div>
  );
}