import { FC } from 'react';
import ThemeProvider from '@src/renderer/components/styles/ThemeProvider';
import GlobalStyles from './components/styles/GlobalStyles';
import ActivityBar from './components/vs/workbench/ActivityBar';
import TitleBar from './components/vs/workbench/TitleBar';

const App: FC = () => {
  return (
    <ThemeProvider>
      <GlobalStyles />
      <TitleBar />
      <ActivityBar />
    </ThemeProvider>
  );
};

export default App;
