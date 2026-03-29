import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { PublicView } from './pages/PublicView';
import { OfflineBanner } from './components';
import { useOnlineStatus } from './hooks';
import { registerServiceWorker } from './utils/registerSW';

// Register service worker
registerServiceWorker();

function App() {
  const isOnline = useOnlineStatus();

  return (
    <>
      <OfflineBanner isOnline={isOnline} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/view/:scheduleId" element={<PublicView />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
