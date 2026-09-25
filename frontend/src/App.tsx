import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AppRouter } from './routes/AppRouter';
import { AiChatbot } from './components/ai/AiChatbot';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
            <div className="min-h-screen flex flex-col bg-slate-50">
              <Navbar />
              <main className="flex-1">
                <AppRouter />
              </main>
              <Footer />
              <AiChatbot />
            </div>
          </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
