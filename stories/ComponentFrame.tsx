import { FC, PropsWithChildren } from 'react';
import styled from 'styled-components';
import type { ObjectKeyPrefix } from '@src/shared/types/utils';

const Container = styled.div<ObjectKeyPrefix<IStoryComponentFrameProps>>`
  padding: 20px;
  width: ${({ $width }) => ($width ? `${$width}px` : 'max-content')};
  height: ${({ $height }) => ($height ? `${$height}px` : 'max-content')};

  background-color: ${({ theme }) => theme.colors['editor.background']};
`;

interface IStoryComponentFrameProps {
  width?: number;
  height?: number;
}

const StoryComponentFrame: FC<PropsWithChildren<IStoryComponentFrameProps>> = ({
  children,
  width,
  height,
}) => (
  <Container $width={width} $height={height}>
    {children}
  </Container>
);

export default StoryComponentFrame;
