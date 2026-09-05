import { IsString, IsNotEmpty } from 'class-validator';

export class CreateColumnDto {
  @IsString()
  @IsNotEmpty()
  title!: string;
}

export class UpdateColumnDto {
  @IsString()
  @IsNotEmpty()
  title!: string;
}
