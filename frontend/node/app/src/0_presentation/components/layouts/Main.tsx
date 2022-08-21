import React from 'react';
import { Layout, Menu } from 'antd';
import styled from 'styled-components';
import { UserOutlined, HomeOutlined } from '@ant-design/icons';
const { Header, Content, Footer, Sider } = Layout;

const StyledSider = styled(Sider)`
  overflow: auto;
  height: 100vh;
  position: fixed;
  background: white;
  left: 0;
`
const StyledHeader = styled(Header)`
  padding: 0;
  text-align: center;
  font-weight: bold;
  font-size: 20px;
  -webkit-box-shadow: 2px 1px 5px 0px rgba(0,0,0,0.26);
  -moz-box-shadow: 2px 1px 5px 0px rgba(0,0,0,0.26);
  box-shadow: 2px 1px 5px 0px rgba(0,0,0,0.26);
  background: #F0F3F4
`
 
const StyledContent = styled(Content)`
  height: 100vh;
  padding: 10px;
  overflow: initial;
`
 
function MainLayoutComponent() {
  return (
    <Layout>
      <StyledSider>
        <Menu mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1">
              <HomeOutlined />
              <span>Home</span>
          </Menu.Item>
          <Menu.Item key="2">
              <UserOutlined />
              <span>About Me</span>
          </Menu.Item>
        </Menu>
      </StyledSider>
      <Layout>
        <StyledHeader>Welcome To My Home</StyledHeader>
        <StyledContent>
         Content
        </StyledContent>
      </Layout>
    </Layout>
  );
}


export default MainLayoutComponent;