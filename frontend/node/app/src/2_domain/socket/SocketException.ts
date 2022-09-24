const SocketExceptionMessage = {
  "400": {
    SocketBodyCheckInterceptor: "잘못된 입력입니다.",
    modifyChannel: "비밀번호를 입력해 주세요.",
    setAdmin: "존재하지 않는 사용자 입니다.",
    kickOutUser: "존재하지 않는 사용자 입니다.",
    muteUser: "존재하지 않는 사용자 입니다.",
    unfollowUser: "존재하지 않는 사용자 입니다.",
  },
  "401": "로그인 정보가 만료 되었습니다.",
  "403": {
    ChannelAuthInterceptor: "권한없는 요청입니다.",
    ChannelMessageInterceptor: "채팅 금지 상태입니다.",
    inChannel: "방에 입장할 권한이 없습니다.",
    sendDirectMessage: "해당 사용자에게 차단되어 메세지를 보낼수 없습니다.",
  },
  "404": {
    inChannel: "방이 존재하지 않습니다.",
  },
  "500": "서버가 이상해요. 잠시만 기다려주세요.",
};

export default SocketExceptionMessage;
