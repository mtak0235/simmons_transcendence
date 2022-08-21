import { Layout } from 'antd';
import styled from 'styled-components';
const { Sider } = Layout;

const StyledSider = styled(Sider)`
  height: 100vh;
  position: fixed;
  background: charcoal;
  right: 0;
`

type MainLayoutComponentProps = {
    children?: React.ReactNode;
};

const MainLayoutComponent: React.FC<MainLayoutComponentProps> = (props) => {
  return (
      <StyledSider width={'30vw'}>
          {props.children}
      </StyledSider>
  );
}


export default MainLayoutComponent;