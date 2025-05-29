/*import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import './App.css';
import Login from "./Login"; // koristimo tvoju Login komponentu
import Register from "./Register";
import HomePage from "./Homepage";

// MOCK podaci (kasnije ih mijenjaj API pozivima)
const mockGenres = [
  { id: 1, name: "Fantastika" },
  { id: 2, name: "Pustolovina" },
  // ...
];

const mockBooks = [
  { id: 1, title: "Harry Potter", genre_id: 1 },
  { id: 2, title: "Gospodar prstenova", genre_id: 2 },
  // ...
];

function BooksPage() {
  const [books] = useState(mockBooks);
  const [genres] = useState(mockGenres);
  const [selectedGenre, setSelectedGenre] = useState(null);

  const filteredBooks = selectedGenre
    ? books.filter(book => book.genre_id === selectedGenre)
    : books;

  return (
    <div>
      <h2>Popis knjiga</h2>
      <label>Filtriraj po žanru: </label>
      <select onChange={e => setSelectedGenre(Number(e.target.value) || null)}>
        <option value="">Svi žanrovi</option>
        {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>

      <ul>
        {filteredBooks.map(book =>
          <li key={book.id}>{book.title}</li>
        )}
      </ul>
    </div>
  );
}

function ProfilePage({ user }) {
  return (
    <div>
      <h2>Profil korisnika: {user.username}</h2>
      <p>Osobni podaci...</p>
      <h3>Posuđene knjige:</h3>
      <ul>
        {/* Ovdje možeš dodati popis posuđenih knjiga }
      </ul>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <nav>
        {user && (
          <>
            <Link to="/books">Knjige</Link> | <Link to="/profile">Profil</Link>
          </>
        )}
      </nav>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/books" /> : <Login onLogin={setUser} />}
        />
        <Route
          path="/books"
          element={user ? <BooksPage /> : <Navigate to="/" />}
        />
        <Route
          path="/profile"
          element={user ? <ProfilePage user={user} /> : <Navigate to="/" />}
        />
        <Route path="/register" element={<Register />} />
<Route
  path="/home"
  element={user ? <HomePage user={user} /> : <Navigate to="/" />}
/>

      </Routes>
    </Router>
  );
}

export default App;
*/


import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Homepage from "./Homepage";
import Register from "./Register";
import ProfilePage from "./ProfilePage"; // ✅ NOVO

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null); // ✅ odjava - briše korisnika
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/home"
          element={user ? <Homepage user={user} /> : <Navigate to="/" />}
        />
        <Route path="/register" element={<Register />} />
        <Route
          path="/profile"
          element={user ? (
            <ProfilePage user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" />
          )}
        />
      </Routes>
    </Router>
  );
}

export default App;
