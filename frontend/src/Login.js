/*import React, { useState } from "react";
import "./Login.css";
import booksImg from "./assets/books.png";
import { useNavigate } from "react-router-dom";
import { openDB } from "idb";
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
    try {
      const res = await fetch(
        `http://localhost:3001/users?email=${email}&password=${password}`
      );
      const data = await res.json();

      if (data.length > 0) {
        const user = data[0];
        console.log("Online login uspješan, korisnik:", user);
        onLogin(user);
        await saveUserToIndexedDB(user); // spremi korisnika za offline pristup
        navigate("/home");
      } else {
        setError("Pogrešan email ili lozinka");
      }
    } catch (err) {
      console.log("Fetch nije uspio, pokušavam offline login...");
      console.log("Email i lozinka za offline login:", email, password);

      try {
        const db = await initDB();

        const tx = db.transaction("users", "readonly");
        const store = tx.objectStore("users");
        const user = await store.get(email);

        console.log("Offline login - pronađen korisnik u IndexedDB:", user);

        if (user && user.password === password) {
          console.log("Offline login uspješan, korisnik:", user);
          onLogin(user);
          navigate("/home");
        } else {
          console.log("Offline login - korisnik nije pronađen ili lozinka ne odgovara");
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
          <label>Email</label>
          <input
            type="email"
            placeholder="Upiši email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Lozinka</label>
          <input
            type="password"
            placeholder="Upiši lozinku"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Prijavi se</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>

        <p>
          Nemate račun? <a href="/register">Registriraj se</a>
        </p>
      </div>

      <div className="login-image-section">
        <img src={booksImg} alt="Books" />
      </div>
    </div>
  );
};

export default Login;
*/



//plus



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
        localStorage.setItem("user_id", user.id); // spremi ID za kasnije!
        await saveUserToIndexedDB(user);
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
          localStorage.setItem("user_id", user.id); // spremi ID za kasnije!
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
          <label>Email</label>
          <input
            type="email"
            placeholder="Upiši email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Lozinka</label>
          <input
            type="password"
            placeholder="Upiši lozinku"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Prijavi se</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
        <p>
          Nemate račun? <a href="/register">Registriraj se</a>
        </p>
      </div>
      <div className="login-image-section">
        <img src={booksImg} alt="Books" />
      </div>
    </div>
  );
};

export default Login;
