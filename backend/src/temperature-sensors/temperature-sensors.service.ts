import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemperatureSensor } from './entities/temperature-sensor.entity.js';
import { CreateTemperatureSensorDto } from './dto/create-temperature-sensor.dto.js';
import { UpdateTemperatureSensorDto } from './dto/update-temperature-sensor.dto.js';

@Injectable()
export class TemperatureSensorsService {
  constructor(
    @InjectRepository(TemperatureSensor)
    private readonly sensorRepository: Repository<TemperatureSensor>,
  ) {}

  async create(
    createSensorDto: CreateTemperatureSensorDto,
  ): Promise<TemperatureSensor> {
    const sensor = this.sensorRepository.create(createSensorDto);
    return await this.sensorRepository.save(sensor);
  }

  async findAll(): Promise<TemperatureSensor[]> {
    return await this.sensorRepository.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async findOne(id: string): Promise<TemperatureSensor> {
    const sensor = await this.sensorRepository.findOneBy({ id });
    if (!sensor)
      throw new NotFoundException(`sensor with id ${id} not found`);
    return sensor;
  }

  async update(
    id: string,
    updateSensorDto: UpdateTemperatureSensorDto,
  ): Promise<TemperatureSensor> {
    const sensor = await this.findOne(id);
    Object.assign(sensor, updateSensorDto);
    return await this.sensorRepository.save(sensor);
  }

  async remove(id: string): Promise<void> {
    const sensor = await this.findOne(id);
    await this.sensorRepository.remove(sensor);
  }
}
