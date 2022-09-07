import { atom, RecoilState, useRecoilState, useRecoilValue } from "recoil";
// import { charCountState } from "@presentation/pages/Test2";
import Get from "@root/lib/di/get";
import IUserRepository from "@domain/user/IUserRepository";
import UserRepository, {
  textState1,
} from "@infrastructure/user/UserRepository";

const classState = (): RecoilState<UserRepository> => {
  return atom({
    key: "classState",
    default: new UserRepository(),
  });
};

const Test1 = () => {
  const repo: IUserRepository = Get.get("IUserRepository");

  // const [cls, setCls] = useRecoilState(classState());
  const [number, setNumber] = useRecoilState(textState1);
  // const count = useRecoilValue(repo.charCountState());

  const onIncrease = () => {
    setNumber(number + 1);
    console.log(number);
  };

  const onDecrease = () => {
    setNumber(number - 1);
  };

  // useEffect(() => {
  //   // Get.put("number", number);
  // }, [number]);

  return (
    <div>
      <h1>{number}</h1>
      <button onClick={onIncrease}>+</button>
      <button onClick={onDecrease}>-</button>
      {/*<h1>{count}</h1>*/}
    </div>
  );
};

export default Test1;
