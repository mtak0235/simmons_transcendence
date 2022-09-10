import { Avatar, Dialog, FormControlLabel, Switch } from "@mui/material";
import styled from "styled-components";
import User from "../../../2_domain/user/user";
import useModal from "./hooks";

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
  background-color: blue;
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

const InfoRow = styled.div`
  display: flex;
`;

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
          <InfoRow>asdfa</InfoRow>
        </UserInfo>
        <UserInfoSetting>
          <ExitButton onClick={onConfirm}>X</ExitButton>
          <FormControlLabel
            control={<Switch />}
            label="2단계 인증"
            labelPlacement="start"
            onChange={(event) => console.log("checked!")}
          />
        </UserInfoSetting>
      </Wrapper>
    </Dialog>
  );
};

export default UserInfoModal;
