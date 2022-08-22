import { Link, NavLink, To } from "react-router-dom";
import { Row, Card } from "antd";
import useDashboard from "../../1_application/dashboard/useDashboard";

const About: React.FC = () => {
  const dashboard = useDashboard();

  const games = dashboard.map((g) => (
    <NavLink to={"/"}>
      <Card title="Card title" bordered={false} style={{ width: 300 }}></Card>
    </NavLink>
  ));
  return (
    <>
      <Row gutter={[16, 16]}>
        <div className="site-card-border-less-wrapper">{games}</div>
      </Row>
    </>
  );
};

export default About;
