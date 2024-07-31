import { FC, MouseEventHandler, PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import SplitViewControl from '@src/renderer/libs/view/splitViewControl';

const Container = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
`;

const Sash = styled(motion.div)<{ $direction: SplitViewControl['direction'] }>`
  position: absolute;
  top: ${({ $direction }) => ($direction === 'horizontal' ? 'auto' : 0)};
  bottom: ${({ $direction }) => ($direction === 'horizontal' ? 0 : 'auto')};
  right: ${({ $direction }) => ($direction === 'horizontal' ? 'auto' : 0)};
  width: ${({ $direction }) => ($direction === 'horizontal' ? '100%' : '4px')};
  height: ${({ $direction }) => ($direction === 'horizontal' ? '4px' : '100%')};
  &:hover,
  &:active {
    background-color: ${({ theme }) => theme.colors['sash.hoverBorder']};
  }

  transition: background-color 0.1s ease-out;
`;

interface ISplitViewItemProps {
  control: SplitViewControl;
}

const SplitViewItem: FC<PropsWithChildren<ISplitViewItemProps>> = ({ children, control }) => {
  const onMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    control.resizeHandler(event as unknown as MouseEvent);
  };

  return (
    <Container
      style={{
        x: control.direction === 'horizontal' ? 0 : control.position,
        y: control.direction === 'horizontal' ? control.position : 0,
        width: control.direction === 'horizontal' ? '100%' : control.size,
        height: control.direction === 'horizontal' ? control.size : '100%',
      }}
    >
      {children}
      {control.resizable && (
        <Sash
          style={{ cursor: control.sashCursor }}
          $direction={control.direction}
          onMouseDown={onMouseDown}
        />
      )}
    </Container>
  );
};

export default SplitViewItem;
