import { IsString, IsNotEmpty } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  title!: string;
}

export class UpdateBoardDto {
  @IsString()
  @IsNotEmpty()
  title!: string;
}

export class ShareBoardDto {
  @IsString()
  @IsNotEmpty()
  email!: string;
}
