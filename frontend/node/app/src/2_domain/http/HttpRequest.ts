export interface RequestParam {
  path: string;
  method?: string;
  token?: string;
  headers?: Record<string, string | number | boolean>;
  data?: string | Record<string, string | number | boolean>;
}

export class Request {
  path: string;
  method: string;
  token: string;
  headers: Record<string, string | number | boolean>;
  data: string | Record<string, string | number | boolean>;

  constructor(param: RequestParam) {
    this.path = param.path;
    this.method = param.method ? param.method : "get";
    this.token = param.token ? param.token : "access_token";
    this.headers = param.headers ? param.headers : {};
    this.data = param.data ? param.data : {};
  }
}
