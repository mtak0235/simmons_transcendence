import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Row = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(6, 1fr);
  position: absolute;
  width: 70%;
`;

const Box = styled(motion.div)`
  background-color: red;
  height: 200px;
  font-size: 66px;
`;

function Home() {
  return (
    <Row>
      <Link to={"/game/12"}>asdfa</Link>
      <Box whileHover={{ scale: 1.2 }} transition={{ delay: 0.5 }}></Box>
      <Box whileHover={{ scale: 1.2 }} transition={{ delay: 0.5 }}></Box>
      <Box whileHover={{ scale: 1.2 }} transition={{ delay: 0.5 }}></Box>
      <Box whileHover={{ scale: 1.2 }} transition={{ delay: 0.5 }}></Box>
    </Row>
  );
}
export default Home;
