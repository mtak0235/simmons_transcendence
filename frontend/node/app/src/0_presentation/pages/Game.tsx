import { Card, Col, Divider, Layout, Radio, Row } from "antd";
import Column from "antd/lib/table/Column";
import styled from "styled-components";
const { Sider } = Layout;

const StyledSider = styled(Sider)`
  height: 100vh;
  position: fixed;
  background: #f8f8ff;
  right: 0;
`;

const TSRow = styled(Row)`
  justify-content: center;
`;
const TSColumn = styled(Column)`
  justify-content: center;
`;

const MainSider = styled(Sider)`
  height: 100vh;
  position: fixed;
  background: white;
`;
const Box = styled.div`
  background-color: red;
  height: 200px;
  width: 200px;
  font-size: 66px;
  cursor: pointer;
`;

const DemoBox: React.FC<{ children: React.ReactNode; value: number }> = (
  props
) => <p className={`height-${props.value}`}>{props.children}</p>;

function Game() {
  return (
    <Layout>
      <MainSider width={"70vw"}>
        <Divider orientation="left">Align Middle</Divider>
        <Row justify="space-around" align="middle">
          <Col span={4}>
            <DemoBox value={100}>col-4</DemoBox>
          </Col>
          <Col span={4}>
            <DemoBox value={50}>col-4</DemoBox>
          </Col>
          <Col span={4}>
            <DemoBox value={120}>col-4</DemoBox>
          </Col>
          <Col span={4}>
            <DemoBox value={80}>col-4</DemoBox>
          </Col>
        </Row>
        {/* <TSRow align="middle">
                <TSColumn>
                    <Box>
                    </Box>
                </TSColumn>
            </TSRow> */}
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
