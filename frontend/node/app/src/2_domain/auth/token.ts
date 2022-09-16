type AuthConstructorParam = {
  accessToken?: string;
  refreshToken?: string;
  sign?: string;
  code?: string;
};

class Token {
  accessToken?: string;
  refreshToken?: string;
  sign?: string;
  code?: string;

  constructor(param: AuthConstructorParam) {
    this.accessToken = param.accessToken;
    this.refreshToken = param.refreshToken;
    this.sign = param.sign;
    this.code = param.code;
  }

  static fromJson = (json: any): Token => {
    return new Token({
      accessToken: json["accessToken"],
      refreshToken: json["refreshToken"],
      sign: json["sign"],
      code: json["code"],
    });
  };
}

export default Token;
