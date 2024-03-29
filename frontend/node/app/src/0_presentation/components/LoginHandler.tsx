import React, { useEffect, useState } from "react";
import {
  atom,
  RecoilState,
  RecoilValueReadOnly,
  selector,
  useRecoilState,
} from "recoil";
import queryString from "query-string";
import Get from "@root/lib/di/get";
import { IAuthRepository } from "@domain/auth/IAuthRepository";
import Test3 from "@presentation/pages/Test3";
import { recoilPersist } from "recoil-persist";
import { IHttp } from "@domain/http/IHttp";
import Login from "@presentation/auth/Login";
import ISocket from "@domain/socket/ISocket";
import Sign from "@presentation/auth/Sign";
import Code from "@presentation/auth/Code";
import { useNavigate } from "react-router-dom";
import { v1 } from "uuid";

interface LoginHandlerProps {
  children: React.ReactNode;
}

export const loginState: RecoilState<number> = atom<number>({
  key: `loginState/${v1()}`,
  default: 0,
  effects_UNSTABLE: [recoilPersist().persistAtom],
});

export const getLoginState: RecoilValueReadOnly<number> = selector({
  key: `loginState1/${v1()}`,
  get: ({ get }) => get(loginState),
});

// charCountState(): RecoilValueReadOnly<number> {
//   return selector({
//     key: "textState111",
//     get: ({ get }) => {
//       return get(this.textState());
//
//       // return text;
//     },
//   });
// }

const LoginHandler = ({ children }: LoginHandlerProps) => {
  const [isLoggedIn, setIsLoggedIn] = useRecoilState(loginState);
  const [socketConn, setSocketConn] = useState(null);
  const http: IHttp = Get.get("IHttp");
  const navigator = useNavigate();

  useEffect(() => {
    const token = queryString.parse(window.location.search);
    if (Object.keys(token).length) {
      for (const key in token) localStorage.setItem(key, String(token[key]));
      window.location.href = "http://localhost:3000";
    }
    // async function checkToken() {
    //   await conn.checkToken().then((flag) => {
    //     if (flag) {
    //       setIsLoggedIn(1);
    //       // socket.connect();
    //     } else {
    //       setIsLoggedIn(2);
    //     }
    //   });
    // }
    // checkToken().then();

    // http.checkToken().then((value) => {
    //   if (!value) http.clearToken();
    //   navigator("");
    //   console.log(value);
    // }); // todo: 필요한 로직인지 생각해 봐야함
  }, []);

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      setIsLoggedIn(1);
    } else if (localStorage.getItem("sign")) {
      setIsLoggedIn(2);
    } else if (localStorage.getItem("code")) {
      setIsLoggedIn(3);
    } else {
      setIsLoggedIn(4);
    }
    console.log(isLoggedIn);
  }, [window.location.href]);

  return isLoggedIn === 0 ? (
    <h1>로딩중</h1>
  ) : isLoggedIn === 1 ? (
    <>{children}</>
  ) : isLoggedIn === 2 ? (
    <>{<Sign />}</>
  ) : isLoggedIn === 3 ? (
    <>{<Code />}</>
  ) : (
    <Login />
  );
};

export default LoginHandler;
