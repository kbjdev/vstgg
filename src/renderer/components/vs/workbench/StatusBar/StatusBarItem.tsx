import { FC, PropsWithChildren } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  align-items: center;
  height: 22px;
  min-width: 24px;
  padding: 0 5px;

  font-size: 12px;
  color: ${({ theme }) => theme.colors['statusBar.foreground']};
  white-space: pre;
  cursor: pointer;

  svg {
    width: 14px;
    height: 14px;
    fill: ${({ theme }) => theme.colors['statusBar.foreground']};
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors['statusBarItem.hoverBackground']};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors['statusBarItem.activeBackground']};
  }
`;

const StatusBarItem: FC<PropsWithChildren> = ({ children }) => <Container>{children}</Container>;

export default StatusBarItem;
