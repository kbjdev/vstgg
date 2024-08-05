import { FC } from 'react';
import styled from 'styled-components';
import DiscardIcon from '@resources/icons/discard.svg?react';
import RedoIcon from '@resources/icons/redo.svg?react';
import RepoIcon from '@resources/icons/repo.svg?react';
import ToolbarIconButton from '../../button/ToolbarIconButton';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  gap: 4px;

  -webkit-app-region: no-drag;
  z-index: 1;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38vw;
  height: 22px;
  border: 1px solid ${({ theme }) => theme.colors['commandCenter.border']};
  background-color: ${({ theme }) => theme.colors['commandCenter.background']};
  border-radius: 6px;
  margin-left: 6px;

  color: ${({ theme }) => theme.colors['titleBar.activeForeground']};
  fill: ${({ theme }) => theme.colors['titleBar.activeForeground']};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors['commandCenter.activeBackground']};
    border-color: ${({ theme }) => theme.colors['commandCenter.activeBorder']};
    color: ${({ theme }) => theme.colors['commandCenter.activeForeground']};
    fill: ${({ theme }) => theme.colors['commandCenter.activeForeground']};
  }
`;

const Text = styled.span`
  font-size: 12px;
  line-height: 22px;
`;

const CommandCenter: FC = () => (
  <Wrapper>
    <ToolbarIconButton>
      <DiscardIcon />
    </ToolbarIconButton>
    <ToolbarIconButton>
      <RedoIcon />
    </ToolbarIconButton>
    <Container>
      <RepoIcon style={{ margin: 3 }} />
      <Text>VScode Theme Git Gui</Text>
    </Container>
  </Wrapper>
);

export default CommandCenter;
