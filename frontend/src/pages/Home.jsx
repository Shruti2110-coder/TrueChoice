import React from 'react'
import { useNavigate } from "react-router-dom";
function Home() {
    const navigate = useNavigate();
  return (
    <> 
    <h1 
 style={{
    textAlign: "center", marginTop: "100px", color: "#333"
 }}>
    Welcome to TrueChoice
 </h1>
 <div style={{
    display: "flex",
    margin: "20px",
    padding: "20px",
    borderRadius: "50px",
    gap: "20px"
 }} >
   <button onClick={() => navigate("/signup")}>Signup</button>
      <button onClick={() => navigate("/login")}>Login</button>
 </div>
 
    </>

  )
}

export default Home