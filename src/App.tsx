import React from 'react';
import { AppProviders } from './app/providers';
import { useAuth } from './hooks/useAuth';
import './index.css';

function App() {
  return (
    <div className="App">
      <AppProviders />
    </div>
  );
}

export default App;
