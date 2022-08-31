import {
  IsBoolean,
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsVariableWidth,
} from 'class-validator';

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
  @IsOptional()
  @IsString()
  displayName: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsBoolean()
  firstAccess?: boolean;

  @IsOptional()
  @IsBoolean()
  twoFactor: boolean;
}

export class UserUpdateDto {
  @IsOptional()
  @IsString()
  displayName: string;

  @IsOptional()
  @IsBoolean()
  twoFactor?: boolean;
}

export class UserResponseDto {
  status: number;

  body: object;
}
