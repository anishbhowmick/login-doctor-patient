import React from 'react';
import { Users, Calendar, AlertCircle } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalPatients: number;
    appointmentsToday: number;
    criticalCases: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Appointments Today',
      value: stats.appointmentsToday,
      icon: Calendar,
      color: 'green',
    },
    {
      title: 'Critical Cases',
      value: stats.criticalCases,
      icon: AlertCircle,
      color: 'red',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-xl shadow-sm p-6 transition-transform hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
            <card.icon
              className={`w-10 h-10 text-${card.color}-500 opacity-80`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}