import Get from "@root/lib/di/get";
import { IHttp } from "@domain/http/IHttp";
import { useEffect, useState } from "react";
import { FormControlLabel, Switch, TextField } from "@mui/material";

const Sign = () => {
  const conn: IHttp = Get.get("IHttp");

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);

  const handleSign = async () => {
    await conn
      .firstAccess({
        displayName: displayName.length !== 0 ? displayName : undefined,
        email: email.length !== 0 ? email : undefined,
        twoFactor: twoFactor,
      })
      .catch(() => {
        alert("잘못된 요청입니다.");
      });

    window.location.href = "/";
  };

  return (
    <div style={{ marginTop: "200px", textAlign: "center", width: "100%" }}>
      <h1 style={{ marginBottom: "10px" }}>추가 정보 입력</h1>
      <div style={{ marginBottom: "10px" }}>
        <TextField
          size="small"
          id="outlined-basic"
          label="Display name"
          variant="outlined"
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <TextField
          size="small"
          id="outlined-basic"
          label="Email"
          variant="outlined"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <FormControlLabel
          value="start"
          control={<Switch color="primary" />}
          label="Two factor"
          labelPlacement="start"
          onClick={() => setTwoFactor(!twoFactor)}
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
