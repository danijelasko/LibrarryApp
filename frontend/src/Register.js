/*import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // provjeri postoji li već email
    const res = await fetch(`http://localhost:3001/users?email=${email}`);
    const existing = await res.json();

    if (existing.length > 0) {
      setMsg("Korisnik s ovim emailom već postoji.");
      return;
    }

    // dodaj novog korisnika
    await fetch("http://localhost:3001/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setMsg("Uspješna registracija. Preusmjeravanje...");
    setTimeout(() => navigate("/"), 1500);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Registracija</h2>
      <form onSubmit={handleRegister}>
        <label>Email:</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <label>Lozinka:</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Registriraj se</button>
      </form>
      <p>{msg}</p>
    </div>
  );
};

export default Register;
*/
import React, { useState } from "react";
import "./Register.css";
import booksImg from "./assets/books.png";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // Provjera postoji li već korisnik s ovim emailom
      const resCheck = await fetch(`http://localhost:3001/users?email=${email}`);
      const existing = await resCheck.json();

      if (existing.length > 0) {
        setMsg("Korisnik s ovim emailom već postoji.");
        return;
      }

      // Slanje podataka na backend
      const res = await fetch("http://localhost:3001/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          first_name: firstName,
          last_name: lastName,
          phone,
          email,
          password,
        }),
      });

      if (res.ok) {
        setMsg("Uspješna registracija. Preusmjeravanje...");
        setTimeout(() => navigate("/"), 1500);
      } else {
        const errorData = await res.json();
        setMsg(errorData.message || "Greška pri registraciji.");
      }
    } catch (error) {
      setMsg("Greška pri spajanju na server.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-form-section">
        <h2>Registracija</h2>
        <form onSubmit={handleRegister}>
          <label>Korisničko ime</label>
          <input
            type="text"
            placeholder="Unesite korisničko ime"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Ime</label>
          <input
            type="text"
            placeholder="Unesite ime"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />

          <label>Prezime</label>
          <input
            type="text"
            placeholder="Unesite prezime"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />

          <label>Telefon</label>
          <input
            type="tel"
            placeholder="Unesite broj telefona"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Unesite email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Lozinka</label>
          <input
            type="password"
            placeholder="Unesite lozinku"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Registriraj se</button>
          {msg && <p className={msg.toLowerCase().includes("uspješna") ? "success-msg" : "error-msg"}>{msg}</p>}
        </form>

        <p>Već imate račun? <a href="/">Prijavite se</a></p>
      </div>

      <div className="register-image-section">
        <img src={booksImg} alt="Books" />
      </div>
    </div>
  );
};

export default Register;
