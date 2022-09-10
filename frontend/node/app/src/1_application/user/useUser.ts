import { selectorFamily, useRecoilValue } from "recoil";
import IUserRepository from "../../2_domain/user/IUserRepository";
import User from "../../2_domain/user/user";
import Get from "../../lib/di/get";

interface UserInfoSelectorParamInterface {
  repo: IUserRepository;
}

interface UserInfoSelectorParams extends UserInfoSelectorParamInterface {
  [key: string]: any;
}

export const userInfoSelector = selectorFamily<User, UserInfoSelectorParams>({
  key: "UserInfoSelectorKey",
  get: (param) => async () => {
    const userInfo = await param.repo.getUserProfile(0);
    return userInfo;
  },
});

export const useUserInfo = () => {
  const repo = Get.get<IUserRepository>("IUserRepository");
  const userInfo = useRecoilValue(userInfoSelector({ repo: repo }));
  return userInfo;
};

export const useLogin = async () => {
  const repo = Get.get<IUserRepository>("IUserRepository");
  await repo.login();
};
