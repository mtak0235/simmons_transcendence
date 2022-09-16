import { AxiosPromise } from "axios";

import { HttpRequest } from "@domain/http/HttpRequest";

// todo: update: 타입 어떻게 정할지 생각해 봐야함
type ResponseBody = Record<string, string | object>;

export abstract class IHttp {
  // public abstract connect(request: HttpRequest): Promise<AxiosPromise>;
  // public abstract interceptor(request: HttpRequest): Promise<AxiosPromise>;
  public abstract checkToken(): Promise<boolean>;
  public abstract refreshToken(): Promise<void>;
  public abstract firstAccess(value: any): Promise<void>;
  public abstract twoFactor(value: number): Promise<void>;
  public abstract logout(): Promise<void>;
  public abstract getUserProfile(value: number): Promise<any>;
  public abstract getUserAchievement(value: number): Promise<any>;
  public abstract getUserRecord(value: number): Promise<any>;
  public abstract updateUserProfile(value: any): Promise<void>;
  public abstract updateUserImage(value: any): Promise<void>;
  public abstract deleteUserImage(): Promise<any>;
}
