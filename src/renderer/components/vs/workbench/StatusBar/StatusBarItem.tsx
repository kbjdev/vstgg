import { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div<{ $isRemote: boolean }>`
  height: 22px;
  width: max-content;

  background-color: ${({ theme, $isRemote }) =>
    $isRemote
      ? theme.colors['statusBarItem.remoteBackground']
      : theme.colors['statusBar.background']};
`;

const Container = styled.button<{ $isRemote: boolean }>`
  display: flex;
  align-items: center;
  height: 100%;
  min-width: 24px;
  padding: 0 ${({ $isRemote }) => ($isRemote ? '10px' : '5px')};

  font-size: 12px;
  color: ${({ theme, $isRemote }) =>
    $isRemote
      ? theme.colors['statusBarItem.remoteForeground']
      : theme.colors['statusBar.foreground']};
  white-space: pre;
  cursor: pointer;

  svg {
    width: 14px;
    height: 14px;
    fill: ${({ theme, $isRemote }) =>
      $isRemote
        ? theme.colors['statusBarItem.remoteForeground']
        : theme.colors['statusBar.foreground']};
  }

  &:hover {
    color: ${({ theme, $isRemote }) =>
      $isRemote
        ? theme.colors['statusBarItem.remoteHoverForeground']
        : theme.colors['statusBarItem.hoverForeground']};
    background-color: ${({ theme, $isRemote }) =>
      $isRemote
        ? theme.colors['statusBarItem.remoteHoverBackground']
        : theme.colors['statusBarItem.hoverBackground']};

    svg {
      fill: ${({ theme, $isRemote }) =>
        $isRemote &&
        theme.colors['statusBarItem.remoteHoverForeground'] !==
          theme.colors['statusBarItem.hoverBackground']
          ? theme.colors['statusBarItem.remoteHoverForeground']
          : theme.colors['statusBar.foreground']};
    }
  }

  &:active {
    background-color: ${({ theme }) => theme.colors['statusBarItem.activeBackground']};
  }
`;

interface IStatusBarItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isRemote?: boolean;
}

const StatusBarItem: FC<PropsWithChildren<IStatusBarItemProps>> = ({
  children,
  isRemote = false,
  type = 'button',
  ...props
}) => (
  <Wrapper $isRemote={isRemote}>
    <Container $isRemote={isRemote} type={type} {...props}>
      {children}
    </Container>
  </Wrapper>
);

export default StatusBarItem;
