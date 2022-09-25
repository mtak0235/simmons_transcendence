import Get from "@root/lib/di/get";
import { IHttp } from "@domain/http/IHttp";
import { useEffect, useState } from "react";
import { FormControlLabel, Switch, TextField } from "@mui/material";

const Sign = () => {
  const conn: IHttp = Get.get("IHttp");

  const [code, setCode] = useState("");

  const handleSign = async () => {
    await conn.twoFactor(parseInt(code, 10)).catch(() => {
      alert("잘못된 요청입니다.");
    });

    window.location.href = "/";
  };

  return (
    <div style={{ marginTop: "200px", textAlign: "center", width: "100%" }}>
      <h1 style={{ marginBottom: "10px" }}>이메일 인증</h1>
      <div style={{ marginBottom: "10px" }}>
        <TextField
          size="small"
          id="outlined-basic"
          label="Code"
          variant="outlined"
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <button
        style={{
          width: "115px",
          height: "25px",
          background: "#4E9CAF",
          textAlign: "center",
          borderRadius: "5px",
          color: "white",
          fontWeight: "bold",
        }}
        onClick={handleSign}
      >
        제출
      </button>
    </div>
  );
};

export default Sign;
