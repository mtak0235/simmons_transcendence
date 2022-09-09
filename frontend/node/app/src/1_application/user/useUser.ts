import { selectorFamily, useRecoilState, useRecoilValue } from "recoil";
import { userAtom } from "./userAtom";
import IUserRepository from "../../2_domain/user/IUserRepository";
import Get from "../../lib/di/get";
import { pagesSelector } from "../page/pageSelector";

export const useUser = () => {
  const [, setUser] = useRecoilState(userAtom);

  return {
    // changeRole: (role: string) => {
    //   setUser({ role: role });
    // },
  };
};

export const useLogin = () => {
  const repo = Get.get<IUserRepository>("IUserRepository");
  repo.login();
};
