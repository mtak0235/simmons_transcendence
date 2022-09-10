import IUserRepository from "../../2_domain/user/IUserRepository";
import User from "../../2_domain/user/user";
import axios from "axios";

class UserRepository implements IUserRepository {
  async getUserProfile(id: number): Promise<User> {
    return User.initial();
  }
  async login(): Promise<String> {
    await axios
      .get("/v0/auth/login")
      .then(() => {
        return "success";
      })
      .catch(() => {
        return "error";
      });
    return "done";
  }
}

export default UserRepository;
