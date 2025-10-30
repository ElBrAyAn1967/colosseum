import { BrowserRouter } from 'react-router-dom';
import WalletContextProvider from './context/WalletContextProvider';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <WalletContextProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </WalletContextProvider>
  );
}
