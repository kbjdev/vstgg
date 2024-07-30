import { Children, FC, PropsWithChildren, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import SplitViewControl from '@src/renderer/libs/view/splitViewControl';
import SplitViewItem from './SplitViewItem';

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

interface ISplitViewProps {}

const SplitView: FC<PropsWithChildren<ISplitViewProps>> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [control, setControl] = useState<SplitViewControl>();

  useEffect(() => {
    const splitViewControl = new SplitViewControl({
      container: containerRef.current,
      views: [
        { minSize: 35, size: 35, visible: true },
        {
          minSize: 100,
          size: 220,
          visible: true,
        },
        {
          minSize: 100,
          size: 110,
          visible: true,
        },
        { minSize: 22, size: 22, visible: true },
      ],
      direction: 'vertical',
    });

    setControl(splitViewControl);

    return () => {
      splitViewControl.destroy();
    };
  }, []);

  return (
    <Container ref={containerRef}>
      {control
        ? Children.map(children, (child, index) => (
            <SplitViewItem control={control.getViewControl(index)}>{child}</SplitViewItem>
          ))
        : null}
    </Container>
  );
};

export default SplitView;
