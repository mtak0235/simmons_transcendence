import styled from "styled-components";

interface Props {
  width?: number;
  height?: number;
}

export const SizedBox = styled.div<Props>`
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
`;
