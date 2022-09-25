import {
  Button,
  Dialog,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import styled from "styled-components";
import useModal from "./hooks";
import { useState } from "react";
import ISocketEmit from "@domain/socket/ISocketEmit";
import Get from "@root/lib/di/get";
import SocketDto from "SocketDto";

export interface RoomMakeModalProps {
  message: string;
  confirmText?: string;
  cancelText?: string;
  handleClose?: (...arg: any[]) => any;
  handleConfirm?: (...arg: any[]) => any;
}

const Wrapper = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: stretch;
  flex-direction: column;
  height: 400px;
  padding: 50px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-around;
`;

const TSTextField = styled(TextField)`
  width: 100%;
`;

const TSButton = styled(Button)`
  width: 30%;
`;

const RoomMakeModal = ({
  message,
  confirmText = "생성",
  cancelText = "취소",
  handleClose,
  handleConfirm,
}: RoomMakeModalProps) => {
  const { hideModal } = useModal();

  const socketEmit: ISocketEmit = Get.get("ISocketEmit");

  const [channelName, setChannelName] = useState("");
  const [accessLayer, setAccessLayer] = useState("public");
  const [password, setPassword] = useState("");
  const [score, setScore] = useState(11);

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

    socketEmit.createChannel({
      ownerId: 11,
      channelName,
      accessLayer,
      password: accessLayer === "protected" ? password : undefined,
      score,
    });
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
        <TSTextField
          id="outlined-basic"
          label="방제목"
          variant="outlined"
          onChange={(e) => setChannelName(e.target.value)}
        />
        <FormControl>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            defaultValue="public"
            style={{ display: "flex", justifyContent: "space-around" }}
          >
            <FormControlLabel
              value="public"
              control={<Radio />}
              onClick={() => setAccessLayer("public")}
              label="Public"
            />
            <FormControlLabel
              value="private"
              control={<Radio />}
              onClick={() => setAccessLayer("private")}
              label="Private"
            />
            <FormControlLabel
              value="protected"
              control={<Radio />}
              onClick={() => setAccessLayer("protected")}
              label="Protected"
            />
          </RadioGroup>
        </FormControl>
        <TSTextField
          id="outlined-password-input"
          label="Password"
          type="password"
          autoComplete="current-password"
          hidden={accessLayer !== "protected"}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TSTextField
          id="outlined-number"
          label="Number"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          defaultValue={score}
          inputProps={{ min: "1", max: "11", step: "1" }}
          onChange={(e) => setScore(parseInt(e.target.value, 10))}
        />
        <Row>
          <TSButton variant="contained" onClick={onConfirm}>
            {confirmText}
          </TSButton>
          <TSButton variant="outlined" onClick={onClose}>
            {cancelText}
          </TSButton>
        </Row>
      </Wrapper>
    </Dialog>
  );
};

export default RoomMakeModal;
