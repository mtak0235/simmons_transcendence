export interface UserProfileDto {
  displayName?: string;
  email?: string;
  twoFactor?: string;
  // image?: FILE;
}

export interface UserDto {
  id: number;
  username: string;
  displayName: string;
  email: string;
  imagePath: string;
  firstAccess: boolean;
  twoFactor: boolean;
}
