import React, { useState } from "react";
import axios from "axios";

function Login() {
  const [form, setForm] = useState({
    aadharCardNumber: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/user/login", form, {
        headers: { "Content-Type": "application/json" }
      });

     localStorage.setItem("token", res.data.token);

      alert("Login Successful!");
      console.log(res.data);
    } catch (err) {
      alert("Login Failed");
      console.error(err);
    }
  };

  return (
    <div className="form-box" style={{ padding: 30 }}>
      <h2>Login</h2>

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          name="aadharCardNumber"
          type="text"
          placeholder="Aadhar Number"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <button type="submit" style={{ padding: 10, cursor: "pointer" }}>Login</button>
      </form>
    </div>
  );
}

export default Login;
