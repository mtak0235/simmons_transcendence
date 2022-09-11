import { selectorFamily, useRecoilState, useRecoilValue } from "recoil";
import { userAtom } from "./userAtom";
import IUserRepository from "../../2_domain/user/IUserRepository";
import Get from "../../lib/di/get";
import { pagesSelector } from "../page/pageSelector";
import axios from "axios";

export const useUser = () => {
  const [, setUser] = useRecoilState(userAtom);

  return {
    // changeRole: (role: string) => {
    //   setUser({ role: role });
    // },
  };
};

const login = () => {
  axios
    .get("/v0/auth/login")
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch((error) => {
      return "error";
    });
  return "done";
};

export const useLogin = () => {
  const repo = Get.get<IUserRepository>("IUserRepository");
  // repo.login();
  login();
};
