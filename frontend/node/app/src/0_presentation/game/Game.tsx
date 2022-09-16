import { Button, Col, Input, Layout, Radio, Row } from "antd";
import styled from "styled-components";
import useGameLogs from "../../1_application/game/useGame";

const { Sider } = Layout;

const StyledSider = styled(Sider)`
  display: flex;
  height: 100vh;
  background: #f8f8ff;
  // align-items: center;
`;

const TSRow = styled(Row)`
  justify-content: center;
  align-items: center;
`;

const TSColumn = styled(Col)``;

const SizedBox = styled.div`
  width: ${(props: { width: String }) => props.width};
  height: ${(props: { height: String }) => props.height};
`;

const MainSider = styled(Sider)`
  height: 100vh;
`;

const Box = styled.div`
  height: 200px;
  width: 200px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #f8f8ff;
`;

function Game() {
  const gameLogs = useGameLogs();

  return (
    <Layout>
      <MainSider width={"70vw"}>
        <TSRow>
          <TSColumn>
            <Row style={{ justifyContent: "right" }}>
              <Button
                type="primary"
                danger
                onClick={() => console.log("clicked")}
              >
                나가기
              </Button>
            </Row>
            <Row
              typeof="flex"
              style={{ alignItems: "center" }}
              justify="center"
            >
              <Box>
                <TSColumn>
                  <TSRow>Player 1</TSRow>
                  <TSRow>{gameLogs.playerA}</TSRow>
                  <SizedBox height="20px" />
                  <Button type="primary" onClick={() => console.log("clicked")}>
                    Ready
                  </Button>
                </TSColumn>
              </Box>
              <Box>
                <TSColumn>
                  <TSRow>Player 2</TSRow>
                  <TSRow>{gameLogs.playerB}</TSRow>
                  <SizedBox height="20px" />
                  <Button type="primary" onClick={() => console.log("clicked")}>
                    Ready
                  </Button>
                </TSColumn>
              </Box>
            </Row>
          </TSColumn>
        </TSRow>
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
        <TSRow>
          <Input.Group compact>
            <Input
              style={{ width: "calc(30vw - 100px)" }}
              placeholder="입력해주세요."
            />
            <Button type="primary" style={{ width: "100px" }}>
              Submit
            </Button>
          </Input.Group>
        </TSRow>
      </StyledSider>
    </Layout>
  );
}

export default Game;
