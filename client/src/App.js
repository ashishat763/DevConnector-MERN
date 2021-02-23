import React, {fragment} from 'react';
import './App.css';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
const App = () => {
  return (
    <fragment>
      <Navbar></Navbar>
      <Landing></Landing>
    </fragment>
  );
}

export default App;
