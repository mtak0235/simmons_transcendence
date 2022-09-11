import User from "./user";

interface IUserRepository {
  getUserProfile(id: number): Promise<User>;
  login(): Promise<String>;
}

export default IUserRepository;
