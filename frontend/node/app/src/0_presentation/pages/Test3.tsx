import {
  RecoilValueReadOnly,
  selector,
  useRecoilState,
  useRecoilValue,
} from "recoil";
import Get from "@root/lib/di/get";
import IUserRepository from "@domain/user/IUserRepository";
import { useEffect, useState } from "react";
import { IHttp } from "@domain/http/IHttp";

const Test3 = () => {
  // const repo: IUserRepository = Get.get("IUserRepository");
  // const count = useRecoilValue(repo.charCountState());
  // const [number, setNumber] = useRecoilState(repo.textState());

  const [code, setCode] = useState("");
  const conn: IHttp = Get.get("IHttp");

  return (
    <div style={{ marginTop: "100px" }}>
      <div>
        <h1>Test3</h1>
        <a href={process.env.REACT_APP_API_URL + "/auth/login"}>로그인</a>
      </div>
      <div>
        <input
          onChange={(e) => {
            setCode(e.target.value);
          }}
          value={code}
          placeholder={"코드를 입력해 주세용"}
        />
        <button
          onClick={async () => {
            await conn.twoFactor(parseInt(code, 10));
            window.location.href = "/";
          }}
        >
          이메일 인증
        </button>
      </div>
    </div>
  );
};

export default Test3;
