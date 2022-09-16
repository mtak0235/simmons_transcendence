import Get from "@root/lib/di/get";
import { IHttp } from "@domain/http/IHttp";
import { useEffect } from "react";

const Login = () => {
  const conn: IHttp = Get.get("IHttp");
  useEffect(() => {
    console.log("hello");
  }, []);
  return (
    <div style={{ marginTop: "200px", textAlign: "center" }}>
      <a
        style={{
          display: "block",
          width: "115px",
          height: "25px",
          background: "#4E9CAF",
          textAlign: "center",
          borderRadius: "5px",
          color: "white",
          fontWeight: "bold",
          lineHeight: "25px",
        }}
        href={"http://localhost:3001/v0/auth/login"}
      >
        로그인
      </a>
      <button onClick={async () => await conn.firstAccess({})}>
        추가정보 입력
      </button>
    </div>
  );
};

export default Login;
