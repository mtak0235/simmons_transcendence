import { useRecoilState, useRecoilValue } from "recoil";
import Get from "@root/lib/di/get";
import IUserRepository from "@domain/user/IUserRepository";

const Test2 = () => {
  const repo: IUserRepository = Get.get("IUserRepository");
  const count = useRecoilValue(repo.charCountState());
  // const [number, setNumber] = useRecoilState(repo.textState());
  return (
    <div>
      <h1>Test2</h1>
      <h1>{count}</h1>
    </div>
  );
};

export default Test2;
