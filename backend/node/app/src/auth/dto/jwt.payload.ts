interface JwtPayload {
  id: number;
  twoFactor: boolean;
  code: string;
}
