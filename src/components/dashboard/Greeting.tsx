import React from 'react';

interface GreetingProps {
  doctorName: string;
}

export default function Greeting({ doctorName }: GreetingProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <h1 className="text-2xl font-bold text-gray-900">
      {getGreeting()}, {doctorName}
    </h1>
  );
}