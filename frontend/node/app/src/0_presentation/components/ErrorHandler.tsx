import React, { useEffect, useState } from "react";
import { atom, selector, useRecoilState } from "recoil";
import { recoilPersist } from "recoil-persist";
import { CustomError } from "@infrastructure/core/DependencyInject";
import Get from "@root/lib/di/get";
import Header from "@presentation/components/Header";

interface ErrorHandlerProps {
  children: React.ReactNode;
}

interface ErrorState {
  type: string;
  status: number;
}

export const setError = atom<ErrorState>({
  key: "errorState",
  default: {
    type: "",
    status: 0,
  },
  effects_UNSTABLE: [recoilPersist().persistAtom],
});

// export const getError = selector({
//   key: "errorState",
//   get: ({ get }) => get(setError),
// });

const ErrorHandler = ({ children }: ErrorHandlerProps) => {
  // const [errorState, setErrorState] = useRecoilState(setError);
  const err: CustomError = Get.get("CustomError");
  const [customError, setCustomError] = useState(err);
  // const [errorState, setErrorState] = useState(localStorage.getItem("error"));

  useEffect(() => {
    // setErrorState({ type: "http", status: 401 });
  }, []);

  useEffect(() => {
    console.log(customError);
    // localStorage.removeItem("error");
  }, [customError.status]);
  return (
    <>
      <Header />
      {children}
    </>
  );
};

export default ErrorHandler;
