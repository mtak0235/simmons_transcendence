export interface HttpRequestParam {
  path: string;
  method?: string;
  token?: string;
  headers?: Record<string, string | number | boolean>;
  data?: any;
  params?: Record<string, any>;
}

export class HttpRequest {
  path: string;
  method: string;
  token: string;
  headers: Record<string, string | number | boolean>;
  data: string | Record<string, string | number | boolean>;
  params: Record<string, string | number | boolean>;

  constructor(param: HttpRequestParam) {
    this.path = param.path;
    this.method = param.method ? param.method : "get";
    this.token = param.token ? param.token : "accessToken";
    this.headers = param.headers ? param.headers : {};
    this.data = param.data ? param.data : {};
    this.params = param.params ? param.params : {};
  }
}
