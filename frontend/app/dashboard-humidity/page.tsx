"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Reading {
  time: string;
  value: number;
}

export default function DashboardHumidity() {
  const [readings, setReadings] = useState<Reading[]>(() =>
    Array.from({ length: 12 }, (_, i) => ({
      time: `${i + 1} хв`,
      value: 45 + Math.random() * 15,
    })),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setReadings((prev) => {
        const newReading = {
          time: `${prev.length + 1} хв`,
          value: 45 + Math.random() * 15,
        };
        return [...prev.slice(-11), newReading];
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Графік давача вологості
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow-md border">
        <h2 className="text-lg font-medium mb-4">Sensor B</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={readings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[40, 65]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0891b2"
                strokeWidth={2}
                dot={true}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
