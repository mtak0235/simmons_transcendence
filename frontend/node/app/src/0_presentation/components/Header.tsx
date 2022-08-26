import { Link, useMatch } from "react-router-dom";
import styled from "styled-components";

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
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

function Header() {
  const gameMatch = useMatch("game");
  const chatMatch = useMatch("chat");
  return (
    <Nav>
      <Col>
        <Logo>
          <Link to="/">트렌센더스</Link>
        </Logo>
        <Items>
          <Item style={{ fontWeight: gameMatch ? "600" : "100" }}>
            <Link to="/game">Game</Link>
          </Item>
          <Item style={{ fontWeight: chatMatch ? "600" : "100" }}>
            <Link to="/chat">Chat</Link>
          </Item>
        </Items>
      </Col>
      <Col></Col>
    </Nav>
  );
}

export default Header;
