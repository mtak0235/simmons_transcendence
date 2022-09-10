import IUserRepository from "../../2_domain/user/IUserRepository";
import User from "../../2_domain/user/user";
import axios from "axios";

class UserRepository implements IUserRepository {
  getUserProfile(id: number): Promise<User> {
    throw new Error("Method not implemented.");
  }
  login(): String {
    axios
      .get("/v0/auth/login")
      .then((response) => {
        return "response";
      })
      .catch((error) => {
        return "error";
      });
    return "done";
  }
}

export default UserRepository;
