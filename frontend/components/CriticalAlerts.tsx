"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const MAX_ALERTS = 5;

interface CriticalTemperatureAlert {
  sensorId: string;
  sensorName: string;
  value: number;
  unit: string | null;
  threshold: number;
  timestamp: string;
  message: string;
}

interface VisibleAlert extends CriticalTemperatureAlert {
  key: string;
}

export default function CriticalAlerts() {
  const [alerts, setAlerts] = useState<VisibleAlert[]>([]);

  useEffect(() => {
    // EventSource reconnects automatically if the connection drops
    const source = new EventSource(`${API_URL}/alerts/stream`);

    source.addEventListener("critical-temperature", (event) => {
      const alert: CriticalTemperatureAlert = JSON.parse(
        (event as MessageEvent<string>).data,
      );
      const key = `${alert.sensorId}-${alert.timestamp}`;
      setAlerts((prev) => [{ ...alert, key }, ...prev].slice(0, MAX_ALERTS));
    });

    return () => source.close();
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div
      role="alert"
      className="fixed top-4 right-4 z-50 flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-2"
    >
      {alerts.map((alert) => (
        <div
          key={alert.key}
          className="flex items-start justify-between gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-red-800 shadow-lg"
        >
          <div>
            <p className="font-semibold">Критична температура!</p>
            <p className="text-sm">{alert.message}</p>
            <p className="mt-1 text-xs text-red-600">
              {new Date(alert.timestamp).toLocaleString("uk-UA")}
            </p>
          </div>
          <button
            type="button"
            aria-label="Закрити"
            className="text-red-600 hover:text-red-900"
            onClick={() =>
              setAlerts((prev) => prev.filter((a) => a.key !== alert.key))
            }
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
