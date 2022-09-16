export interface AuthResponseDto {
  status: number;

  message: string;

  twoFactor?: boolean;

  firstAccess?: boolean;

  token?: boolean;
}
