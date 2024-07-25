import { FC } from 'react';
import ThemeProvider from '@src/renderer/components/styles/ThemeProvider';
import GlobalStyles from './components/styles/GlobalStyles';

const App: FC = () => {
  return (
    <ThemeProvider>
      <GlobalStyles />
      <h1>💖 Hello World!</h1>
      <p>Welcome to your Electron application.</p>
    </ThemeProvider>
  );
};

export default App;
