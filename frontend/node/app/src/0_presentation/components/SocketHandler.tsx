import React, { useEffect } from "react";
import { selector, useRecoilValue } from "recoil";
import { useAsync } from "react-async";
import axios, { AxiosError } from "axios";

import Get from "@root/lib/di/get";
import ISocket from "@domain/socket/ISocket";
import useUserEvent from "@application/socket/useUserEvent";
import { IHttp } from "@domain/http/IHttp";
import { HttpRequest } from "@domain/http/HttpRequest";
import HttpToken from "@domain/http/HttpToken";
import useChannelEvent from "@application/socket/useChannelEvent";
import RecoilAtom from "@infrastructure/recoil/RecoilAtom";
import { Simulate } from "react-dom/test-utils";
import RecoilSelector from "@infrastructure/recoil/RecoilSelector";

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


  const me = useRecoilValue(RecoilSelector.user.me);

  useEffect(() => {
    socket.connect();
    console.log(socket);

    return () => {
      console.log("hello");
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
