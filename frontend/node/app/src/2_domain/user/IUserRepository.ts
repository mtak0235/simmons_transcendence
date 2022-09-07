import User from "@domain/user/user";

interface IUserRepository {
  getUserProfile(userId: number): Promise<User>;
}

export default IUserRepository;
