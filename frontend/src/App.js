import React from 'react';
import Navbar from "./components/navbar";
import Home from "./components/home";
import About from './components/about';
import Bot from './components/bot';
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
