interface HttpTokenParam {
  accessToken?: string;
  refreshToken?: string;
  sign?: string;
  code?: string;
}

class HttpToken {
  accessToken?: string;
  refreshToken?: string;
  sign?: string;
  code?: string;

  constructor(param: HttpTokenParam) {
    this.accessToken = param.accessToken ? param.accessToken : "";
    this.refreshToken = param.refreshToken ? param.refreshToken : "";
    this.sign = param.sign ? param.sign : "";
    this.code = param.code ? param.code : "";
  }
}

export default HttpToken;
