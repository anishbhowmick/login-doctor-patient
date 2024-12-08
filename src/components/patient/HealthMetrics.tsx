import React, { useState, useEffect } from 'react';
import { LineChart, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HealthMetric {
  systolicBP: number;
  diastolicBP: number;
  bloodSugar: number;
  timestamp: string;
  bloodPressure: string;
}

export default function HealthMetrics() {
  const { patient } = useAuth();
  const [recentMetrics, setRecentMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    if (patient?.id) {
      fetchVitals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient]);

  const fetchVitals = async () => {
    try {
      const response = await fetch(`/api/patients/${patient.id}/vitals`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vitals');
      }

      const data = await response.json();

      // Ensure that data.vitals is an array
      if (!Array.isArray(data.vitals)) {
        throw new Error('Invalid vitals data format');
      }

      // Transform the vitals data to match HealthMetric interface
      const transformedVitals: HealthMetric[] = data.vitals
        .slice(-4)
        .reverse()
        .map((vital: any, index: number) => {
          const systolic = typeof vital.systolic === 'number' ? vital.systolic : 0;
          const diastolic = typeof vital.diastolic === 'number' ? vital.diastolic : 0;
          const bloodSugar = typeof vital.sugar === 'number' ? vital.sugar : 0;

          // Compute bloodPressure string
          const bloodPressure = `${systolic}/${diastolic} mmHg`;

          // Validate and assign timestamp
          const timestamp = vital.timestamp
            ? new Date(vital.timestamp).toISOString()
            : new Date().toISOString();

          return {
            systolicBP: systolic,
            diastolicBP: diastolic,
            bloodSugar: bloodSugar,
            timestamp: timestamp,
            bloodPressure: bloodPressure,
          };
        });

      setRecentMetrics(transformedVitals);

      // Set the Last Updated time to the most recent vital entry
      if (transformedVitals.length > 0) {
        setLastUpdated(new Date(transformedVitals[0].timestamp).toLocaleString());
      } else {
        setLastUpdated('No data available');
      }
    } catch (error: any) {
      console.error('Error fetching vitals:', error);
      alert('Failed to load health metrics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: HealthMetric) => {
    if (!patient?.id) {
      alert('Patient information is missing.');
      return;
    }

    try {
      const response = await fetch(`/api/patients/${patient.id}/vitals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          systolic: data.systolicBP,
          diastolic: data.diastolicBP,
          sugar: data.bloodSugar,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit vitals');
      }

      fetchVitals();
      alert('Health metrics submitted successfully.');
    } catch (error: any) {
      console.error('Error submitting vitals:', error);
      alert(`Failed to submit health metrics. ${error.message}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <HealthMetricsForm onSubmit={handleSubmit} />
      {loading ? (
        <p>Loading recent metrics...</p>
      ) : (
        <div className="mt-6">
          <RecentMetrics recentMetrics={recentMetrics} lastUpdated={lastUpdated} />
        </div>
      )}
    </div>
  );
}

interface HealthMetricsFormProps {
  onSubmit: (data: HealthMetric) => void;
}

function HealthMetricsForm({ onSubmit }: HealthMetricsFormProps) {
  const [formData, setFormData] = useState({
    systolicBP: '',
    diastolicBP: '',
    bloodSugar: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    const systolic = Number(formData.systolicBP);
    const diastolic = Number(formData.diastolicBP);
    const sugar = Number(formData.bloodSugar);

    // Validate input ranges
    if (
      systolic < 0 || systolic > 300 ||
      diastolic < 0 || diastolic > 200 ||
      sugar < 0 || sugar > 600
    ) {
      alert('Please enter valid health metrics.');
      return;
    }

    onSubmit({
      systolicBP: systolic,
      diastolicBP: diastolic,
      bloodSugar: sugar,
      timestamp: new Date().toISOString(),
      bloodPressure: `${systolic}/${diastolic} mmHg`,
    });

    setFormData({ systolicBP: '', diastolicBP: '', bloodSugar: '' });
  };

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <Activity className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Daily Health Metrics</h2>
      </div>

      <form onSubmit={handleSubmitForm} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <MetricInput
            label="Systolic BP"
            unit="mmHg"
            value={formData.systolicBP}
            onChange={(value) => handleChange('systolicBP', value)}
            min={0}
            max={300}
          />
          <MetricInput
            label="Diastolic BP"
            unit="mmHg"
            value={formData.diastolicBP}
            onChange={(value) => handleChange('diastolicBP', value)}
            min={0}
            max={200}
          />
        </div>

        <MetricInput
          label="Blood Sugar"
          unit="mg/dL"
          value={formData.bloodSugar}
          onChange={(value) => handleChange('bloodSugar', value)}
          min={0}
          max={600}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Submit Reading
        </button>
      </form>
    </div>
  );
}

interface MetricInputProps {
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
}

function MetricInput({ label, unit, value, onChange, min, max }: MetricInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} ({unit})
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder={`Enter ${label.toLowerCase()}`}
        required
        min={min}
        max={max}
      />
    </div>
  );
}

interface RecentMetricsProps {
  recentMetrics: HealthMetric[];
  lastUpdated: string;
}

function RecentMetrics({ recentMetrics, lastUpdated }: RecentMetricsProps) {
  if (recentMetrics.length === 0) {
    return <p>No recent metrics available.</p>;
  }

  return (
    <div>
      {/* Last Updated Time
      <p className="text-sm text-gray-500 mb-4">
        <span className="font-semibold">Last Updated:</span> {lastUpdated}
      </p> */}

      {/* Recent Metrics List */}
      <div className="space-y-3">
        {recentMetrics.map((metric, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              {new Date(metric.timestamp).toLocaleDateString()} {new Date(metric.timestamp).toLocaleTimeString()}
            </p>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {/* Display computed bloodPressure string */}
              <p className="text-sm">
                <span className="font-medium">BP:</span> {metric.bloodPressure}
              </p>
              <p className="text-sm">
                <span className="font-medium">Sugar:</span> {metric.bloodSugar} mg/dL
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}