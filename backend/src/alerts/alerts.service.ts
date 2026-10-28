import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

export const CRITICAL_TEMPERATURE_C = -10;

export interface CriticalTemperatureAlert {
  sensorId: string;
  sensorName: string;
  value: number;
  unit: string | null;
  threshold: number;
  timestamp: Date;
  message: string;
}

@Injectable()
export class AlertsService {
  private readonly alerts$ = new Subject<CriticalTemperatureAlert>();

  get stream(): Observable<CriticalTemperatureAlert> {
    return this.alerts$.asObservable();
  }

  checkTemperature(sensor: {
    id: string;
    sensorName: string;
    value: number;
    unit: string | null;
    timestamp?: Date | null;
  }): CriticalTemperatureAlert | null {
    if (sensor.value >= CRITICAL_TEMPERATURE_C) return null;

    const alert: CriticalTemperatureAlert = {
      sensorId: sensor.id,
      sensorName: sensor.sensorName,
      value: sensor.value,
      unit: sensor.unit,
      threshold: CRITICAL_TEMPERATURE_C,
      timestamp: sensor.timestamp ?? new Date(),
      message: `Критична температура: ${sensor.sensorName} показує ${sensor.value}${sensor.unit ? ` ${sensor.unit}` : ''} (нижче ${CRITICAL_TEMPERATURE_C})`,
    };
    this.alerts$.next(alert);
    return alert;
  }
}
