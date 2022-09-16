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
        <TSTextField id="outlined-basic" label="방제목" variant="outlined" />
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
              label="Public"
            />
            <FormControlLabel
              value="private"
              control={<Radio />}
              label="Private"
            />
            <FormControlLabel
              value="protected"
              control={<Radio />}
              label="Protected"
            />
          </RadioGroup>
        </FormControl>
        <TSTextField
          id="outlined-password-input"
          label="Password"
          type="password"
          autoComplete="current-password"
        />
        <TSTextField
          id="outlined-number"
          label="Number"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          defaultValue="11"
          inputProps={{ min: "1", max: "11", step: "1" }}
        />
        <Row>
          <TSButton variant="contained" onClick={() => console.log("방생성")}>
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
