import User from "@domain/user/user";
import { RecoilState, RecoilValueReadOnly } from "recoil";

interface IUserRepository {
  getUserProfile(userId: number): Promise<User>;
  textState(): RecoilState<number>;
  charCountState(): RecoilValueReadOnly<number>;
  test(): void;
}

export default IUserRepository;
