import { FC } from 'react';
import styled from 'styled-components';
import CommandCenter from './CommandCenter';

const Container = styled.header`
  position: absolute;
  top: 0;
  left: 08796;
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 35px;
  background-color: ${({ theme }) => theme.colors['titleBar.activeBackground']};
  border-bottom: 1px solid ${({ theme }) => theme.colors['titleBar.border']};

  -webkit-app-region: drag;
`;

const SideBox = styled.div`
  flex-grow: 2;
  width: 20%;
  height: 100%;
`;

const Center = styled.div`
  max-width: fit-content;
  width: 60%;
  height: 100%;
  margin: 0 10px;
`;

const TitleBar: FC = () => (
  <Container>
    <SideBox />
    <Center>
      <CommandCenter />
    </Center>
    <SideBox />
  </Container>
);

export default TitleBar;
