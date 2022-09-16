import React, { useEffect, useState } from "react";
import {
  atom,
  RecoilState,
  RecoilValueReadOnly,
  selector,
  useRecoilState,
} from "recoil";
import { Cookies } from "react-cookie";
import Get from "@root/lib/di/get";
import { IAuthRepository } from "@domain/auth/IAuthRepository";
import Test3 from "@presentation/pages/Test3";
import { recoilPersist } from "recoil-persist";
import { IHttp } from "@domain/http/IHttp";
import Login from "@presentation/pages/Login";
import ISocket from "@domain/socket/ISocket";

interface LoginHandlerProps {
  children: React.ReactNode;
}

const cookies = new Cookies();

export const loginState: RecoilState<number> = atom<number>({
  key: "loginState",
  default: 0,
  // effects_UNSTABLE: [recoilPersist().persistAtom],
});

export const getLoginState: RecoilValueReadOnly<number> = selector({
  key: "loginState1",
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
  const conn: IHttp = Get.get("IHttp");
  const socket: ISocket<any, any> = Get.get("ISocket");

  useEffect(() => {
    async function checkToken() {
      await conn.checkToken().then((flag) => {
        if (flag) {
          setIsLoggedIn(1);
          // socket.connect();
        } else {
          setIsLoggedIn(2);
        }
      });
    }
    checkToken().then();
  }, []);

  useEffect(() => {
    if (cookies.get("access_token") !== undefined) {
      setIsLoggedIn(1);
    } else {
      setIsLoggedIn(0);
    }
  }, [window.location.href]);

  return isLoggedIn === 0 ? (
    <h1>로딩중</h1>
  ) : isLoggedIn === 1 ? (
    <>{children}</>
  ) : (
    <Login />
  );
};

export default LoginHandler;
