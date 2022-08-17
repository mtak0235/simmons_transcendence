import styled from "styled-components"

const Col = styled.div`
    display: flex
`

const GameRow = styled.div`
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

const Game: React.FunctionComponent = () => (
	<>
	<Col>
			<GameRow>
				<Box></Box>
				<Box></Box>
				<Box></Box>
				<Box></Box>
				<Box></Box>
				<Box></Box>
				<Box></Box>
			</GameRow>
	</Col>
    <SideBar></SideBar>
  </>
);

export default Game;
