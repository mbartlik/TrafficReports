import React from 'react';
import Navbar from "./components/navbar";
import Home from "./components/home";
import About from './components/about';
import Bot from './components/bot';
import CreateBot from './components/createBot';
import MyBots from './components/myBots';
import {
    BrowserRouter as Router,
    Routes,
    Route
} from "react-router-dom";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/bot/:id" element={<Bot />} />
        <Route path="/create-bot" element={<CreateBot />} />
        <Route path="/my-bots" element={<MyBots />} />
      </Routes>
    </Router>
  );
}

export default App;
