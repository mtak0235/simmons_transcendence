import { AxiosPromise } from "axios";

import { Request } from "@domain/connection/request";

// todo: update: 타입 어떻게 정할지 생각해 봐야함
type ResponseBody = Record<string, string | object>;

export abstract class IConnection {
  public abstract connect(request: Request): Promise<AxiosPromise>;
  public abstract get(request: Request): Promise<ResponseBody>;
  public abstract post(request: Request): AxiosPromise;
  public abstract delete(request: Request): AxiosPromise;
  public abstract put(request: Request): AxiosPromise;
  public abstract patch(request: Request): AxiosPromise;
}
