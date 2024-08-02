import { Children, FC, forwardRef, PropsWithChildren } from 'react';
import styled from 'styled-components';
import SplitViewCollection from '@src/renderer/libs/view/splitViewCollection';
import SplitViewItem from './SplitViewItem';

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

interface ISplitViewWrapperProps {
  collection: SplitViewCollection | undefined;
}

const SplitViewContainer = forwardRef<HTMLDivElement, PropsWithChildren>(({ children }, ref) => (
  <Container ref={ref}>{children}</Container>
));

SplitViewContainer.displayName = 'SplitViewContainer';

const SplitViewWrapper: FC<PropsWithChildren<ISplitViewWrapperProps>> = ({
  children,
  collection,
}) => {
  return collection
    ? Children.map(children, (child, index) => (
        <SplitViewItem control={collection.getViewControl(index)}>{child}</SplitViewItem>
      ))
    : null;
};

const SplitView = {
  Container: SplitViewContainer,
  Wrapper: SplitViewWrapper,
};

export default SplitView;
