import React, { useEffect, useState,useRef } from "react";
import "./AdminPage.css";
import { deleteUserAndRelatedDataFromIndexedDB } from "./indexedDB-utils";
import { saveBooks } from "./indexedDB-utils";
import { useNavigate } from "react-router-dom";

import { getImage, fetchAndSaveImage } from "./indexedDB-utils";

import { saveUsersToIndexedDB, getAllUsersFromIndexedDB } from "./indexedDB-utils";
import { getAllBooks } from "./indexedDB-utils"; 

const API_URL = "http://localhost:3001";

export default function AdminPage({ user }) {
  const [users, setUsers] = useState([]);
  const editSectionRef = useRef(null);
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(true);

  const [editBook, setEditBook] = useState(null); // Sprema podatke o knjizi koju uređujemo
  const [form, setForm] = useState({
    title: "",
    author: "",
    year: "",
    genre_id: "",
    available_copies: "",
    description: "",
    image: "",
  });
  const [message, setMessage] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [imageUrls, setImageUrls] = useState({});


  const navigate = useNavigate();

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);
    return () => {
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
    };
  }, []);



  // Automatski briši poruku nakon 3 sekunde
  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  // API pozivi
const fetchBooksAndUpdateIndexedDB = async () => {
  try {
    const res = await fetch(`${API_URL}/books`);
    const data = await res.json();
    setBooks(data);
    await saveBooks(data);
  } catch (e) {
    // OFFLINE fallback – pročitaj iz IndexedDB
    const offlineBooks = await getAllBooks();
    setBooks(offlineBooks);
  }
};




