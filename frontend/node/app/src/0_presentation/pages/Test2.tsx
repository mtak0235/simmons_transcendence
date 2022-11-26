import { useRecoilValue } from "recoil";
import RecoilSelector from "@infrastructure/recoil/RecoilSelector";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Test2 = () => {
  const navigate = useNavigate();
  const channelPublic = useRecoilValue(RecoilSelector.channel.public);
  const channelPrivate = useRecoilValue(RecoilSelector.channel.private);

  useEffect(() => {
    console.log(channelPublic);
    console.log(channelPrivate);
  }, []);

  return (
    <>
      <h1>Hello World!!</h1>
    </>
  );
};

export default Test2;
