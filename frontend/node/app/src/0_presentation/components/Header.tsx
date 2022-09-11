import { Link, useMatch } from "react-router-dom";
import styled from "styled-components";
import { useLogin } from "../../1_application/user/useUser";

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
  const chatMatch = useMatch("chat");
  return (
    <Nav>
      <Col>
        <Logo>
          <Link to="/">트렌센더스</Link>
        </Logo>
        <Items>
          <Item style={{ fontWeight: chatMatch ? "600" : "100" }}>
            <Link to="/chat">Chat</Link>
          </Item>
        </Items>
      </Col>
      <Col>

        {/*<LoginButton onClick={useLogin}>Login</LoginButton>*/}
        <LoginButton>
          <a href={"http://52.79.220.250:3001/v0/auth/login"}>Login</a>
        </LoginButton>
      </Col>
    </Nav>
  );
}

export default Header;