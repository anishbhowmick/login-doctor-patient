import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';

interface VitalsData {
  date: string;
  systolic: number;
  diastolic: number;
  sugar: number;
}

interface VitalsChartProps {
  patientId: string;
}

export default function VitalsChart({ patientId }: VitalsChartProps) {
  const [data, setData] = useState<VitalsData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVitals = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`https://medical-backend-l140.onrender.com/api/patients/${patientId}/vitals`, {
          withCredentials: true,
        });
        setData(response.data.vitals || []);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch vitals data.');
      } finally {
        setLoading(false);
      }
    };

    fetchVitals();
  }, [patientId]);

  if (loading) {
    return <p>Loading vitals data...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="systolic"
            stroke="#4A90E2"
            name="Systolic BP"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="diastolic"
            stroke="#8E44AD"
            name="Diastolic BP"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="sugar"
            stroke="#2ECC71"
            name="Sugar Level"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
      {data.length === 0 && <p className="text-gray-500 mt-4 text-center">No data present.</p>}
    </div>
  );
}