import { createRoot } from 'react-dom/client';
import CoreRouter from './CoreRouter.tsx';
import './styles.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<CoreRouter />);
}
