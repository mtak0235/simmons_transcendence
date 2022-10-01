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
import React, { useEffect, useState } from "react";
import { IHttp } from "@domain/http/IHttp";
import { HttpRequest } from "@domain/http/HttpRequest";
import { loginState } from "@presentation/components/LoginHandler";
import ISocket from "@domain/socket/ISocket";
import RecoilAtom from "@infrastructure/recoil/RecoilAtom";
import RecoilSelector, {
  selectorUsers,
} from "@infrastructure/recoil/RecoilSelector";
import SocketDto from "SocketDto";
import { Socket } from "socket.io-client";
import { getRecoil } from "recoil-nexus";
import {
  recoilSelectUsers,
  recoilUsers,
} from "@presentation/components/SocketHandler";
import { Button, Input } from "@mui/material";
import axios from "axios";

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

const Test1 = () => {
  const repo: IUserRepository = Get.get("IUserRepository");
  const conn: IHttp = Get.get("IHttp");
  const socket: Socket = Get.get("ISocket");

  // const [users, setUsers] = useRecoilState(RecoilAtom.user.users);
  const users1 = useRecoilValue(RecoilSelector.user.users);
  const me = useRecoilValue(RecoilSelector.user.me);
  const [isLoggedIn, setIsLoggedIn] = useRecoilState(loginState);
  const fileInput = React.useRef(null);

  useEffect(() => {
    console.log(me);
  }, [me]);
  useEffect(() => {
    console.log(users1);
  }, [users1]);
  // useEffect(() => {
  //   socket.on("broad:user:changeStatus", (data: SocketDto.UserInfo) => {
  //     console.log(data);
  //     if (me.userId === data.userId) {
  //       setMe((curr) => {
  //         curr.status = data.status;
  //         return curr;
  //       });
  //     } else {
  //       setUsers((curr) => {
  //         if (curr.findIndex((user) => user.userId === data.userId) === -1) {
  //           curr.push(data);
  //         } else {
  //           curr.map((user, idx) => {
  //             if (user.userId === data.userId) {
  //               if (data.status === "offline") curr.splice(idx, 1);
  //               else user.status = data.status;
  //             }
  //           });
  //         }
  //         return curr;
  //       });
  //     }
  //   });
  // }, [users]);

  // const count = useRecoilValue(repo.charCountState());

  // useEffect(() => {
  //   console.log(getRecoil(recoilUsers));
  // }, getRecoil(recoilUsers));
  const test = () => {
    localStorage.setItem("accessToken", "hello");
  };

  const test1 = async () => {
    const data = await conn.getUserProfile(85274);
    console.log(data);
  };

  const test2 = async () => {
    await conn.refreshToken();
    console.log(localStorage.getItem("accessToken"));
    console.log(localStorage.getItem("refreshToken"));
  };

  const test5 = () => {
    socket.emit("test1");
  };

  const test6 = () => {
    // console.log(getRecoil(recoilUsers));
    // console.log(users);
    console.log(users1);
  };

  const test7 = () => {
    console.log(getRecoil(RecoilAtom.user.me));
  };

  const test8 = () => {
    socket.emit("blockUser", { userId: 80479 });
  };

  const test9 = () => {
    socket.emit("createChannel", {
      channel: {
        ownerId: 85274,
        channelName: "테스트 겜",
        accessLayer: "public",
        score: 11,
      },
    });
  };

  const test10 = () => {
    socket.emit("followUser", {
      userId: 85166,
    });
  };

  const test11 = async (e) => {
    console.log(e.target.files[0]);
    const file = e.target.files[0];

    const frm = new FormData();
    frm.append("image", file);

    const accessToken = localStorage.getItem("accessToken");
    await axios
      .put(process.env.REACT_APP_API_URL + "/user/image", frm, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => console.log(response))
      .catch((err) => console.log(err));
  };

  return (
    <>
      <div>
        <button onClick={test}>테스트</button>
        <button onClick={test1}>테스트2</button>

        {/*<h1>{count}</h1>*/}
      </div>
      <div>
        {/*<a href={process.env.REACT_APP_API_URL + "/auth/login"}>로그인</a>*/}
        <button>
          <a href={process.env.REACT_APP_API_URL + "/auth/login"}>로그인</a>
        </button>
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
        <button onClick={test5}>소켓 테스트</button>
        <button onClick={test6}>유저 콘솔 찍기</button>
        <button onClick={test7}>내정보 찍기</button>
        <button onClick={test8}>사용자 차단</button>
      </div>
      <div>
        <button onClick={test9}>방 생성</button>
        <button onClick={test10}>친구 추가</button>
        {/*<React.Fragment>*/}
        {/*<Button onClick={test11}>이미지 업로드</Button>*/}
        <Input type="file" onChange={test11} />
        {/*</React.Fragment>*/}
      </div>
    </>
  );
};

export default Test1;
