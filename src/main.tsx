import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Aplicar tema fosc per defecte
document.documentElement.classList.add('dark');

createRoot(document.getElementById("root")!).render(<App />);
