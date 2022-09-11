import { selectorFamily, useRecoilValue } from "recoil";
import IUserRepository from "../../2_domain/user/IUserRepository";
import User from "../../2_domain/user/user";
import Get from "../../lib/di/get";

interface UserInfoSelectorParamInterface {
  id: number;
  repo: IUserRepository;
}

interface UserInfoSelectorParams extends UserInfoSelectorParamInterface {
  [key: string]: any;
}

export const userInfoSelector = selectorFamily<User, UserInfoSelectorParams>({
  key: "UserInfoSelectorKey",
  get: (param) => async () => {
    const userInfo = await param.repo.getUserProfile(param.id);
    return userInfo;
  },
});

const repo = () => Get.get<IUserRepository>("IUserRepository");

// Methods
export const useUserInfo = (id: number) =>
  useRecoilValue(userInfoSelector({ id: id, repo: repo() }));

export const useLogin = async () => await repo().login();

class UserController {}
export default UserController;
