import axios, { AxiosError, AxiosResponse } from "axios";

import { IHttp } from "@domain/http/IHttp";
import { HttpRequest } from "@domain/http/HttpRequest";
import HttpToken from "@domain/http/HttpToken";

// todo: 통신 관련 오류 Filter 만들어서 직접 처리 하는걸로
// todo: 집갔다와서 Socket도 빠르게 만들어버리자
// todo: 함수가 너무 많은데 그냥 application 에서 param 받아올까 고민해보자 (taeskim님하고 같이)
class Http extends IHttp {
  private async connect(request: HttpRequest): Promise<AxiosResponse> {
    request.headers["Authorization"] = `Bearer ${localStorage.getItem(
      request.token
    )}`;
    request.headers["Access-Control-Allow-Origin"] = "*";

    console.log(request);
    const response = await axios({
      url: process.env.REACT_APP_API_URL + request.path,
      method: request.method,
      headers: request.headers,
      data: request.data,
      params: request.params,
    });

    if (response.data.token) {
      const httpToken = new HttpToken(response.data.token);
      for (const key in httpToken)
        if (httpToken[key].length) localStorage.setItem(key, httpToken[key]);
    }
    return response;

    // todo: multipart/form-data 구현 생각

    // todo: Exception: 예외처리 어떻게 해야할까 고민해보자.
  }

  private async interceptor(request: HttpRequest): Promise<any> {
    try {
      return (await this.connect(request)).data;
    } catch (err: any) {
      const response: AxiosError = err;

      if (response.response?.status !== 401) throw response; // todo: error handling

      try {
        await this.refreshToken();

        return (await this.connect(request)).data;
      } catch (err: any) {
        const response: AxiosError = err;

        if (response.response?.status === 401) throw response; // todo: error handling
      }
    }
  }

  public async checkToken(): Promise<boolean> {
    try {
      const request = new HttpRequest({ path: "/auth/token/check" });

      await this.interceptor(request);
      return true;
    } catch (err: any) {
      return false;
    }
  }

  // todo: private
  public async refreshToken(): Promise<void> {
    const request = new HttpRequest({
      path: "/auth/token",
      headers: {
        refresh_token: localStorage.getItem("refreshToken"),
      },
    });
    await this.connect(request);

    // todo: error: 아마 로그인 페이지로 리다이렉션 시키면 될 듯
    // if (response instanceof AxiosError) throw response; // todo: error handling
  }

  public clearToken() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("sign");
    localStorage.removeItem("code");
  }

  // todo: update: param type to userAccessDto
  // todo: multipart-form/data 처리
  /*
   *
   * {
   *    displayName: "seongsu",  // 중복시 400 Bad Request
   *    email: "test@teest.com",  // 이메일 양식 검사함
   *    two_factor: "true 또는 false",
   *    image: "png, jpeg, jpg 총 3개의 확장자인 이미지 파일만 받아옴. form-data로 전송할 것"
   * }
   *
   * */
  public async firstAccess(value: any): Promise<void> {
    const request = new HttpRequest({
      path: "/auth/login/access",
      token: "sign",
      method: "post",
      data: value,
    });
    await this.connect(request);
    localStorage.removeItem("sign");
  }

  public async twoFactor(value: number): Promise<void> {
    if (isNaN(value)) throw Error;
    const request = new HttpRequest({
      path: "/auth/email-verify",
      token: "code",
      params: { code: value },
    });
    await this.connect(request);
    localStorage.removeItem("code");
  }

  public async login(): Promise<void> {
    const request = new HttpRequest({
      path: "/auth/login",
    });
    try {
      const result = await this.connect(request);
      console.log(result);
    } catch (e) {
      console.log(e);
    }
  }

  public async logout(): Promise<void> {
    const request = new HttpRequest({
      path: "/auth/logout",
      method: "delete",
    });
    try {
      await this.interceptor(request);
    } catch (err: any) {
      throw err;
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }

  // todo: update return type to userDto
  public async getUserProfile(value: number): Promise<any> {
    const request = new HttpRequest({
      path: `/user/${value}/profile`,
    });
    return await this.interceptor(request);
  }

  // todo: update return type to achievementDto
  public async getUserAchievement(value: number): Promise<any> {
    const request = new HttpRequest({
      path: `/user/${value}/achievement`,
    });
    return await this.interceptor(request);
  }

  // todo: update return type to recordDto
  public async getUserRecord(value: number): Promise<any> {
    const request = new HttpRequest({
      path: `/user/${value}/record`,
    });
    return await this.interceptor(request);
  }

  // todo: update param type to userUpdateDto
  /*
   * {
   *    "displayName": "seongsu",
   *    "twoFactor": "true 또는 false"
   *  }
   * */
  public async updateUserProfile(value: any): Promise<void> {
    const request = new HttpRequest({
      path: "/user/profile",
      method: "patch",
      data: value,
    });
    await this.interceptor(request);
  }

  // todo: update param type to Image File
  // todo: multipart-form/data 처리
  public async updateUserImage(value: any): Promise<void> {
    const request = new HttpRequest({
      path: "/user/image",
      method: "put",
      data: value,
    });
    await this.interceptor(request);
  }

  // todo: update return type to imageUrl, need Dto?
  public async deleteUserImage(): Promise<any> {
    const request = new HttpRequest({
      path: "/user/image",
      method: "delete",
    });
    return await this.interceptor(request);
  }
}

export default Http;
