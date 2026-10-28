import { AlertsService } from './alerts.service.js';

const reading = (value: number) => ({
  id: 'id-1',
  sensorName: 'Temp',
  value,
  unit: 'C',
});

describe('AlertsService', () => {
  let service: AlertsService;

  beforeEach(() => {
    service = new AlertsService();
  });

  it('emits an alert for temperature below -10', () => {
    const received: unknown[] = [];
    service.stream.subscribe((a) => received.push(a));

    const alert = service.checkTemperature(reading(-10.5));

    expect(alert?.value).toBe(-10.5);
    expect(received).toHaveLength(1);
  });

  it.each([-10, -9.9, 0, 25])('does not emit for %s', (value) => {
    const received: unknown[] = [];
    service.stream.subscribe((a) => received.push(a));

    expect(service.checkTemperature(reading(value))).toBeNull();
    expect(received).toHaveLength(0);
  });
});
