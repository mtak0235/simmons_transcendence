import styled from "styled-components"
import { NavLink } from "react-router-dom";
import useDashboard from "../../1_application/dashboard/useDashboard";
import MainLayoutComponent from "../components/layouts/Main";

const Row = styled.div`
  display: grid;
  gap: 10px;
  grid-template-Columns: repeat(6, 1fr);
  position: absolute;
  width: 100%;
  background: blue;
`;

const Column = styled.div`

`;

const Box = styled.div`
  background-color: red;
  height: 200px;
  font-size: 66px;
  cursor: pointer;
`;

const Main: React.FC = () => {
  const dashboard = useDashboard();

  const games = dashboard.map((game) => (
    <NavLink to={"/"}>
      <Box>
        {game}
      </Box>
    </NavLink>
  ))
  return <>
  {/* <Row> */}
    <MainLayoutComponent></MainLayoutComponent>
    {/* <Column>
    {games} 
    </Column> */}
  {/* </Row> */}
  </>;
};

export default Main;
