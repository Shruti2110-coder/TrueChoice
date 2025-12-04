import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Voting from "./pages/Voting";
import "./App.css"; // Make sure your CSS is here

function App() {
  return (
    <BrowserRouter>
      {/* Navbar */}
      <nav>
        <div
        style={{fontSize: 20 , fontWeight: "bolder"} }
        className="logo">TrueChoice</div>
        <div 
        style= {{ 
   display: "flex",      // make links in a row
    gap: "40px", 
  textDecoration: "none",
  color: "#333",
  fontWeight: 600,
  fontSize: "16px",
  transition: "0.3s",
  justifyContent: "center"
         }}
        className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/signup">Signup</Link>
          <Link to="/login">Login</Link>
           <Link to="/vote">Vote</Link>  
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/vote" element={<Voting />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
