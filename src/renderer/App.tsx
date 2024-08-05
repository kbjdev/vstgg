import { FC } from 'react';
import ThemeProvider from '@src/renderer/components/styles/ThemeProvider';
import GlobalStyles from './components/styles/GlobalStyles';
import TitleBar from './components/vs/workbench/TitleBar';

const App: FC = () => {
  return (
    <ThemeProvider>
      <GlobalStyles />
      <TitleBar />
    </ThemeProvider>
  );
};

export default App;
