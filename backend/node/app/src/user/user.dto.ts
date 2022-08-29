import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UserSignDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  displayName: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  imagePath: string;
}

export class UserAccessDto {
  @IsString()
  displayName: string;

  @IsString()
  email: string;

  @IsBoolean()
  firstAccess?: boolean;

  @IsBoolean()
  twoFactor: boolean;

  @IsString()
  imagePath: string;
}
