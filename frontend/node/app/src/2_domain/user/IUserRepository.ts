import User from "./user";

interface IUserRepository {
  getUserProfile(id: number): Promise<User>;
  login(): String;
}

export default IUserRepository;
