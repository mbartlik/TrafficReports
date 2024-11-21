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
        {/* <Route
          path="/events"
          element={<Events />}
        />
        <Route
          path="/annual"
          element={<AnnualReport />}
        />
        <Route path="/team" element={<Teams />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route
          path="/sign-up"
          element={<SignUp />}
        /> */}
      </Routes>
    </Router>
  );
}

export default App;
