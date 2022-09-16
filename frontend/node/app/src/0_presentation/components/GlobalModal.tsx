import { useRecoilState } from "recoil";
import { modalState } from "./modal/modal";
import RoomInfoModal from "./modal/RoomInfoModal";
import RoomMakeModal from "./modal/RoomMakeModal";
import UserInfoModal from "./modal/UserInfoModal";

export const MODAL_TYPES = {
  UserInfoModal: "UserInfoModal",
  RoomInfoModal: "RoomInfoModal",
  RoomMakeModal: "RoomMakeModal",
} as const;

const MODAL_COMPONENTS: any = {
  [MODAL_TYPES.UserInfoModal]: UserInfoModal,
  [MODAL_TYPES.RoomInfoModal]: RoomInfoModal,
  [MODAL_TYPES.RoomMakeModal]: RoomMakeModal,
};

const GlobalModal = () => {
  const { modalType, modalProps } = useRecoilState(modalState)[0] || {};

  const renderComponent = () => {
    if (!modalType) {
      return null;
    }
    const ModalComponent = MODAL_COMPONENTS[modalType];

    return <ModalComponent {...modalProps} />;
  };

  return <>{renderComponent()}</>;
};

export default GlobalModal;
