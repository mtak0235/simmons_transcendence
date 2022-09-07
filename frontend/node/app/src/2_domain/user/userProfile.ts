type UserProfileParam = {
  displayName?: string;
  email?: string;
  twoFactor?: boolean;
  // image?: FILE;
};

class UserProfile {
  displayName?: string;
  email?: string;
  twoFactor?: boolean;
  // image?: FILE;

  constructor(param: UserProfileParam) {
    this.displayName = param.displayName;
    this.email = param.email;
    this.twoFactor = param.twoFactor;
  }

  static fromJson = (json: any): UserProfile => {
    return new UserProfile({
      displayName: json["displayName"],
      email: json["email"],
      twoFactor: json["twoFactor"],
    });
  };
}

export default UserProfile;
