/*


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
*/


import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Homepage from "./Homepage";
import Register from "./Register";
import ProfilePage from "./ProfilePage";
import AdminPage from "./AdminPage"; // <-- dodaj ovo

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
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
        <Route
          path="/admin"
          element={
            user && user.role === "admin"
              ? <AdminPage user={user} />
              : <Navigate to="/" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
