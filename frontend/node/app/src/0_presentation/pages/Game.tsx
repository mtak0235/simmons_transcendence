import { Col, Layout, Radio, Row } from "antd";
import styled from "styled-components";
import useGameLogs from "../../1_application/game/useGame";

const { Sider } = Layout;

const StyledSider = styled(Sider)`
  height: 100vh;
  position: fixed;
  background: #f8f8ff;
  right: 0;
`;

const TSRow = styled(Row)`
  type: flex;
  align-items: center;
`;
const TSColumn = styled(Col)`
  height: 100vh;
  background: red;
`;

const MainSider = styled(Sider)`
  height: 100vh;
  position: fixed;
  background: white;
`;
const Box = styled.div`
  background-color: blue;
  height: 200px;
  width: 200px;
  font-size: 12px;
  cursor: pointer;
`;

function Game() {
  const gameLogs = useGameLogs();
  return (
    <Layout>
      <MainSider width={"70vw"}>
        <Row
          typeof="flex"
          style={{ alignItems: "center", height: "100vh" }}
          justify="center"
          gutter={10}
        >
          <Box>{gameLogs.playerA}</Box>
          <Row style={{ width: "20px" }}></Row>
          <Box>{gameLogs.playerB}</Box>
        </Row>
      </MainSider>
      <StyledSider width={"30vw"}>
        <TSRow>
          <Radio.Group size="large">
            <Radio.Button value="large" onClick={() => console.log("채팅")}>
              채팅
            </Radio.Button>
            <Radio.Button
              value="default"
              onClick={() => console.log("유저목록")}
            >
              유저목록
            </Radio.Button>
            <Radio.Button value="small" onClick={() => console.log("초대")}>
              초대
            </Radio.Button>
          </Radio.Group>
        </TSRow>
      </StyledSider>
    </Layout>
  );
}

export default Game;
