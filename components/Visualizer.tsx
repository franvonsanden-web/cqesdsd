import React, { useEffect, useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';

interface VisualizerProps {
  isPlaying: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ isPlaying }) => {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const initialData = Array.from({ length: 40 }, (_, i) => ({
      name: i.toString(),
      value: Math.random() * 20 + 5,
    }));
    setData(initialData);
  }, []);

  useEffect(() => {
    let interval: number;

    if (isPlaying) {
      interval = window.setInterval(() => {
        setData((prevData) =>
          prevData.map((item) => ({
            ...item,
            value: Math.max(5, Math.random() * 80),
          }))
        );
      }, 100);
    } else {
      setData((prevData) =>
        prevData.map((item) => ({ ...item, value: Math.max(5, item.value * 0.9) }))
      );
    }

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="w-full h-full bg-[#111]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <Bar dataKey="value" radius={[2, 2, 0, 0]} isAnimationActive={true} animationDuration={100}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={isPlaying ? '#3b82f6' : '#27272a'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Visualizer;