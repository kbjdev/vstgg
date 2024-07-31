/* eslint-disable react-hooks/exhaustive-deps */
import { Children, FC, PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import SplitViewCollection, {
  ISplitViewCollectionOptions,
} from '@src/renderer/libs/view/splitViewCollection';
import SplitViewItem from './SplitViewItem';

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

interface ISplitViewProps {
  views: ISplitViewCollectionOptions['views'];
  direction?: ISplitViewCollectionOptions['direction'];
}

const SplitView: FC<PropsWithChildren<ISplitViewProps>> = ({
  children,
  direction = 'horizontal',
  views,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [control, setControl] = useState<SplitViewCollection>();

  const minSize = useMemo(
    () => views.reduce((total, view) => (view.visible ? total + view.minSize : total), 0),
    []
  );

  useEffect(() => {
    const splitViewCollection = new SplitViewCollection({
      container: containerRef.current,
      views,
      direction,
    });

    setControl(splitViewCollection);

    return () => {
      splitViewCollection.destroy();
    };
  }, []);

  return (
    <Container
      ref={containerRef}
      style={{
        minWidth: direction === 'horizontal' ? 'auto' : minSize,
        minHeight: direction === 'horizontal' ? minSize : 'auto',
      }}
    >
      {control
        ? Children.map(children, (child, index) => (
            <SplitViewItem control={control.getViewControl(index)}>{child}</SplitViewItem>
          ))
        : null}
    </Container>
  );
};

export default SplitView;
