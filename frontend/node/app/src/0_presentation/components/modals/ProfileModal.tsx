import { Modal } from "antd";

export interface ProfileModalProps {
  title?: string;
  handleClose?: (...arg: any[]) => any;
}

const ProfileModal = ({ title, handleClose }: ProfileModalProps) => {
  const [modal, contextHolder] = Modal.useModal();
};

export default ProfileModal;

// const ProfileModal = ({
//   title,
//   message,
//   cancelText = "취소",
//   confirmText = "확인",
//   handleClose,
//   handleConfirm,
// }: ProfileModalProps) => {
//   const { hideModal } = useModal();

//   const onClose = () => {
//     if (handleClose) {
//       handleClose();
//     }
//     hideModal();
//   };

//   const onConfirm = async () => {
//     if (handleConfirm) {
//       await handleConfirm();
//     }
//     hideModal();
//   };

//   return (
//     <Dialog
//       open
//       onClose={onClose}
//       aria-labelledby="alert-dialog-title"
//       aria-describedby="alert-dialog-description"
//       maxWidth="sm"
//       fullWidth
//       sx={{ whiteSpace: "break-spaces" }}
//     >
//       <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
//       <DialogContent>
//         <DialogContentText>{message}</DialogContentText>
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose}>{cancelText}</Button>
//         <Button onClick={onConfirm} color="primary" autoFocus>
//           {confirmText}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default ProfileModal;
