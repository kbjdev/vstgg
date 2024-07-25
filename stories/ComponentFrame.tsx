import { FC, PropsWithChildren } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  width: max-content;
  height: max-content;

  background-color: ${({ theme }) => theme.colors['editor.background']};
`;

const StoryComponentFrame: FC<PropsWithChildren> = ({ children }) => (
  <Container>{children}</Container>
);

export default StoryComponentFrame;
