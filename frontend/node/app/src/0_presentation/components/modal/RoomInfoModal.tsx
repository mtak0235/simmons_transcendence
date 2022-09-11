import { Button, Dialog, MenuItem, TextField } from "@mui/material";
import { useState } from "react";
import styled from "styled-components";
import useModal from "./hooks";

export interface RoomInfoModalProps {
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

const RoomInfoModal = ({
  message,
  confirmText = "생성",
  cancelText = "취소",
  handleClose,
  handleConfirm,
}: RoomInfoModalProps) => {
  const { hideModal } = useModal();
  const [values, setValues] = useState({
    input: "",
    select: "",
  });

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
        <TSTextField
          id="outlined-password-input"
          label="Password"
          type="password"
          autoComplete="current-password"
        />
        <TSTextField
          fullWidth
          select
          value={values.select}
          onChange={(e) =>
            setValues((state) => ({ ...state, select: e.target.value }))
          }
        >
          <MenuItem value="test">Test</MenuItem>
          <MenuItem value="test2">Test2</MenuItem>
          <MenuItem value="test3">Test3</MenuItem>
        </TSTextField>
        <Row>
          <TSButton variant="contained" onClick={() => console.log("방생성")}>
            {confirmText}
          </TSButton>
          <TSButton variant="outlined" onClick={() => console.log("취소")}>
            {cancelText}
          </TSButton>
        </Row>
      </Wrapper>
    </Dialog>
  );
};

export default RoomInfoModal;
