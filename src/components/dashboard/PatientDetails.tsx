import React, { useState, useEffect } from 'react';
import { X, Edit2, Printer, Plus, Trash } from 'lucide-react';
import VitalsChart from './VitalsChart';
import axios from 'axios';
import TimeInput from './TimeInput';

interface PatientDetailsProps {
  patientId: string;
  onClose: () => void;
}

interface Prescription {
  _id?: string; // MongoDB ID
  medicine: string;
  dosage: string;
  timing: string;
  frequency: number;
  instructions: string;
  times: string[]; // NEW: Array of time strings (e.g., ["13:00", "22:00"])
}

interface TreatmentInfo {
  currentDiagnosis: string;
  lastUpdated: string;
}

interface HistoryItem {
  _id?: string; // MongoDB ID
  condition: string;
  year?: string;
}

interface Allergy {
  _id?: string; // MongoDB ID
  name: string;
  severity: 'High' | 'Medium' | 'Low';
}

export default function PatientDetails({ patientId, onClose }: PatientDetailsProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isTreatmentEditing, setIsTreatmentEditing] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [treatmentInfo, setTreatmentInfo] = useState<TreatmentInfo>({
    currentDiagnosis: '',
    lastUpdated: '',
  });
  const [newPrescription, setNewPrescription] = useState<Prescription>({
    medicine: '',
    dosage: '',
    timing: 'After meals',
    frequency: 1,
    instructions: '',
    times: [''],
  });
  const [patientData, setPatientData] = useState<any>(null);
  const [loadingPatient, setLoadingPatient] = useState<boolean>(false);
  const [errorPatient, setErrorPatient] = useState<string | null>(null);

  const [editableData, setEditableData] = useState({
    age: '',
    gender: '',
    bloodGroup: '',
    primaryContact: '',
    emergencyContact: '',
  });

  const [loadingPrescriptions, setLoadingPrescriptions] = useState<boolean>(false);
  const [errorPrescriptions, setErrorPrescriptions] = useState<string | null>(null);

  // NEW STATE VARIABLES FOR HISTORIES AND ALLERGIES
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [newHistory, setNewHistory] = useState<HistoryItem>({
    condition: '',
    year: '',
  });
  const [loadingHistories, setLoadingHistories] = useState<boolean>(false);
  const [errorHistories, setErrorHistories] = useState<string | null>(null);

  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [newAllergy, setNewAllergy] = useState<Allergy>({
    name: '',
    severity: 'Low',
  });
  const [loadingAllergies, setLoadingAllergies] = useState<boolean>(false);
  const [errorAllergies, setErrorAllergies] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoadingPatient(true);
      setErrorPatient(null);
      try {
        const response = await axios.get(`/api/patients/${patientId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Adjust based on your auth implementation
          },
        });
        setPatientData(response.data.patient);
      } catch (err: any) {
        console.error(err);
        setErrorPatient('Failed to fetch patient data.');
      } finally {
        setLoadingPatient(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  useEffect(() => {
    if (patientData) {
      setEditableData({
        age: patientData.age || '',
        gender: patientData.gender || '',
        bloodGroup: patientData.bloodGroup || '',
        primaryContact: patientData.primaryContact || '',
        emergencyContact: patientData.emergencyContact || '',
      });

      setTreatmentInfo({
        currentDiagnosis: patientData.treatmentInfo?.currentDiagnosis || '',
        lastUpdated: patientData.treatmentInfo?.lastUpdated
          ? new Date(patientData.treatmentInfo.lastUpdated).toISOString()
          : '',
      });

      // Initialize Histories and Allergies from patient data
      setHistories(patientData.histories || []);
      setAllergies(patientData.allergies || []);
    }
  }, [patientData]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setLoadingPrescriptions(true);
      setErrorPrescriptions(null);
      try {
        const response = await axios.get(`/api/patients/${patientId}/prescriptions`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        setPrescriptions(response.data.prescriptions);
      } catch (err: any) {
        console.error(err);
        setErrorPrescriptions('Failed to fetch prescriptions.');
      } finally {
        setLoadingPrescriptions(false);
      }
    };

    fetchPrescriptions();
  }, [patientId]);

  // NEW USEEFFECTS FOR HISTORIES AND ALLERGIES
  useEffect(() => {
    const fetchHistories = async () => {
      setLoadingHistories(true);
      setErrorHistories(null);
      try {
        const response = await axios.get(`/api/patients/${patientId}/histories`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        setHistories(response.data.histories);
      } catch (err: any) {
        console.error(err);
        setErrorHistories('Failed to fetch medical histories.');
      } finally {
        setLoadingHistories(false);
      }
    };

    fetchHistories();
  }, [patientId]);

  useEffect(() => {
    const fetchAllergies = async () => {
      setLoadingAllergies(true);
      setErrorAllergies(null);
      try {
        const response = await axios.get(`/api/patients/${patientId}/allergies`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        setAllergies(response.data.allergies);
      } catch (err: any) {
        console.error(err);
        setErrorAllergies('Failed to fetch allergies.');
      } finally {
        setLoadingAllergies(false);
      }
    };

    fetchAllergies();
  }, [patientId]);

  const getAuthToken = () => {
    return localStorage.getItem('token') || '';
  };

  const handleAddPrescription = async () => {
    if (!newPrescription.medicine || !newPrescription.dosage || !newPrescription.timing || !newPrescription.frequency) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const response = await axios.post(
        `/api/patients/${patientId}/prescriptions`,
        newPrescription,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      setPrescriptions([...prescriptions, response.data.prescription]);

      setNewPrescription({
        medicine: '',
        dosage: '',
        timing: 'After meals',
        frequency: 1,
        instructions: '',
        times: [''],
      });

      alert('Prescription added successfully.');
    } catch (error: any) {
      console.error('Error adding prescription:', error);
      alert(error.response?.data?.error || 'Failed to add prescription.');
    }
  };

  const handleDeletePrescription = async (id: string | undefined) => {
    if (!id) return;

    if (!window.confirm('Are you sure you want to delete this prescription?')) return;

    try {
      await axios.delete(`/api/patients/${patientId}/prescriptions/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      setPrescriptions(prescriptions.filter((p) => p._id !== id));

      alert('Prescription deleted successfully.');
    } catch (error: any) {
      console.error('Error deleting prescription:', error);
      alert(error.response?.data?.error || 'Failed to delete prescription.');
    }
  };

  // NEW HANDLERS FOR HISTORIES
  const handleAddHistory = async () => {
    if (!newHistory.condition) {
      alert('Please enter the condition.');
      return;
    }

    try {
      const response = await axios.post(
        `/api/patients/${patientId}/histories`,
        newHistory,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      setHistories([...histories, response.data.history]);

      setNewHistory({
        condition: '',
        year: '',
      });

      alert('Medical history added successfully.');
    } catch (error: any) {
      console.error('Error adding history:', error);
      alert(error.response?.data?.error || 'Failed to add medical history.');
    }
  };

  const handleDeleteHistory = async (historyId: string | undefined) => {
    if (!historyId) return;

    if (!window.confirm('Are you sure you want to delete this medical history?')) return;

    try {
      await axios.delete(`/api/patients/${patientId}/histories/${historyId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      setHistories(histories.filter((h) => h._id !== historyId));

      alert('Medical history deleted successfully.');
    } catch (error: any) {
      console.error('Error deleting history:', error);
      alert(error.response?.data?.error || 'Failed to delete medical history.');
    }
  };

  // NEW HANDLERS FOR ALLERGIES
  const handleAddAllergy = async () => {
    if (!newAllergy.name || !newAllergy.severity) {
      alert('Please enter the allergy name and severity.');
      return;
    }

    try {
      const response = await axios.post(
        `/api/patients/${patientId}/allergies`,
        newAllergy,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      setAllergies([...allergies, response.data.allergy]);

      setNewAllergy({
        name: '',
        severity: 'Low',
      });

      alert('Allergy added successfully.');
    } catch (error: any) {
      console.error('Error adding allergy:', error);
      alert(error.response?.data?.error || 'Failed to add allergy.');
    }
  };

  const handleDeleteAllergy = async (allergyId: string | undefined) => {
    if (!allergyId) return;

    if (!window.confirm('Are you sure you want to delete this allergy?')) return;

    try {
      await axios.delete(`/api/patients/${patientId}/allergies/${allergyId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      setAllergies(allergies.filter((a) => a._id !== allergyId));

      alert('Allergy deleted successfully.');
    } catch (error: any) {
      console.error('Error deleting allergy:', error);
      alert(error.response?.data?.error || 'Failed to delete allergy.');
    }
  };

  const handleTreatmentSave = async () => {
    try {
      const response = await axios.put(
        `/api/patients/${patientId}`,
        { currentDiagnosis: treatmentInfo.currentDiagnosis },
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      setIsTreatmentEditing(false);
      setTreatmentInfo({
        currentDiagnosis: response.data.patient.treatmentInfo.currentDiagnosis,
        lastUpdated: response.data.patient.treatmentInfo.lastUpdated,
      });

      alert('Treatment information updated successfully.');
    } catch (error: any) {
      console.error('Error updating treatment information:', error);
      alert(error.response?.data?.error || 'Failed to update treatment information.');
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Prepare the data to be updated
      const updatedData = {
        age: editableData.age !== '' ? Number(editableData.age) : undefined,
        gender: editableData.gender !== '' ? editableData.gender : undefined,
        bloodGroup: editableData.bloodGroup !== '' ? editableData.bloodGroup : undefined,
        primaryContact: editableData.primaryContact !== '' ? editableData.primaryContact : undefined,
        emergencyContact: editableData.emergencyContact !== '' ? editableData.emergencyContact : undefined,
      };

      // Remove undefined fields
      Object.keys(updatedData).forEach(
        (key) => updatedData[key as keyof typeof updatedData] === undefined && delete updatedData[key as keyof typeof updatedData]
      );

      // Send PUT request to update patient data
      const response = await axios.put(`/api/patients/${patientId}`, updatedData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Adjust based on your auth implementation
        },
      });

      // Update the patient data in the state
      setPatientData(response.data.patient);
      setIsEditing(false);
      alert('Patient details updated successfully.');
    } catch (error: any) {
      console.error('Error updating patient details:', error);
      alert(error.response?.data?.error || 'Failed to update patient details.');
    }
  };

  if (loadingPatient) {
    return <p>Loading patient details...</p>;
  }

  if (errorPatient) {
    return <p className="text-red-500">{errorPatient}</p>;
  }

  if (!patientData) {
    return <p>No patient data available.</p>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white rounded-lg w-3/4 h-5/6 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Patient Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'personal'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'prescriptions'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Prescriptions
            </button>
            <button
              onClick={() => setActiveTab('vitals')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'vitals'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Vitals
            </button>
            <button
              onClick={() => setActiveTab('treatment')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'treatment'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Treatment
            </button>
            {/* NEW TABS FOR HISTORIES AND ALLERGIES */}
            <button
              onClick={() => setActiveTab('histories')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'histories'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Medical Histories
            </button>
            <button
              onClick={() => setActiveTab('allergies')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'allergies'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Allergies
            </button>
          </div>

          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <button
                  onClick={isEditing ? handleSaveChanges : () => setIsEditing(true)}
                  className={`flex items-center ${
                    isEditing
                      ? 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
                      : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  {isEditing ? 'Save Changes' : (
                    <>
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Field
                  label="Name"
                  value={`${patientData.firstName} ${patientData.lastName}`}
                  editable={false}
                />
                <Field
                  label="Age"
                  value={isEditing ? editableData.age : (patientData.age !== undefined && patientData.age !== null && patientData.age !== '' ? patientData.age.toString() : 'No data')}
                  editable={isEditing}
                  onChange={(e) => setEditableData({ ...editableData, age: e.target.value })}
                />
                <Field
                  label="Gender"
                  value={isEditing ? editableData.gender : (patientData.gender || 'No data')}
                  editable={isEditing}
                  onChange={(e) => setEditableData({ ...editableData, gender: e.target.value })}
                />
                <Field
                  label="Blood Group"
                  value={isEditing ? editableData.bloodGroup : (patientData.bloodGroup || 'No data')}
                  editable={isEditing}
                  onChange={(e) => setEditableData({ ...editableData, bloodGroup: e.target.value })}
                />
                <Field
                  label="Contact Number"
                  value={isEditing ? editableData.primaryContact : (patientData.primaryContact || 'No data')}
                  editable={isEditing}
                  onChange={(e) => setEditableData({ ...editableData, primaryContact: e.target.value })}
                />
                <Field
                  label="Emergency Contact"
                  value={editableData.emergencyContact}
                  editable={isEditing}
                  onChange={(e) => setEditableData({ ...editableData, emergencyContact: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Prescriptions Tab */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Prescriptions</h3>
                {/* <button
                  onClick={handleAddPrescription}
                  className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Medicine
                </button> */}
              </div>

              {loadingPrescriptions ? (
                <p>Loading prescriptions...</p>
              ) : errorPrescriptions ? (
                <p className="text-red-500">{errorPrescriptions}</p>
              ) : prescriptions.length === 0 ? (
                <p>No prescriptions found.</p>
              ) : (
                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <div
                      key={prescription._id}
                      className="bg-gray-50 p-4 rounded-lg flex justify-between items-start"
                    >
                      <div>
                        <p className="font-medium">{prescription.medicine}</p>
                        <p className="text-sm text-gray-600">
                          {prescription.dosage} - {prescription.timing}
                        </p>
                        <p className="text-sm text-gray-600">
                          {prescription.frequency}x per day
                        </p>
                        {prescription.times && prescription.times.length > 0 && (
                          <p className="text-sm text-gray-600">
                            Time(s): {prescription.times.join(', ')}
                          </p>
                        )}
                        {prescription.instructions && (
                          <p className="text-sm text-gray-600 mt-1">
                            {prescription.instructions}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeletePrescription(prescription._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-white border rounded-lg p-4 mt-6">
                <h4 className="font-medium mb-4">Add New Prescription</h4>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Medicine name"
                    value={newPrescription.medicine}
                    onChange={(e) =>
                      setNewPrescription({
                        ...newPrescription,
                        medicine: e.target.value,
                      })
                    }
                    className="border rounded px-3 py-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Dosage (e.g., 500mg)"
                    value={newPrescription.dosage}
                    onChange={(e) =>
                      setNewPrescription({
                        ...newPrescription,
                        dosage: e.target.value,
                      })
                    }
                    className="border rounded px-3 py-2"
                    required
                  />
                  <select
                    value={newPrescription.timing}
                    onChange={(e) =>
                      setNewPrescription({
                        ...newPrescription,
                        timing: e.target.value,
                      })
                    }
                    className="border rounded px-3 py-2"
                    required
                  >
                    <option>Before meals</option>
                    <option>After meals</option>
                    <option>With meals</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Frequency per day"
                    value={newPrescription.frequency}
                    onChange={(e) =>
                      setNewPrescription({
                        ...newPrescription,
                        frequency: parseInt(e.target.value) || 1,
                      })
                    }
                    className="border rounded px-3 py-2"
                    min="1"
                    required
                  />
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time(s)
                    </label>
                    <TimeInput
                      times={newPrescription.times}
                      setTimes={(times) =>
                        setNewPrescription({
                          ...newPrescription,
                          times,
                        })
                      }
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Special instructions"
                    value={newPrescription.instructions}
                    onChange={(e) =>
                      setNewPrescription({
                        ...newPrescription,
                        instructions: e.target.value,
                      })
                    }
                    className="border rounded px-3 py-2 col-span-2"
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleAddPrescription}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Medicine
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Vitals Tab */}
          {activeTab === 'vitals' && (
            <div>
              <h3 className="text-lg font-semibold mb-6">Vital Statistics</h3>
              <VitalsChart patientId={patientId} />
            </div>
          )}

          {/* Treatment Tab */}
          {activeTab === 'treatment' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Treatment Information</h3>
                {!isTreatmentEditing ? (
                  <button
                    onClick={() => setIsTreatmentEditing(true)}
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={handleTreatmentSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium mb-2">Current Diagnosis</h4>
                {isTreatmentEditing ? (
                  <textarea
                    value={treatmentInfo.currentDiagnosis}
                    onChange={(e) =>
                      setTreatmentInfo({
                        ...treatmentInfo,
                        currentDiagnosis: e.target.value,
                      })
                    }
                    className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter current diagnosis and treatment details..."
                  />
                ) : (
                  <p className="text-gray-600">
                    {treatmentInfo.currentDiagnosis || 'No data is stored.'}
                  </p>
                )}
                {treatmentInfo.lastUpdated && (
                  <p className="text-sm text-gray-500 mt-2">
                    Last updated:{' '}
                    {new Date(treatmentInfo.lastUpdated).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* NEW: Medical Histories Tab */}
          {activeTab === 'histories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Medical Histories</h3>
                {/* <button
                  onClick={handleAddHistory}
                  className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add History
                </button> */}
              </div>

              {loadingHistories ? (
                <p>Loading medical histories...</p>
              ) : errorHistories ? (
                <p className="text-red-500">{errorHistories}</p>
              ) : histories.length === 0 ? (
                <p>No medical histories found.</p>
              ) : (
                <div className="space-y-4">
                  {histories.map((history) => (
                    <div
                      key={history._id}
                      className="bg-gray-50 p-4 rounded-lg flex justify-between items-start"
                    >
                      <div>
                        <p className="font-medium">{history.condition}</p>
                        {history.year && (
                          <p className="text-sm text-gray-600">Year: {history.year}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteHistory(history._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-white border rounded-lg p-4 mt-6">
                <h4 className="font-medium mb-4">Add New Medical History</h4>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Condition"
                    value={newHistory.condition}
                    onChange={(e) =>
                      setNewHistory({
                        ...newHistory,
                        condition: e.target.value,
                      })
                    }
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Year (optional)"
                    value={newHistory.year}
                    onChange={(e) =>
                      setNewHistory({
                        ...newHistory,
                        year: e.target.value,
                      })
                    }
                    className="border rounded px-3 py-2"
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleAddHistory}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add History
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* NEW: Allergies Tab */}
          {activeTab === 'allergies' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Allergies</h3>
                {/* <button
                  onClick={handleAddAllergy}
                  className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Allergy
                </button> */}
              </div>

              {loadingAllergies ? (
                <p>Loading allergies...</p>
              ) : errorAllergies ? (
                <p className="text-red-500">{errorAllergies}</p>
              ) : allergies.length === 0 ? (
                <p>No allergies found.</p>
              ) : (
                <div className="space-y-4">
                  {allergies.map((allergy) => (
                    <div
                      key={allergy._id}
                      className="bg-gray-50 p-4 rounded-lg flex justify-between items-start"
                    >
                      <div>
                        <p className="font-medium">{allergy.name}</p>
                        <p className="text-sm text-gray-600">Severity: {allergy.severity}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAllergy(allergy._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-white border rounded-lg p-4 mt-6">
                <h4 className="font-medium mb-4">Add New Allergy</h4>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Allergy Name"
                    value={newAllergy.name}
                    onChange={(e) =>
                      setNewAllergy({
                        ...newAllergy,
                        name: e.target.value,
                      })
                    }
                    className="border rounded px-3 py-2"
                  />
                  <select
                    value={newAllergy.severity}
                    onChange={(e) =>
                      setNewAllergy({
                        ...newAllergy,
                        severity: e.target.value as 'High' | 'Medium' | 'Low',
                      })
                    }
                    className="border rounded px-3 py-2"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleAddAllergy}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Allergy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  editable,
  onChange,
}: {
  label: string;
  value: string;
  editable: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {editable ? (
        label === 'Gender' ? (
          <select value={value} onChange={onChange} className="w-full border rounded-lg px-3 py-2">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        ) : (
          <input
            type={label === 'Age' ? 'number' : 'text'}
            value={value}
            onChange={onChange}
            className="w-full border rounded-lg px-3 py-2"
            placeholder={!value ? 'No data' : ''}
          />
        )
      ) : (
        <p className="text-gray-900">{value}</p>
      )}
    </div>
  );
}