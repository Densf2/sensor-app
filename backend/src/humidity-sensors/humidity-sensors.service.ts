import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HumiditySensor } from './entities/humidity-sensor.entity.js';
import { CreateHumiditySensorDto } from './dto/create-humidity-sensor.dto.js';
import { UpdateHumiditySensorDto } from './dto/update-humidity-sensor.dto.js';

@Injectable()
export class HumiditySensorsService {
  constructor(
    @InjectRepository(HumiditySensor)
    private readonly sensorRepository: Repository<HumiditySensor>,
  ) {}

  async create(createSensorDto: CreateHumiditySensorDto): Promise<HumiditySensor> {
    const sensor = this.sensorRepository.create(createSensorDto);
    return await this.sensorRepository.save(sensor);
  }

  async findAll(): Promise<HumiditySensor[]> {
    return await this.sensorRepository.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async findOne(id: string): Promise<HumiditySensor> {
    const sensor = await this.sensorRepository.findOneBy({ id });
    if (!sensor)
      throw new NotFoundException(`sensor with id ${id} not found`);
    return sensor;
  }

  async update(
    id: string,
    updateSensorDto: UpdateHumiditySensorDto,
  ): Promise<HumiditySensor> {
    const sensor = await this.findOne(id);
    Object.assign(sensor, updateSensorDto);
    return await this.sensorRepository.save(sensor);
  }

  async remove(id: string): Promise<void> {
    const sensor = await this.findOne(id);
    await this.sensorRepository.remove(sensor);
  }
}
