import { motion } from "framer-motion";
import { Radio, Popover } from "antd";
import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Scrollbar from "perfect-scrollbar";

const Wrapper = styled.div`
  display: flex;
  justify-content: space-around;
  flex-flow: row wrap;
  align-items: stretch;
`;
const ChannelScreen = styled.div`
  display: flex;
  flex-grow: 3;
  background-color: blue;
  height: calc(100vh - 100px);
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 70%;
  padding: 20px;
`;

const ChannelScreenControl = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-content: center;
  height: 100%;
`;

const PaginationStyle = styled.div`
  display: flex;
  width: 50%;
  justify-content: space-between;
  align-items: center;
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
  background-color: yellow;
  height: calc(100vh - 100px);
  justify-content: space-between;
  flex-flow: column nowrap;
  align-items: center;
  padding: 20px;
  width: 30%;
`;
const ContentStyle = styled.div`
  height: 100%;
  width: 100%;
  overflow: auto;
`;
const Card = styled(motion.div)`
  width: 90%;
  background-color: red;
  flex-basis: auto;
  font-size: 6px;
`;

const Box = styled(motion.div)`
  background-color: red;
  width: 20vw;
  height: 20vh;
  flex-basis: auto;
  font-size: 6px;
`;

// const Nav = styled.nav`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   gap: 4px;
//   margin: 16px;
// `;

const LinkStyle = styled(Link)`
  display: flex;
  width: 100%;
  justify-content: center;
`;

function Pagination({ total, limit, page, setPage }) {
  const numPages = Math.ceil(total / limit);
  return (
    <PaginationStyle>
      <Button onClick={() => setPage(page - 1)} disabled={page === 1}>
        &lt;
      </Button>
      {Array(numPages).map((_, i) => (
        <Button key={i + 1} onClick={() => setPage(i + 1)}>
          {i + 1}
        </Button>
      ))}
      <Button onClick={() => setPage(page + 1)} disabled={page === numPages}>
        &gt;
      </Button>
    </PaginationStyle>
  );
}

function Content({ visible, users, friends }) {
  return (
    <ContentStyle>
      {visible &&
        users.map(({ userId, username }) => (
          <LinkStyle to={`/user/${userId}`}>
            <Card
              key={userId}
              whileHover={{ scale: 1.2 }}
              transition={{ delay: 0.5 }}
            >
              {username}
            </Card>
          </LinkStyle>
        ))}
      {!visible &&
        friends.map(({ userId, username, status }) => (
          <LinkStyle to={`/user/${userId}`}>
            <Card
              key={userId}
              whileHover={{ scale: 1.2 }}
              transition={{ delay: 0.5 }}
            >
              {username}
              {status}
            </Card>
          </LinkStyle>
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
          value={"tot"}
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
        <ChannelScreenControl>
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
                <Link to={`/game/${channelIdx}`}>
                  <Box
                    key={channelIdx}
                    whileHover={{ scale: 1.2 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3>{channelName}</h3>
                    <p>adminId:{adminId}</p>
                    <p>score:{score}</p>
                    <p>accessLayer:{accessLayer}</p>
                    <p>onGame:{onGame}</p>
                  </Box>
                </Link>
              )
            )}
          <footer>
            <Pagination
              total={posts.length}
              limit={limit}
              page={page}
              setPage={setPage}
            />
          </footer>
        </ChannelScreenControl>
      </ChannelScreen>
      <SideS>
        <Side></Side>
      </SideS>
    </Wrapper>
  );
}
export default Home;
