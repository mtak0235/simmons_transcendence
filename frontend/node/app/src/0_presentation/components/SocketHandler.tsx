import React, { useEffect } from "react";
import { atom, selector } from "recoil";
import { useAsync } from "react-async";
import axios from "axios";

import Get from "@root/lib/di/get";
import ISocket from "@domain/socket/ISocket";
import useUserEvent from "@application/socket/useUserEvent";
import { IHttp } from "@domain/http/IHttp";
import { HttpRequest } from "@domain/http/HttpRequest";
import HttpToken from "@domain/http/HttpToken";
import useChannelEvent from "@application/socket/useChannelEvent";
import SocketDto from "SocketDto";
import { v1 } from "uuid";
import useGameEvent from "@application/socket/useGameEvent";

interface SocketHandlerProps {
  children: React.ReactNode;
}

export const recoilUsers = atom<SocketDto.UserInfo[]>({
  key: `broad:users1/${v1()}`,
  default: [],
});

export const recoilSelectUsers = selector({
  key: `test/selector/${v1()}`,
  get: ({ get }) => get(recoilUsers),
});

const refreshToken = async () => {
  const request = new HttpRequest({
    path: "/auth/token",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      refresh_token: localStorage.getItem("refreshToken"),
    },
  });

  await axios({
    url: process.env.REACT_APP_API_URL + request.path,
    method: request.method,
    headers: request.headers,
    data: request.data,
    params: request.params,
  })
    .then((response) => {
      const httpToken = new HttpToken(response.data.token);
      for (const key in httpToken)
        if (httpToken[key].length) localStorage.setItem(key, httpToken[key]);
    })
    .catch((err) => {
      const http: IHttp = Get.get("IHttp");
      console.log(err);
      http.clearToken();
      window.location.href = process.env.REACT_APP_BASE_URL;
    });
};

const SocketHandler = ({ children }: SocketHandlerProps) => {
  const socket: ISocket<any, any> = Get.get("ISocket");
  const http: IHttp = Get.get("IHttp");
  const { error } = useAsync({
    promiseFn: refreshToken,
  });

  useEffect(() => {
    if (!socket.connected()) {
      socket.connect();
      console.log(socket.socket);
    }

    return () => {
      // if (socket.connected()) {
      //   socket.reRender();
      socket.disconnect();
      window.location.href = "/";
      // }
    };
  }, []);

  // useEffect(() => {
  //
  // }, [window.location.href])

  useUserEvent();
  useChannelEvent();
  useGameEvent();

  if (error) {
    console.log(error);
    socket.disconnect();
    http.clearToken();
    window.location.href = process.env.REACT_APP_BASE_URL;
  }

  return <>{children}</>;
};

export default SocketHandler;
