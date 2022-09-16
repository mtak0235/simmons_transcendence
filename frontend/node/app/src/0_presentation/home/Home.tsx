import { motion } from "framer-motion";
import { Radio } from "antd";
import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { SizedBox } from "../components/TSDesign";
import {
  List,
  Box,
  Card,
  Grid,
  ListItemButton,
  ListItemText,
  CardContent,
  Typography,
  ListItem,
} from "@mui/material";
import useModal from "../components/modal/hooks";
import { useUserInfo } from "@root/1_application/user/useUser";

const Wrapper = styled.div`
  display: flex;
  justify-content: space-around;
  flex-flow: row wrap;
  align-items: stretch;
`;
const ChannelScreen = styled.div`
  display: flex;
  flex-grow: 3;
  background-color: lightyellow;
  height: calc(100vh - 100px);
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 70%;
  padding: 10px;
`;

const PaginationStyle = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: row;
`;

const Button = styled.button`
  border: none;
  border-radius: 8px;
  padding: 8px;
  margin: 0;
  background: black;
  color: white;
  font-size: 1rem;

  &:hover {
    background: tomato;
    cursor: pointer;
    transform: translateY(-2px);
  }

  &[disabled] {
    background: grey;
    cursor: revert;
    transform: revert;
  }

  &[aria-current] {
    background: deeppink;
    font-weight: bold;
    cursor: revert;
    transform: revert;
  }
`;

const SideS = styled.div`
  display: flex;
  flex-grow: 1;
  max-width: 300px;
  height: calc(100vh - 100px);
  justify-content: space-between;
  flex-flow: column nowrap;
  align-items: center;
  padding: 20px;
  width: 30%;
  background-color: white;
`;
const ContentStyle = styled.div`
  height: calc(100vh - 100px);
  width: 100%;
  overflow: auto;
`;
const TSCard = styled(motion.div)`
  width: 90%;
  background-color: red;
  flex-basis: auto;
  font-size: 6px;
