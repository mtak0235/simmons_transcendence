import axios, { AxiosPromise } from "axios";

import { IConnection } from "@domain/connection/IConnection";
import { Request } from "@domain/connection/request";

class Connection extends IConnection {
  public async connect(request: Request): Promise<any> {
    request.headers.authorization = `Bearer ${request.token}`;

    const result = await axios({
      url: process.env.API_SERVER_URL + request.path,
      method: request.method,
      headers: request.headers,
      data: request.data,
    });

    // todo: 발급받은 쿠키 context API에 바로 적용하는 로직 구현
    // todo: multipart/form-data 구현 생각

    // todo: Exception: 예외처리 어떻게 해야할까 고민해보자.

    return result.data;
  }

  public get(request: Request): Promise<any> {
    request.method = "get";
    return this.connect(request);
  }

  public post(request: Request): AxiosPromise {
    request.method = "post";
    return this.connect(request);
  }

  public delete(request: Request): AxiosPromise {
    request.method = "delete";
    return this.connect(request);
  }

  public put(request: Request): AxiosPromise {
    request.method = "put";
    return this.connect(request);
  }

  public patch(request: Request): AxiosPromise {
    request.method = "patch";
    return this.connect(request);
  }
}

export default Connection;
