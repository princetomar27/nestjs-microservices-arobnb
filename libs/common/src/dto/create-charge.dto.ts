import { CardDto } from '.';
import {
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateChargeDto {
  @IsOptional()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CardDto)
  card: CardDto;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  paymentMethodId: string;

  @IsString()
  @IsOptional()
  token?: string;

  @IsString()
  @IsOptional()
  currency?: string;
}
