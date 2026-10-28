import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { Observable, interval, map, merge } from 'rxjs';
import { AlertsService } from './alerts.service.js';

const HEARTBEAT_MS = 25_000;

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Sse('stream')
  stream(): Observable<MessageEvent> {
    const alerts$ = this.alertsService.stream.pipe(
      map((alert): MessageEvent => ({
        type: 'critical-temperature',
        data: alert,
      })),
    );
    // keeps the connection alive through proxies (Render) that drop idle streams
    const heartbeat$ = interval(HEARTBEAT_MS).pipe(
      map((): MessageEvent => ({ type: 'ping', data: '' })),
    );
    return merge(alerts$, heartbeat$);
  }
}
