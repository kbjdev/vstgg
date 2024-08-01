import { FC, PropsWithChildren } from 'react';
import styled from 'styled-components';
import type { ObjectKeyPrefix } from '@src/shared/types/utils';
import type { IVSCTheme } from '@src/shared/types/vs/theme';

interface IStoryBoxProps {
  color?: keyof IVSCTheme['colors'];
  width?: string;
  height?: string;
}

const Box = styled.div<Required<ObjectKeyPrefix<IStoryBoxProps>>>`
  display: flex;
  align-items: center;
  justify-content: center;

  width: ${({ $width }) => $width};
  height: ${({ $height }) => $height};
  background-color: ${({ theme, $color }) => theme.colors[$color]};
`;

const StoryBox: FC<PropsWithChildren<IStoryBoxProps>> = ({
  color = 'editor.background',
  height = '100%',
  width = '100%',
  children,
}) => (
  <Box $color={color} $width={width} $height={height}>
    {children}
  </Box>
);

export default StoryBox;
