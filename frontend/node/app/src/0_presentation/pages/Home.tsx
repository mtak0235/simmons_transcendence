import {Button, Row, Col} from "antd";

const Home: React.FunctionComponent = () => {
  return <>
    <Row justify="center">
      <Col style={{ position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)'}}>
      <Button type="primary" size="large" onClick={() => console.log("Log in")}>로그인</Button>
      </Col>
    </Row>
  </>;
};


export default Home;