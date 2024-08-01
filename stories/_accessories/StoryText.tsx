import { FC, PropsWithChildren } from 'react';
import styled from 'styled-components';
import type { ObjectKeyPrefix } from '@src/shared/types/utils';
import type { IVSCTheme } from '@src/shared/types/vs/theme';

interface IStoryTextProps {
  color?: keyof IVSCTheme['colors'];
  fontSize?: number;
  fontWeight?: number;
}

const Text = styled.span<Required<ObjectKeyPrefix<IStoryTextProps>>>`
  font-size: ${({ $fontSize }) => $fontSize}px;
  font-weight: ${({ $fontWeight }) => $fontWeight};
  color: ${({ theme, $color }) => theme.colors[$color]};
`;

const StoryText: FC<PropsWithChildren<IStoryTextProps>> = ({
  color = 'foreground',
  fontSize = 11,
  fontWeight = 400,
  children,
}) => (
  <Text $color={color} $fontSize={fontSize} $fontWeight={fontWeight}>
    {children}
  </Text>
);

export default StoryText;