const fetchUsers = async () => {
  if (!navigator.onLine) {
    // OFFLINE: pokušaj dohvatiti korisnike iz IndexedDB
    const offlineUsers = await getAllUsersFromIndexedDB();
    setUsers(offlineUsers || []);
    return;
  }
  try {
    const res = await fetch(`${API_URL}/users/all`);
    const data = await res.json();
    setUsers(data);
    await saveUsersToIndexedDB(data); // spremi u IndexedDB!
  } catch {
    setUsers([]);
  }
};


  const fetchGenres = async () => {
  try {
    const res = await fetch(`${API_URL}/genres`);
    const data = await res.json();
    setGenres(data);
  } catch (e) {
    setGenres([]); 
  }
};


  useEffect(() => {
    fetchUsers();
    fetchBooksAndUpdateIndexedDB();
    fetchGenres();

  }, []);

  // Dodaj knjigu
  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!isOnline) return;
    try {
      const res = await fetch(`${API_URL}/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage("Knjiga dodana!");
        setForm({
          title: "",
          author: "",
          year: "",
          genre_id: "",
          available_copies: "",
          description: "",
          image: "",
        });
        await fetchBooksAndUpdateIndexedDB();
      } else {
        setMessage("Greška pri dodavanju knjige.");
      }
    } catch {
      setMessage("Greška pri dodavanju knjige.");
    }
  };

  // Uredi knjigu
  const handleEditBook = async (e) => {
    e.preventDefault();
    if (!editBook || !isOnline) return;
    try {
      const res = await fetch(`${API_URL}/books/${editBook.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editBook),
      });
      if (res.ok) {
        setMessage("Knjiga ažurirana!");
        setEditBook(null);
        await fetchBooksAndUpdateIndexedDB();
      } else {
        setMessage("Greška pri ažuriranju knjige.");
      }
    } catch {
      setMessage("Greška pri ažuriranju knjige.");
    }
  };

  // Briši knjigu
  const handleDeleteBook = async (bookId) => {
    if (!isOnline) return;
    if (!window.confirm("Jeste li sigurni da želite izbrisati ovu knjigu?")) return;
    await fetch(`${API_URL}/books/${bookId}`, { method: "DELETE" });
    await fetchBooksAndUpdateIndexedDB();
  };

  // Briši korisnika
  const handleDeleteUser = async (userId) => {
    if (!isOnline) return;
    if (!window.confirm("Jeste li sigurni da želite izbrisati ovog korisnika?")) return;
    try {
      const res = await fetch(`http://localhost:3001/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        await deleteUserAndRelatedDataFromIndexedDB(userId);
        setMessage("Korisnik obrisan!");
        fetchUsers();
      } else {
        setMessage("Greška pri brisanju korisnika.");
      }
    } catch {
      setMessage("Greška pri brisanju korisnika.");
    }
  };

useEffect(() => {
  async function loadBookImages() {
    setImagesLoading(true); // Loader ON
    const urls = {};
    for (const b of books) {
      let blob = await getImage(b.id);
      if (blob) {
        urls[b.id] = URL.createObjectURL(blob);
      } else if (navigator.onLine && b.image) {
        const localUrl = await fetchAndSaveImage(b.id, `/images/${b.image}`);
        if (localUrl) urls[b.id] = localUrl;
      }
    }
    setImageUrls(urls);
    setImagesLoading(false); // Loader OFF kad završi
  }
  if (books.length > 0) loadBookImages();
  else setImagesLoading(false); // Ako nema knjiga, nema ni slika

  return () => {
    Object.values(imageUrls).forEach(url => URL.revokeObjectURL(url));
  };
  // eslint-disable-next-line
}, [books]);



  return (
    <div className="admin-page">

      {/* Navigacija */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/home")}
          className="admin-nav-btn"
          style={{ padding: "7px 14px", borderRadius: "6px", fontWeight: "bold", background: "#e3e7ee", border: "1px solid #a3b0c7", cursor: "pointer" }}
        >
          ⬅️ Početna
        </button>
        <button
          onClick={() => {
            localStorage.removeItem("user_id");
            localStorage.removeItem("user");
            window.location.href = "/";
          }}
          className="admin-nav-btn"
          style={{ padding: "7px 14px", borderRadius: "6px", fontWeight: "bold", background: "#ffc4c4", border: "1px solid #d68c8c", cursor: "pointer" }}
        >
          🚪 Odjavi se
        </button>
      </div>

      <h1>👑 Admin panel</h1>
      {message && <div className="admin-message">{message}</div>}

      <section>
        <h2>👥 Svi korisnici</h2>
        {!isOnline && (
          <div className="admin-offline-msg">⚠️ Brisanje korisnika omogućeno je samo online!</div>
        )}
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Korisničko ime</th>
              <th>Email</th>
              <th>Ime</th>
              <th>Prezime</th>
              <th>Uloga</th>
              <th>Obriši</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.first_name}</td>
                <td>{u.last_name}</td>
                <td>{u.role || "user"}</td>
                <td>
                  {u.role !== "admin" && (
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="admin-delete-btn"
                      title="Obriši korisnika"
                      disabled={!isOnline}
                    >
                      🗑️
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>➕ Dodaj knjigu</h2>
        {!isOnline && (
          <div className="admin-offline-msg">
            ⚠️ Dodavanje knjiga omogućeno je samo online!
          </div>
        )}
        <form className="admin-form" onSubmit={handleAddBook}>
          <input
            type="text"
            placeholder="Naslov"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
            disabled={!isOnline}
          />
          <input
            type="text"
            placeholder="Autor"
            value={form.author}
            onChange={e => setForm({ ...form, author: e.target.value })}
            required
            disabled={!isOnline}
          />
          <input
            type="number"
            placeholder="Godina"
            value={form.year}
            onChange={e => setForm({ ...form, year: e.target.value })}
            required
            disabled={!isOnline}
          />
          <select
            value={form.genre_id}
            onChange={e => setForm({ ...form, genre_id: e.target.value })}
            required
            disabled={!isOnline}
          >
            <option value="">Žanr...</option>
            {genres.map((g, idx) => (
              <option value={idx + 1} key={idx}>{g}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Dostupno primjeraka"
            value={form.available_copies}
            onChange={e => setForm({ ...form, available_copies: e.target.value })}
            required
            disabled={!isOnline}
          />
          <input
            type="text"
            placeholder="Naziv slike (npr. slika.jpg)"
            value={form.image}
            onChange={e => setForm({ ...form, image: e.target.value })}
            disabled={!isOnline}
          />
          <textarea
            placeholder="Opis"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={2}
            disabled={!isOnline}
          />
          <button type="submit" disabled={!isOnline}>Dodaj knjigu</button>
        </form>
      </section>

     {editBook && (
 <section ref={editSectionRef}>
    <h2>✏️ Uredi knjigu</h2>
    {!isOnline && (
      <div className="admin-offline-msg">
        ⚠️ Uređivanje knjiga omogućeno je samo online!
      </div>
    )}
    <form className="admin-form" onSubmit={handleEditBook}>
      <input
        type="text"
        placeholder="Naslov"
        value={editBook.title || ""}
        onChange={e => setEditBook({ ...editBook, title: e.target.value })}
        required
        disabled={!isOnline}
      />
      <input
        type="text"
        placeholder="Autor"
        value={editBook.author || ""}
        onChange={e => setEditBook({ ...editBook, author: e.target.value })}
        required
        disabled={!isOnline}
      />
      <input
        type="number"
        placeholder="Godina"
        value={editBook.year || ""}
        onChange={e => setEditBook({ ...editBook, year: e.target.value })}
        required
        disabled={!isOnline}
      />
      <select
        value={editBook.genre_id || ""}
        onChange={e => setEditBook({ ...editBook, genre_id: e.target.value })}
        required
        disabled={!isOnline}
      >
        <option value="">Žanr...</option>
        {genres.map((g, idx) => (
          <option value={idx + 1} key={idx}>{g}</option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Dostupno primjeraka"
        value={editBook.available_copies || ""}
        onChange={e => setEditBook({ ...editBook, available_copies: e.target.value })}
        required
        disabled={!isOnline}
      />
      <input
        type="text"
        placeholder="Naziv slike (npr. slika.jpg)"
        value={editBook.image || ""}
        onChange={e => setEditBook({ ...editBook, image: e.target.value })}
        disabled={!isOnline}
      />
      <textarea
        placeholder="Opis"
        value={editBook.description || ""}
        onChange={e => setEditBook({ ...editBook, description: e.target.value })}
        rows={2}
        disabled={!isOnline}
      />
      <button type="submit" disabled={!isOnline}>Spremi izmjene</button>
      <button type="button" onClick={() => setEditBook(null)}>Odustani</button>
    </form>
  </section>
)}


     <section>
  <h2>📚 Sve knjige</h2>
  {!isOnline && (
    <div className="admin-offline-msg">
      ⚠️ Brisanje/uređivanje knjiga omogućeno je samo online!
    </div>
  )}
  {imagesLoading ? (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <b>Učitavanje podataka...</b>
    </div>
  ) : (
    <div className="admin-books-list">
      {books.map(b => (
        <div className="admin-book-item" key={b.id}>
          <img
            src={imageUrls[b.id] || `/images/${b.image}`}
            alt={b.title}
            width={80}
            onError={e => {
              e.target.onerror = null;
              e.target.src = "/images/placeholder.png";
            }}
          />
          <div>
            <b>{b.title}</b> <br />
            <i>{b.author}</i> ({b.year}) <br />
            <small>Žanr: {b.genre}</small>
          </div>
          <button
            className="admin-edit-btn"
            onClick={() =>
              setEditBook({
                ...b,
                title: b.title || "",
                author: b.author || "",
                year: b.year || "",
                genre_id: b.genre_id || "",
                available_copies: b.available_copies || "",
                description: b.description || "",
                image: b.image || "",
              })
            }
          >
            ✏️
          </button>
          <button
            className="admin-delete-btn"
            onClick={() => handleDeleteBook(b.id)}
            disabled={!isOnline}
            title={!isOnline ? "Moraš biti online za brisanje!" : "Obriši knjigu"}
          >
            🗑️
          </button>
        </div>
      ))}
    </div>
  )}
</section>

    </div>
  );
}
