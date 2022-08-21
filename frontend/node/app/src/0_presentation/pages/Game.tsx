import styled from "styled-components"
import { NavLink } from "react-router-dom";
import useDashboard from "../../1_application/dashboard/useDashboard";

const Row = styled.div`
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(6, 1fr);
  position: absolute;
  width: 100%;
`;

const Box = styled.div`
  background-color: red;
  height: 200px;
  font-size: 66px;
  cursor: pointer;
`;

const SideBar = styled.div`
  background: #9aaab7;
  grid-area: sidebar;
  padding: 0.25rem;
`;

const Game: React.FC = () => {
  const dashboard = useDashboard();

  const games = dashboard.map((g) => (
    <NavLink to={"/"}>
      <Box>
        {g}
      </Box>
    </NavLink>
  ))
  return <>
  <Row>
    {games} 
  </Row>
  </>;
};

export default Game;
