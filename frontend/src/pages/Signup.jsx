import React, { useState } from "react";
import axios from "axios";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    email: "",
    mobile: "",
    address: "",
    aadharCardNumber: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/user/signup",
        form,
        {
          headers: { "Content-Type": "application/json" }
        }
      );
      alert("Signup Successful!");
      console.log(response.data);
    } catch (error) {
      alert("Signup failed! Check backend error.");
      console.error(error);
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Signup</h2>

      <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input type="text" name="name" placeholder="Name" onChange={handleChange} />
        <input type="number" name="age" placeholder="Age" onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} />
        <input type="text" name="mobile" placeholder="Mobile" onChange={handleChange} />
        <input type="text" name="address" placeholder="Address" onChange={handleChange} />
        <input type="text" name="aadharCardNumber" placeholder="Aadhar Card Number" onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} />

        <button type="submit" style={{ padding: 10, cursor: "pointer" }}>Signup</button>
      </form>
    </div>
  );
}

export default Signup;
