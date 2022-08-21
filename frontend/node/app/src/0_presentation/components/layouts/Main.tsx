import React from 'react';
import { Layout, Menu } from 'antd';
import styled from 'styled-components';
import { UserOutlined, HomeOutlined } from '@ant-design/icons';
const { Header, Content, Footer, Sider} = Layout;

const StyledSider = styled(Sider)`
  height: 100vh;
  position: fixed;
  background: red;
  left: 0;
`

function MainLayoutComponent() {
  return (
    <Layout>
      <StyledSider width={'30vw'}>
      </StyledSider>
      <Layout>
      </Layout>
    </Layout>
  );
}


export default MainLayoutComponent;