import { Plus } from 'lucide-react';
import React from 'react';

interface TimeInputProps {
  times: string[];
  setTimes: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function TimeInput({ times, setTimes }: TimeInputProps) {
  const handleTimeChange = (index: number, value: string) => {
    const updatedTimes = [...times];
    updatedTimes[index] = value;
    setTimes(updatedTimes);
  };

  const handleAddTime = () => {
    setTimes([...times, '']);
  };

  const handleRemoveTime = (index: number) => {
    const updatedTimes = times.filter((_, i) => i !== index);
    setTimes(updatedTimes);
  };

  return (
    <div>
      {times.map((time, index) => (
        <div key={index} className="flex items-center mb-2">
          <input
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(index, e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
          {times.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveTime(index)}
              className="ml-2 text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddTime}
        className="flex items-center text-blue-600 hover:text-blue-700"
      >
        <Plus className="w-4 h-4 mr-1" />
        Add Time
      </button>
    </div>
  );
}