import { FC } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors['editor.background']};
`;

const Editor: FC = () => <Container />;

export default Editor;
