import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('_vstgg') as HTMLElement;

if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
