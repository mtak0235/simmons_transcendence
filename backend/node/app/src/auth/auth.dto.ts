export interface AuthResponseDto {
  status: number;
  message: string;
  twoFactor?: boolean;
  firstAccess?: boolean;
  token?: boolean;
}

export interface TokenDto {
  accessToken?: string;
  refreshToken?: string;
  sign?: string;
  code?: string;
}
