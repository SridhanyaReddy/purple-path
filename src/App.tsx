import { createRoot } from 'react-dom/client';
import Main from './Main';
import './styles.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<Main />);
}
