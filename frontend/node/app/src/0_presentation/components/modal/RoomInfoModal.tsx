import useModal from "./hooks";

export interface RoomInfoModalProps {
  message: string;
  confirmText?: string;
  handleClose?: (...arg: any[]) => any;
  handleConfirm?: (...arg: any[]) => any;
}

const RoomInfoModal = ({
  message,
  confirmText = "Ok",
  handleClose,
  handleConfirm,
}: RoomInfoModalProps) => {
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
    <></>
    // <Dialog
    //   open
    //   onClose={onClose}
    //   aria-labelledby="alert-dialog-title"
    //   aria-describedby="alert-dialog-description"
    //   maxWidth="sm"
    //   fullWidth
    //   sx={{ whiteSpace: "break-spaces" }}
    // >
    //   <DialogContent>
    //     <DialogContentText>{message}</DialogContentText>
    //   </DialogContent>
    //   <DialogActions>
    //     <Button onClick={onConfirm} color="primary" autoFocus>
    //       {confirmText}
    //     </Button>
    //   </DialogActions>
    // </Dialog>
  );
};

export default RoomInfoModal;
