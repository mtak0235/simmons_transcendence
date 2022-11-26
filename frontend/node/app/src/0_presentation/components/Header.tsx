import { Link, useMatch } from "react-router-dom";
import styled from "styled-components";
import { useLogin } from "../../1_application/user/useUser";
import { useRecoilValue } from "recoil";
import { getLoginState } from "@presentation/components/LoginHandler";
import ISocket from "@domain/socket/ISocket";
import Get from "@root/lib/di/get";
import { IHttp } from "@domain/http/IHttp";
import RecoilSelector from "@infrastructure/recoil/RecoilSelector";
import useModal from "@presentation/components/modal/hooks";

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  height: 100px;
  width: 100%;
  top: 0;
  background-color: black;
  font-size: 14px;
  padding: 20px 60px;
  color: white;
`;

const Logo = styled.div`
  display: flex;
  margin-right: 50px;
  width: 95px;
  height: 25px;
  font-size: 20px;
  align-items: center;
  color: #00d89d;
  font-weight: bold;
`;

const Col = styled.div`
  display: flex;
  align-items: center;
`;

const Items = styled.ul`
  display: flex;
  align-items: center;
`;

const Item = styled.li`
  margin-right: 20px;
  color: ${(props: { theme: { white: { darker: any } } }) =>
    props.theme.white.darker};
  transition: color 0.3s ease-in-out;
  &:hover {
    color: ${(props: { theme: { white: { lighter: any } } }) =>
      props.theme.white.lighter};
  }
`;

const LoginButton = styled.button`
  color: black;
  width: 100px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
`;

function Header() {
  const isLoggedIn = useRecoilValue(getLoginState);
  const socket: ISocket<any, any> = Get.get("ISocket");
  const http: IHttp = Get.get("IHttp");
  const isAdmin = useRecoilValue(RecoilSelector.channel.isAdmin);
  const { showModal } = useModal();

  console.log(">>>>> " + isAdmin);

  const handleLogout = async () => {
    await http.logout();
    socket.reRender();
    socket.disconnect();
    window.location.href = "/";
  };

  return (
    <Nav>
      <Col>
        <Logo>
          <Link to="/">트렌센더스</Link>
        </Logo>
      </Col>
      <Col>
        {/*<LoginButton onClick={useLogin}>Login</LoginButton>*/}
        {isAdmin ? (
          <LoginButton
            onClick={() => {
              showModal({
                modalType: "RoomInfoModal",
                modalProps: {
                  message: "Success!",
                },
              });
            }}
          >
            방 설정
          </LoginButton>
        ) : (
          <></>
        )}
        <LoginButton>
          <Link to={"/test1"}>TEST</Link>
        </LoginButton>
        {isLoggedIn !== 1 ? (
          <a href={process.env.REACT_APP_API_URL + "/auth/login"}>
            <LoginButton>Login</LoginButton>
          </a>
        ) : (
          <LoginButton onClick={handleLogout}>Logout</LoginButton>
        )}
      </Col>
    </Nav>
  );
}

export default Header;
