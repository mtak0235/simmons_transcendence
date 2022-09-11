import { atom } from "recoil";
import { MODAL_TYPES } from "../GlobalModal";
import { UserInfoModalProps } from "./UserInfoModal";
import { RoomInfoModalProps } from "./RoomInfoModal";
import { RoomMakeModalProps } from "./RoomMakeModal";

export interface UserInfoModalType {
  modalType: typeof MODAL_TYPES.UserInfoModal;
  modalProps: UserInfoModalProps;
}

export interface RoomInfoModalType {
  modalType: typeof MODAL_TYPES.RoomInfoModal;
  modalProps: RoomInfoModalProps;
}
export interface RoomMakeModalType {
  modalType: typeof MODAL_TYPES.RoomMakeModal;
  modalProps: RoomMakeModalProps;
}

export type ModalType =
  | UserInfoModalType
  | RoomInfoModalType
  | RoomMakeModalType;

export const modalState = atom<ModalType | null>({
  key: "modalState",
  default: null,
});
