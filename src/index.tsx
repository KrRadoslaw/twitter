import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import Posts from './components/Posts';
import reportWebVitals from './reportWebVitals';
import TwitterContract from './components/TwitterContract';
import Header from './components/views/Header';
import Account from './components/Account';
import ConnectionManager from './components/ConnectionManager';
import WindowManager from './components/windows/WindowManager';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainView from './components/views/MainView';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
    
    <WindowManager>
    <ConnectionManager>
      <TwitterContract>
        <Account>
          <Header />
          <MainView>
            <Routes>
              <Route path="/"  element={<Posts />} />
              <Route path="post/:id" element={<Posts />} />
            </Routes>
          </MainView>
        </Account>
      </TwitterContract>
    </ConnectionManager>
    </WindowManager>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
