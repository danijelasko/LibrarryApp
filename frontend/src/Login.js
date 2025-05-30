

import React, { useState } from "react";
import "./Login.css";
import booksImg from "./assets/books.png";
import { useNavigate } from "react-router-dom";
import { initDB } from './indexedDB-utils';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const saveUserToIndexedDB = async (user) => {
    try {
      const db = await initDB();
      const tx = db.transaction("users", "readwrite");
      const store = tx.objectStore("users");
      await store.put(user);
      await tx.done;
      console.log("Korisnik spremljen offline u LibraryDB");
    } catch (err) {
      console.error("Greška pri spremanju korisnika u LibraryDB", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // reset error
    try {
      const res = await fetch(
        `http://localhost:3001/users?email=${email}&password=${password}`
      );
      const data = await res.json();

      if (data.length > 0) {
        const user = data[0];
        onLogin(user);
        localStorage.setItem("user_id", user.id); // spremi ID 
        await saveUserToIndexedDB({ ...user, password });
        navigate("/home");
      } else {
        setError("Pogrešan email ili lozinka");
      }
    } catch (err) {
      // Ako nema interneta, pokušaj offline login iz IndexedDB po email_idx
      try {
        const db = await initDB();
        const tx = db.transaction("users", "readonly");
        const store = tx.objectStore("users");
        const index = store.index("email_idx");
        const user = await index.get(email);

        if (user && user.password === password) {
          onLogin(user);
          localStorage.setItem("user_id", user.id); // spremi ID 
          navigate("/home");
        } else {
          setError("Nema takvog korisnika spremljenog offline ili lozinka nije ispravna");
        }
      } catch (dbErr) {
        setError("Greška pri pristupu lokalnoj bazi podataka");
        console.error(dbErr);
      }
    }
  };

 return (
  <div className="login-container">
    <div className="login-form-section">
      <h2>Log in</h2>
      <form onSubmit={handleLogin}>
        {/* Email */}
        <label>Email</label>
        <div className="input-wrapper">
          <span className="input-icon">📧</span>
          <input
            type="email"
            placeholder="Upiši email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {/* Lozinka */}
        <label>Lozinka</label>
        <div className="input-wrapper">
          <span className="input-icon">🔒</span>
          <input
            type="password"
            placeholder="Upiši lozinku"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="login-btn">Prijavi se</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
      <p>
        Nemate račun? <a href="/register">Registriraj se</a>
      </p>
    </div>
    <div className="login-image-section">
      <img className="login-image" src={booksImg} alt="Books" />
    </div>
  </div>
);

};

export default Login;
