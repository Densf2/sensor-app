import { firstValueFrom } from 'rxjs';
import { AlertsController } from './alerts.controller.js';
import { AlertsService } from './alerts.service.js';

describe('AlertsController', () => {
  it('streams critical temperature alerts as SSE events', async () => {
    const service = new AlertsService();
    const controller = new AlertsController(service);

    const event = firstValueFrom(controller.stream());
    service.checkTemperature({
      id: 'id-1',
      sensorName: 'Temp',
      value: -15,
      unit: 'C',
    });

    const received = await event;
    expect(received.type).toBe('critical-temperature');
    expect(received.data).toMatchObject({ sensorName: 'Temp', value: -15 });
  });
});
