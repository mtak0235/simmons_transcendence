import axios, { AxiosError, AxiosPromise, AxiosResponse } from "axios";

import { IConnection } from "@domain/connection/IConnection";
import { Request } from "@domain/connection/request";
import { Cookies } from "react-cookie";

// axios.defaults.withCredentials = true;

class Connection extends IConnection {
  private readonly cookies = new Cookies();

  private async connect(request: Request): Promise<AxiosResponse> {
    request.headers["Authorization"] = `Bearer ${this.cookies.get(
      request.token
    )}`;
    request.headers["Access-Control-Allow-Origin"] = "*";

    return axios({
      url: process.env.REACT_APP_API_URL + request.path,
      method: request.method,
      headers: request.headers,
      data: request.data,
      withCredentials: true,
    });
    // console.log(res);
    // return res;

    // todo: 발급받은 쿠키 context API에 바로 적용하는 로직 구현
    // todo: multipart/form-data 구현 생각

    // todo: Exception: 예외처리 어떻게 해야할까 고민해보자.
  }

  public async refreshToken(): Promise<void> {
    const request = new Request({
      path: "/auth/token",
      headers: {
        refresh_token: this.cookies.get("refresh_token"),
      },
    });
    await this.connect(request);

    // todo: error: 아마 로그인 페이지로 리다이렉션 시키면 될 듯
    // if (response instanceof AxiosError) throw response; // todo: error handling
  }

  public async access(): Promise<void> {
    const request = new Request({
      path: "/auth/login/access",
      token: "sign",
      method: "post",
    });
    await this.connect(request);
  }

  private async interceptor(request: Request): Promise<any> {
    try {
      return (await this.connect(request)).data;
    } catch (err: any) {
      const response: AxiosError = err;

      if (response.response?.status !== 401) throw response; // todo: error handling

      await this.refreshToken();

      return (await this.connect(request)).data;
    }
  }

  public get(request: Request): Promise<any> {
    request.method = "get";
    return this.interceptor(request);
  }

  public post(request: Request): AxiosPromise {
    request.method = "post";
    return this.interceptor(request);
  }

  public delete(request: Request): AxiosPromise {
    request.method = "delete";
    return this.interceptor(request);
  }

  public put(request: Request): AxiosPromise {
    request.method = "put";
    return this.interceptor(request);
  }

  public patch(request: Request): AxiosPromise {
    request.method = "patch";
    return this.interceptor(request);
  }

  public getProfile() {}
}

export default Connection;
