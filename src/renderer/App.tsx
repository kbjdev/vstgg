import { FC, useRef } from 'react';
import styled from 'styled-components';
import ThemeProvider from '@src/renderer/components/styles/ThemeProvider';
import GlobalStyles from './components/styles/GlobalStyles';
import SplitView from './components/vs/view/SplitView';
import ActivityBar from './components/vs/workbench/ActivityBar';
import Editor from './components/vs/workbench/Editor';
import PrimarySideBar from './components/vs/workbench/SideBar/PrimarySideBar';
import SecondarySideBar from './components/vs/workbench/SideBar/SecondarySideBar';
import StatusBar from './components/vs/workbench/StatusBar';
import TitleBar from './components/vs/workbench/TitleBar';
import useSplitViewCollection from './libs/view/useSplitViewCollection';

const Body = styled.div`
  position: absolute;
  top: calc(35px + 48px);
  left: 48px;
  width: calc(100vw - 48px);
  height: calc(100vh - (35px + 48px + 22px));
`;

// TODO: Scroll Box
const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  min-width: 640px;
  overflow: auto;
`;

const App: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const collection = useSplitViewCollection({
    containerRef,
    views: [
      { minSize: 170, size: 300, visible: true, snap: true },
      { minSize: 300, size: 600, visible: true },
      { minSize: 170, size: 300, visible: true },
    ],
    direction: 'vertical',
  });

  return (
    <ThemeProvider>
      <GlobalStyles />
      <TitleBar />
      <ActivityBar />
      <Body>
        <Wrapper>
          <SplitView.Container ref={containerRef}>
            <SplitView.Wrapper collection={collection}>
              <PrimarySideBar />
              <Editor />
              <SecondarySideBar />
            </SplitView.Wrapper>
          </SplitView.Container>
        </Wrapper>
      </Body>
      <StatusBar />
    </ThemeProvider>
  );
};

export default App;
