import { Layout } from 'antd';
import styled from 'styled-components';
const { Sider } = Layout;

const StyledSider = styled(Sider)`
  height: 100vh;
  position: fixed;
  background: charcoal;
  right: 0;
`

function MainLayoutComponent() {
  return (
    <Layout>
      <StyledSider width={'30vw'}>
      </StyledSider>
    </Layout>
  );
}


export default MainLayoutComponent;