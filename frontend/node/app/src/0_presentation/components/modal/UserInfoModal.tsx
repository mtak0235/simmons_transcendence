import { Avatar, Dialog, FormControlLabel, Switch } from "@mui/material";
import styled from "styled-components";
import User from "../../../2_domain/user/user";
import useModal from "./hooks";
import { userInfo } from "os";
import {useState} from "react";
import {Button} from "antd";

export interface UserInfoModalProps {
  message: string;
  confirmText?: string;
  userInfo?: User;
  handleClose?: (...arg: any[]) => any;
  handleConfirm?: (...arg: any[]) => any;
}

const Wrapper = styled.div`
  display: flex;
  justify-content: space-around;
  flex-flow: row wrap;
  align-items: stretch;
`;

const UserInfo = styled.div`
  display: flex;
  flex-grow: 3;
  background-color: lightgrey;
  height: calc(100vh - 300px);
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 40px;
`;

const UserInfoSetting = styled.div`
  display: flex;
  flex-grow: 1;
  max-width: 300px;
  background-color: yellow;
  height: calc(100vh - 300px);
  flex-direction: column;
  align-items: center;
  padding: 40px 0 0 0;
`;

const ExitButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  text-align: right;
  background-color: transparent;
  border: 0;
  padding: 10px;
  cursor: pointer;
`;



const WinningRate = styled.div`
  display: block;
  width: 300px;
  padding: 10px;
  background: aquamarine;
`
const WinningHistory = styled.div`
  display: block;
  width: 300px;
  padding: 10px;
  background: aquamarine;
`
function GameHistory({history, rate}) {
  return (
      <div>
        <WinningRate>승률
        <p>{rate["won"] + "/" + rate["total"]}</p></WinningRate>
        <WinningHistory>전적
          <ul>
            {history.map(opponent => <li>{opponent}에게 이김</li>)}
          </ul>
        </WinningHistory>
      </div>
  );
}

const Name = styled.div`
  font-size: x-large;
`
const UserInfoModal = ({
  message,
  confirmText = "Ok",
  userInfo,
  handleClose,
  handleConfirm,
}: UserInfoModalProps) => {
  const { hideModal } = useModal();

  const onClose = () => {
    if (handleClose) {
      handleClose();
    }
    hideModal();
  };

  const onConfirm = async () => {
    if (handleConfirm) {
      await handleConfirm();
    }
    hideModal();
  };
  //todo: following 여부 데이터 넣어줘야 함.
  const isFollowing = true;
  const [follow, setFollow] = useState(isFollowing);
  const handleFollow = event => {
    setFollow(target => !target);
    //todo: follow 로직
  }
  //todo: 프로필 조회자가 나인가?
  const isMe = false;
  //todo: 차단 버튼 보이는 조건
  const [block, setBlock] = useState(false);
  const handleBlock = event => {
    //todo:차단 로직
  }
  return (
    <Dialog
      open
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="sm"
      fullWidth
      sx={{ whiteSpace: "break-spaces" }}
    >
      <Wrapper>
        <UserInfo>
          <Avatar
            alt={userInfo.displayName}
            src={userInfo.imagePath}
            sx={{ width: 150, height: 150 }}
          />
          <Name>mtak</Name>
          <GameHistory history={["a", "b"]} rate={{"total":10, "won":3}}/>
          { !isMe && <Button onClick={handleFollow}>{follow ? "unfollow" : "follow"}</Button>}
          {!isMe && <Button onClick={handleBlock}>{block ? "unblock" : "block"}</Button>}
        </UserInfo>
        <UserInfoSetting>
          <ExitButton onClick={onConfirm}>X</ExitButton>
          <FormControlLabel
            control={
              <Switch
              // checked={userInfo.twoFactor}
              />
            }
            label="2단계 인증"
            labelPlacement="start"
          />
        </UserInfoSetting>
      </Wrapper>
    </Dialog>
  );
};

export default UserInfoModal;
