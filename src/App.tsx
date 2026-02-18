import './App.css'
import MainLayout from './layouts/MainLayout'
import LoginPage from './pages/LoginPage'
import LocationInformationServerPage from './pages/LocationInformationServerPage'
import '@momentum-design/fonts/dist/css/fonts.css';
import '@momentum-design/tokens/dist/css/components/complete.css';
import './font-overrides.css';
import { ThemeProvider, IconProvider } from '@momentum-design/components/react'
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [isSignedIn, setIsSignedIn] = useState(false)

  return (
    <ThemeProvider themeclass={`mds-theme-stable-${theme}Webex`}>
      <IconProvider iconSet='momentum-icons'>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={isSignedIn ? <Navigate to="/location-information-server" replace /> : <LoginPage onSignIn={() => setIsSignedIn(true)} />} />
            <Route
              path="/location-information-server"
              element={
                isSignedIn ? (
                  <MainLayout theme={theme} setTheme={setTheme}>
                    <LocationInformationServerPage />
                  </MainLayout>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route path="*" element={<Navigate to={isSignedIn ? '/location-information-server' : '/'} replace />} />
          </Routes>
        </BrowserRouter>
      </IconProvider>
    </ThemeProvider>
  )
}

export default App
