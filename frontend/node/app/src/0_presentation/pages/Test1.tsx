import {
  atom,
  RecoilState,
  selector,
  useRecoilState,
  useRecoilValue,
} from "recoil";
// import { charCountState } from "@presentation/pages/Test2";
import Get from "@root/lib/di/get";
import IUserRepository from "@domain/user/IUserRepository";
import UserRepository from "@infrastructure/user/UserRepository";
import { useState } from "react";
import { IHttp } from "@domain/http/IHttp";
import { Cookies } from "react-cookie";
import { HttpRequest } from "@domain/http/HttpRequest";
import { loginState } from "@presentation/components/LoginHandler";
import { setError } from "@presentation/components/ErrorHandler";
import ISocket from "@domain/socket/ISocket";

const cookies = new Cookies();

const classState = (): RecoilState<UserRepository> => {
  return atom({
    key: "classState",
    default: new UserRepository(),
  });
};

interface testRecoilInterface {
  a: number;
  b: string;
}

const testRecoilAtom = atom<testRecoilInterface[]>({
  key: "testRecoilAtom",
  default: [],
});

const testRecoilSelector = selector({
  key: "testRecoilSelector",
  get: ({ get }) => get(testRecoilAtom),
  // set: ({ set }, value) => set(testRecoilAtom, value),
});

const textState = atom<number>({
  key: "textState",
  default: 0,
});

const Test1 = () => {
  const repo: IUserRepository = Get.get("IUserRepository");

  // const [cls, setCls] = useRecoilState(classState());
  const [code, setCode] = useState("");
  const [number, setNumber] = useRecoilState(textState);
  const [number1, setNumber1] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useRecoilState(loginState);
  const [errorState, setErrorState] = useRecoilState(setError);
  const [testRecoil, setTestRecoil] = useRecoilState(testRecoilAtom);
  // const []
  const [num, setNum] = useState(0);
  const conn: IHttp = Get.get("IHttp");
  const socket: ISocket<any, any> = Get.get("ISocket");

  // const count = useRecoilValue(repo.charCountState());

  const onIncrease = () => {
    setNumber(number + 1);
    console.log(number);
  };

  const onDecrease = () => {
    setNumber(number - 1);
  };

  const test = () => {
    localStorage.setItem("accessToken", "hello");
  };

  const test1 = async () => {
    const data = await conn.getUserProfile(85274);
    console.log(data);
  };

  const test2 = async () => {
    await conn.refreshToken();
    // console.log(cookies.get("access_token"));
    // console.log(cookies.get("refresh_token"));
  };

  const test3 = () => {
    console.log("dd", testRecoil);
    setNumber1(number1 + 1);
    const arg: testRecoilInterface = {
      a: number1,
      b: "2",
    };
    setTestRecoil((prev) => [...prev, arg]);
    console.log(testRecoil);
  };

  // useEffect(() => {
  //   // Get.put("number", number);
  // }, [number]);

  return (
    <>
      <div>
        <h1>{number}</h1>
        <button onClick={onIncrease}>+</button>
        <button onClick={onDecrease}>-</button>
        <button onClick={test}>테스트</button>
        <button onClick={test1}>테스트2</button>

        {/*<h1>{count}</h1>*/}
      </div>
      <div>
        <a href={"http://localhost:3001/v0/auth/login"}>로그인</a>
        <button
          onClick={async () => {
            setIsLoggedIn(0);
            await conn.logout();
            window.location.href = "/";
          }}
        >
          로그아웃
        </button>
        <button onClick={async () => await conn.firstAccess("dd")}>
          추가정보 입력
        </button>
        <button onClick={test2}>토큰재발급</button>
      </div>
      <div>
        <button onClick={test3}>소켓 연결</button>
      </div>
    </>
  );
};

export default Test1;
