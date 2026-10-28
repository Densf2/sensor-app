import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TemperatureSensorsModule } from './temperature-sensors/temperature-sensors.module.js';
import { TemperatureSensor } from './temperature-sensors/entities/temperature-sensor.entity.js';
import { HumiditySensorsModule } from './humidity-sensors/humidity-sensors.module.js';
import { HumiditySensor } from './humidity-sensors/entities/humidity-sensor.entity.js';
import { AlertsModule } from './alerts/alerts.module.js';
import { CreateSensorTables1761600000000 } from './migrations/1761600000000-CreateSensorTables.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<string>('DB_PORT', '5432')),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [TemperatureSensor, HumiditySensor],
        migrations: [CreateSensorTables1761600000000],
        migrationsRun: true,
        synchronize: false,
        ssl:
          configService.get<string>('DB_SSL', 'true') === 'true'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
    TemperatureSensorsModule,
    HumiditySensorsModule,
    AlertsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
