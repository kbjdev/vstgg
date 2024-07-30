import { FC, PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import ViewControl from '@src/renderer/libs/view/viewControl';

const Container = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
`;

const ResizeArea = styled.div<{ $direction: ViewControl['direction'] }>`
  position: absolute;
  top: ${({ $direction }) => ($direction === 'horizontal' ? 'auto' : 0)};
  bottom: ${({ $direction }) => ($direction === 'horizontal' ? 0 : 'auto')};
  right: ${({ $direction }) => ($direction === 'horizontal' ? 'auto' : 0)};
  width: ${({ $direction }) => ($direction === 'horizontal' ? '100%' : '4px')};
  height: ${({ $direction }) => ($direction === 'horizontal' ? '4px' : '100%')};
  background-color: cadetblue;
`;

interface ISplitViewItemProps {
  control: ViewControl;
}

const SplitViewItem: FC<PropsWithChildren<ISplitViewItemProps>> = ({ children, control }) => {
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
      {control.resizable && <ResizeArea $direction={control.direction} />}
    </Container>
  );
};

export default SplitViewItem;
