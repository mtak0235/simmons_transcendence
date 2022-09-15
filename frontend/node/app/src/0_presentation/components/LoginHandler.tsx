import React, { useEffect, useState } from "react";
import { atom, useRecoilState } from "recoil";
import { Cookies } from "react-cookie";
import Get from "@root/lib/di/get";
import { IAuthRepository } from "@domain/auth/IAuthRepository";
import Test3 from "@presentation/pages/Test3";

interface LoginCheckerProps {
  children: React.ReactNode;
}
//
// const loginState = atom<boolean>({
//   key: `loginState`,
//   default: false,
// });
//
// const cookies = new Cookies();

const LoginChecker = ({ children }: LoginCheckerProps) => {
  // const authRepo: IAuthRepository = Get.get("IAuthRepository");
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  // const;

  useEffect(() => {
    console.log();
  }, []);

  return isLoggedIn ? <>{children}</> : <Test3 />;
};

export default LoginChecker;
