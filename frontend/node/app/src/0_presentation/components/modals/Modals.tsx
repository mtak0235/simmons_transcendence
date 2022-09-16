import { atom } from "recoil";
import { MODAL_TYPES } from "./GlobalModal";
import { ProfileModalProps } from "./ProfileModal";

export interface ProfileModalType {
  modalType: typeof MODAL_TYPES.AlertModal;
  modalProps: ProfileModalProps;
}

export type ModalType = ProfileModalType;

export const modalState = atom<ModalType | null>({
  key: "modalState",
  default: null,
});
