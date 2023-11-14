import './App.css';

import { React } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AdapterContextProvider } from './cloudservices';
import { AuthContextProvider } from './auth';
import { StoreContextProvider } from './store';
import { ToastContextProvider } from './toast';
import { SplashScreen, Toast } from './components';

function App() {
    return (
    <BrowserRouter>
        <AdapterContextProvider>
            <AuthContextProvider>
                <StoreContextProvider>
                    <ToastContextProvider>
                        <Routes>
                            <Route path='/' element={<SplashScreen />} />
                        </Routes>
                    </ToastContextProvider>
                </StoreContextProvider>
            </AuthContextProvider>
        </AdapterContextProvider>
    </BrowserRouter>
    )
}

export default App;
