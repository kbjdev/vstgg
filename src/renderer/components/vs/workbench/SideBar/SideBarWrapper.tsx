import { FC, PropsWithChildren } from 'react';
import styled, { css } from 'styled-components';

const Container = styled.div<{ $position: 'left' | 'right' }>`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors['sideBar.background']};
  ${({ theme, $position }) => css`
    border-${$position === 'left' ? 'right' : 'left'}: 1px solid ${theme.colors['sideBar.border']};
  `}
`;

interface ISideBarWrapperProps {
  position: 'left' | 'right';
}

const SideBarWrapper: FC<PropsWithChildren<ISideBarWrapperProps>> = ({ position, children }) => (
  <Container $position={position}>{children}</Container>
);

export default SideBarWrapper;
