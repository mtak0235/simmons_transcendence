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
        <p>{rate["won"] + " / " + rate["total"]}</p></WinningRate>
        <WinningHistory>전적
          <ul>
            {history.map(opponent => (<li>{opponent.opponent}에게 {opponent.score.master} : {opponent.score.opponent}로 {
              opponent.score.master > opponent.score.opponent? "이김" : "짐"}</li>))}
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
  
  //todo: 리코일 follows[]에 profile master Id 있으면 false,아니면 true
  const isFollowing = true;
  const [follow, setFollow] = useState(isFollowing);
  const handleFollow = event => {
    setFollow(target => !target);
    //todo: 서버에 follow 요청.
  }
  //todo: 리코일에서 나의 id와 프로필 주인의 id가 같으면 true 아니면 false
  const isMe = false;
  //todo: 리코일 blocks[]에 해당 프로필 주인의 id가 있으면 true, 없으면 false
  const blockCondition = false;
  const [block, setBlock] = useState(blockCondition);
  const handleBlock = event => {
    //todo: 서버에 block 요청.
  }
  //todo:해당 프로필 주인의 이름 리코일에서 가져오기, 주인의 최근 경기 기록 5개 그리고 전체 승률 서버에서 가져오기
  const username = "mtak";
  const history = {"recentLog":[{"username": "seonkim", "score": {"master": 3, "opponenet": 2}}, {"username":"taeskim", "score": {"master":6, "opponent":3 }}], rate:{"total": 10, "won": 3}};
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
          <Name>{username}</Name>
          <GameHistory history={history["recentLog"]} rate={history["rate"]}/>
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
