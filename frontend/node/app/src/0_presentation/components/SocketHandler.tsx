import React, { useEffect } from "react";
import Get from "@root/lib/di/get";
import ISocket from "@domain/socket/ISocket";
import SocketDto from "SocketDto";
import {
  selector,
  useRecoilState,
  useRecoilValue,
  useResetRecoilState,
} from "recoil";
import { getLoginState } from "@presentation/components/LoginHandler";
import useUserEvent from "@application/socket/useUserEvent";
import { RecoilAtom } from "@application/socket/RecoilDto";
import { useAsync } from "react-async";
import { IHttp } from "@domain/http/IHttp";
import { Cookies } from "react-cookie";
import axios, { AxiosError } from "axios";
import { HttpRequest } from "@domain/http/HttpRequest";
import HttpToken from "@domain/http/HttpToken";
import useChannelEvent from "@application/socket/useChannelEvent";

interface SocketHandlerProps {
  children: React.ReactNode;
}

const connect = selector({
  key: "ddd",
  get: ({ get }) => {
    return get(RecoilAtom.user.me);
  },
});

const refreshToken = async () => {
  const cookies = new Cookies();
  const request = new HttpRequest({
    path: "/auth/token",
    headers: {
      Authorization: `Bearer ${cookies.get("accessToken")}`,
      refresh_token: cookies.get("refreshToken"),
    },
  });

  const response = await axios({
    url: process.env.REACT_APP_API_URL + request.path,
    method: request.method,
    headers: request.headers,
    data: request.data,
    params: request.params,
    withCredentials: true,
  });

  const httpToken = new HttpToken(response.data.token);
  for (const key in httpToken)
    if (httpToken[key].length) cookies.set(key, httpToken[key]);
};

const SocketHandler = ({ children }: SocketHandlerProps) => {
  const socket: ISocket<any, any> = Get.get("ISocket");
  const http: IHttp = Get.get("IHttp");
  const { error } = useAsync({
    promiseFn: refreshToken,
  });

  const me = useRecoilValue(connect);

  useEffect(() => {
    socket.connect();

    return () => {
      socket.reRender();
    };
  }, []);

  useUserEvent();
  useChannelEvent();

  useEffect(() => {
    console.log(me);
  }, [me]);

  if (error) {
    console.log(error);
    socket.disconnect();
    http.clearToken();
    window.location.href = process.env.REACT_APP_BASE_URL;
  }

  return <>{children}</>;
};

export default SocketHandler;