`;

const TSRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

function Pagination({ total, limit, page, setPage }) {
  const [pageCount] = useState(Math.ceil(total / limit));

  return (
    <PaginationStyle>
      <Button
        onClick={() => {
          console.log(pageCount);
          setPage(page - 1);
        }}
        disabled={page === 1}
      >
        &lt;
      </Button>
      <SizedBox width={20} />
      {/* <PaginationRow>
        {Array(pageCount).map((_, i) => (
          <Button key={i + 1} onClick={() => setPage(i + 1)}>
            {i + 1}
          </Button>
        ))}
      </PaginationRow> */}
      <Button onClick={() => setPage(page + 1)} disabled={page === pageCount}>
        &gt;
      </Button>
    </PaginationStyle>
  );
}

function Content({ visible, users, friends }) {
  const { showModal } = useModal();
  const userInfo = useUserInfo(0);

  const handleUserInfoModal = () => {
    showModal({
      modalType: "UserInfoModal",
      modalProps: {
        userInfo: userInfo,
        message: "Success!",
      },
    });
  };
  return (
    <ContentStyle style={{ overflow: "scroll" }}>
      {visible &&
        users.map(({ userId, username }) => (
          <List key={userId}>
            <ListItem disablePadding>
              <ListItemButton
                style={{
                  width: 180,
                  display: "flex",
                  textAlign: "center",
                  background: "lightgrey",
                }}
                onClick={handleUserInfoModal}
              >
                <ListItemText>{username}</ListItemText>
              </ListItemButton>
            </ListItem>
          </List>
        ))}
      {!visible &&
        friends.map(({ userId, username, status }) => (
          <List key={userId}>
            <ListItem disablePadding>
              <ListItemButton
                style={{
                  width: 180,
                  display: "flex",
                  textAlign: "center",
                  background: "lightgrey",
                }}
                key={userId}
                onClick={handleUserInfoModal}
              >
                <ListItemText>
                  {username} | {status}
                </ListItemText>
              </ListItemButton>
            </ListItem>
          </List>
        ))}
    </ContentStyle>
  );
}

function Side() {
  const [users, setUsers] = useState([]);
  const [visible, setVisible] = useState(true);
  const [friends, setFriends] = useState([]);
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then((res) => res.json())
      .then((data) =>
        setUsers(
          data.map((record) => {
            record["userId"] = record.id;
            record["username"] = `${record.id}님`;
            return record;
          })
        )
      );
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then((res) => res.json())
      .then((data) =>
        setFriends(
          data.map((record) => {
            record["userId"] = record.id;
            record["username"] = `${record.id}님`;
            record["status"] =
              record.id in users.map((data) => data.userId)
                ? "online"
                : "offline";
            return record;
          })
        )
      );
  });
  return (
    <>
      <Radio.Group size={"large"}>
        <Radio.Button
          value={"total"}
          onClick={() => {
            setVisible(false);
            console.log(visible);
          }}
        >
          전체 목록
        </Radio.Button>
        <Radio.Button
          value={"friend"}
          onClick={() => {
            setVisible(true);
          }}
        >
          친구 목록
        </Radio.Button>
      </Radio.Group>
      <Content visible={visible} users={users} friends={friends} />
    </>
  );
}

function Home() {
  const [posts, setPosts] = useState([]);
  const [limit] = useState(6);
  const [page, setPage] = useState(1);
  const offset = (page - 1) * limit;
  const { showModal } = useModal();

  const handleClickUserMakeModal = () => {
    showModal({
      modalType: "RoomMakeModal",
      modalProps: {
        message: "Success!",
      },
    });
  };

  // const channels = useChannel();
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then((res) => res.json())
      .then((data) =>
        setPosts(
          data.map((record) => {
            record["adminId"] = record.id;
            record["channelIdx"] = record.id;
            record["accessLayer"] = "public";
            record["channelName"] = `${record.id}번방의 선물`;
            record["score"] = 11;
            record["onGame"] = "true";
            return record;
          })
        )
      );
  }, []);
  return (
    <Wrapper>
      <ChannelScreen>
        <Box sx={{ flexGrow: 1, overflow: "scroll" }}>
          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 1, sm: 3, md: 8 }}
          >
            {posts
              .slice(offset, offset + limit)
              .map(
                ({
                  adminId,
                  channelIdx,
                  accessLayer,
                  channelName,
                  score,
                  onGame,
                }) => (
                  <Grid item xs={4} sm={4} md={4} key={channelIdx}>
                    <Link to={`/game/${channelIdx}`}>
                      <Card sx={{ maxWidth: 500 }}>
                        <CardContent>
                          <Typography
                            sx={{ fontSize: 14 }}
                            color="text.secondary"
                            gutterBottom
                            component={"span"}
                          >
                            <h3>{channelName}</h3>
                          </Typography>
                          <Typography variant="h5" component={"span"}>
                            <p>adminId:{adminId}</p>
                          </Typography>
                          <Typography
                            sx={{ mb: 1.5 }}
                            color="text.secondary"
                            component={"span"}
                          >
                            <p>score:{score}</p>
                          </Typography>
                          <Typography variant="body2" component={"span"}>
                            <p>accessLayer:{accessLayer}</p>
                            <br />
                            <p>onGame:{onGame}</p>
                          </Typography>
                        </CardContent>
                      </Card>
                    </Link>
                  </Grid>
                )
              )}
            <SizedBox width={100} height={25} />
            <TSRow>
              <SizedBox width={25}></SizedBox>
              <Pagination
                total={posts.length}
                limit={limit}
                page={page}
                setPage={setPage}
              />
              <Button
                style={{ backgroundColor: "#24a0ed" }}
                onClick={handleClickUserMakeModal}
              >
                만들기
              </Button>
            </TSRow>
          </Grid>
        </Box>
      </ChannelScreen>
      <SideS>
        <Side></Side>
      </SideS>
    </Wrapper>
  );
}
export default Home;
