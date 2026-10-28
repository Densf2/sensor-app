import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHumiditySensorDto {
  @IsNotEmpty()
  @IsString()
  sensorName: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  value: number;

  @IsNotEmpty()
  @IsString()
  unit: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  timestamp?: Date;
}
