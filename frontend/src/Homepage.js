
import "./Homepage.css";
import axios from 'axios';
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { syncPendingLoans } from "./indexedDB-utils";

import {
  saveBooks,
  getAllBooks,
  saveGenres,
  getAllGenres,
  fetchAndSaveImage,
  getImage,
  savePendingLoan,
  saveReviews,
  loadReviews,
  syncPendingReviews,
  getAllUserLoansCombined, 
} from './indexedDB-utils';

import { syncPendingReturns } from "./indexedDB-utils";

const HomePage = ({ user }) => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [myActiveLoans, setMyActiveLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTitle, setSearchTitle] = useState("");
const [searchAuthor, setSearchAuthor] = useState("");


  const navigate = useNavigate();
  const detailsRef = useRef(null);





//Biranje knjiga prema raspoloženju
const moodToGenre = {
  "tužno": ["Komedija", "Pustolovina", "Fantastika"],
  "veselo": ["Pustolovina", "Fantastika", "Romantika", "Komedija"],
  "umorno": ["Komedija", "Romantika", "Drama"],
  "zaljubljeno": ["Romantika", "Drama"],
  "znatiželjno": ["Povijest", "Fantastika", "Misterija"],
  "avanturistički": ["Pustolovina", "Fantastika", "Triler", "Misterija"],
  "napeto": ["Triler", "Misterija", "Distopija"],
  "za razmišljanje": ["Drama", "Distopija", "Povijest"],
 
};

const [mood, setMood] = useState("");
const [moodSuggestions, setMoodSuggestions] = useState([]);

const handleMoodChange = (e) => {
  const selectedMood = e.target.value;
  setMood(selectedMood);
  const genres = moodToGenre[selectedMood] || [];
  setMoodSuggestions(
    books.filter(book => genres.includes(book.genre))
  );
};



  // --- Funkcija za slike ---
  const loadImageForBook = async (book, online) => {
    if (!online) {
      const blob = await getImage(book.id);
      if (blob) {
        return URL.createObjectURL(blob);
      }
      
      return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='150'><rect width='100' height='150' fill='%23ddd'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='gray' font-size='12'>Nema slike</text></svg>";
    } else {
      const imageUrl = `/images/${book.image}`;
      return await fetchAndSaveImage(book.id, imageUrl) || "/images/default-book.png";
    }
  };

  // --- Dohvat knjiga i žanrova ---
  const fetchBooksAndGenres = async () => {
    if (navigator.onLine) {
      try {
        const resBooks = await fetch("http://localhost:3001/books");
        const dataBooks = await resBooks.json();
        const resGenres = await fetch("http://localhost:3001/genres");
        const dataGenres = await resGenres.json();

        setBooks(dataBooks);
        setFilteredBooks(dataBooks);
        setGenres(dataGenres);

        await saveBooks(dataBooks);
        await saveGenres(dataGenres);

        // Slike
        const urls = {};
        for (const book of dataBooks) {
          urls[book.id] = await loadImageForBook(book, true);
        }
        setImageUrls(urls);

      } catch (error) {
        await loadOfflineData();
      }
    } else {
      await loadOfflineData();
    }
  };

  // Funkcija za offline fallback 
  const loadOfflineData = async () => {
    const offlineBooks = await getAllBooks();
    const offlineGenres = await getAllGenres();
    setBooks(offlineBooks);
    setFilteredBooks(offlineBooks);
    setGenres(offlineGenres);

    const urls = {};
    for (const book of offlineBooks) {
      urls[book.id] = await loadImageForBook(book, false);
    }
    setImageUrls(urls);
  };

  //Dohvati aktivne posudbe korisnika 
  const fetchActiveLoans = async () => {
    const user_id = parseInt(localStorage.getItem("user_id"));
    if (!user_id) {
      setMyActiveLoans([]);
      return;
    }
   
    const allLoans = await getAllUserLoansCombined(user_id);
    // Prikazuj samo AKTIVNE posudbe!
    setMyActiveLoans(allLoans.filter(l => l.return_date == null));
  };



  //useEffect za učitavanje podataka 
  useEffect(() => {
    let ignore = false;
    const fetchEverything = async () => {
      setLoading(true);
      await fetchBooksAndGenres();
      await fetchActiveLoans();
      if (!ignore) setLoading(false);
    };
    fetchEverything();
    return () => { ignore = true };
  }, []);

  //useEffect za online/offline sync 
  useEffect(() => {
    const handleStatusChange = async () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        await syncPendingLoans();
        await syncPendingReturns();
        await syncPendingReviews();
        if (selectedBook) {
          await fetchReviews(selectedBook.id);
        }
      }
      await fetchBooksAndGenres();
      await fetchActiveLoans();
    };
    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);
    return () => {
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
    };
  }, [selectedBook]);

  // Filter knjiga po žanru 
useEffect(() => {
  setFilteredBooks(
    books.filter((book) => { //pravi novi array
      // žanr
      const genreMatch =
        selectedGenre === "" ||
        selectedGenre === "Svi žanrovi" ||
        book.genre === selectedGenre;
      // naslov
      const titleMatch = book.title
        .toLowerCase()
        .includes(searchTitle.toLowerCase());
      // autor
      const authorMatch = book.author
        .toLowerCase()
        .includes(searchAuthor.toLowerCase());
      return genreMatch && titleMatch && authorMatch;
    })
  );
  setSelectedBook(null); //resetiramo trenutno odabranu knjigu
}, [selectedGenre, books, searchTitle, searchAuthor]);


  // POSUDBA KNJIGE
 const handleLoan = async (bookId) => {
  const user_id = parseInt(localStorage.getItem("user_id"));
  if (!user_id || !bookId) return;

  // 1. Provjeri je li već posuđeno
  const alreadyLoaned = myActiveLoans.some(loan => loan.book_id === bookId && loan.return_date == null);
  if (alreadyLoaned) {
    alert("Već ste posudili ovu knjigu!");
    return;
  }

  // 2. Optimistic update za posudbe:
  setMyActiveLoans(prev => [...prev, { book_id: bookId, user_id, id: Date.now(), return_date: null }]); //prije stvarne potvrde od servera

  // 3. Optimistic update za broj primjeraka:
  setBooks(prevBooks => prevBooks.map(book =>
    book.id === bookId
      ? { ...book, available_now: (book.available_now || book.available_copies || 1) - 1 }
      : book
  ));

  // isto i za filteredBooks ako koristiš!
  setFilteredBooks(prevBooks => prevBooks.map(book =>
    book.id === bookId
      ? { ...book, available_now: (book.available_now || book.available_copies || 1) - 1 }
      : book
  ));

  // 4. OFFLINE posudba
  if (!navigator.onLine) {
    await savePendingLoan({ user_id, book_id: bookId });
    alert("Posudba spremljena offline i bit će sinkronizirana kad se povežeš na internet.");
    return;
  }

  // 5. ONLINE — šalji na backend
  try {
    const response = await axios.post("http://localhost:3001/loans", { user_id, book_id: bookId });
    if (response.status === 201) {
      alert("Knjiga posuđena!");
      // NE refrešaj odmah knjige
    } else if (response.data && response.data.message) {
      alert(response.data.message);
      // Otkazuj optimistic update ako je server javio grešku
      setMyActiveLoans(prev => prev.filter(l => l.book_id !== bookId));
      setBooks(prevBooks => prevBooks.map(book =>
        book.id === bookId
          ? { ...book, available_now: (book.available_now || book.available_copies || 1) + 1 }
          : book
      ));
      setFilteredBooks(prevBooks => prevBooks.map(book =>
        book.id === bookId
          ? { ...book, available_now: (book.available_now || book.available_copies || 1) + 1 }
          : book
      ));
    }
  } catch (error) {
    alert("Greška pri posudbi.");
    // Otkazuj optimistic update i za broj primjeraka
    setMyActiveLoans(prev => prev.filter(l => l.book_id !== bookId));
    setBooks(prevBooks => prevBooks.map(book =>
      book.id === bookId
        ? { ...book, available_now: (book.available_now || book.available_copies || 1) + 1 }
        : book
    ));
    setFilteredBooks(prevBooks => prevBooks.map(book =>
      book.id === bookId
        ? { ...book, available_now: (book.available_now || book.available_copies || 1) + 1 }
        : book
    ));
  }
};



  // --- Dohvat recenzija ---
  const fetchReviews = async (bookId) => {
    if (!bookId) {
      setReviews([]);
      return;
    }
    if (navigator.onLine) {
      try {
        const res = await fetch(`http://localhost:3001/reviews/${bookId}`);
        if (!res.ok) throw new Error("Neuspješan dohvat recenzija");
        const data = await res.json();
        setReviews(data);
        await saveReviews(bookId, data);
      } catch (e) {
        const offlineReviews = await loadReviews(bookId);
        setReviews(offlineReviews);
      }
    } else {
      const offlineReviews = await loadReviews(bookId);
      setReviews(offlineReviews);
    }
  };

  useEffect(() => {
    if (selectedBook) {
      fetchReviews(selectedBook.id);
    } else {
      setReviews([]);
    }
  }, [selectedBook ? selectedBook.id : null]);

  // Automatski scroll do detalja kad korisnik odabere knjigu
  useEffect(() => {
    if (selectedBook && detailsRef.current) {
      detailsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedBook]);

  return (
    <div className="homepage">
      <div className={`status-badge ${isOnline ? "online" : "offline"}`}>
        {isOnline ? "ONLINE" : "OFFLINE"}
      </div>
      <div className="sidebar">
  <button onClick={() => navigate("/profile")} className="btn-profile">
    Profil
  </button>
  
  <div className="filter-card">
    <div className="filter-row">
      <span role="img" aria-label="book" className="filter-icon">📚</span>
      <label htmlFor="genre-select" className="filter-label">
        Žanr:
      </label>
      <select
        id="genre-select"
        value={selectedGenre}
        onChange={e => setSelectedGenre(e.target.value)}
        className="filter-select"
      >
        <option value="">Svi žanrovi</option>
        {genres.map((genre, i) => (
          <option key={i} value={genre}>{genre}</option>
        ))}
      </select>
    </div>
    <div className="filter-row">
      <span role="img" aria-label="search" className="filter-icon">🔍</span>
      <input
        type="text"
        placeholder="Pretraži po naslovu..."
        value={searchTitle}
        onChange={e => setSearchTitle(e.target.value)}
        className="filter-input"
      />
    </div>
    <div className="filter-row">
      <span role="img" aria-label="writer" className="filter-icon">✍️</span>
      <input
        type="text"
        placeholder="Pretraži po autoru..."
        value={searchAuthor}
        onChange={e => setSearchAuthor(e.target.value)}
        className="filter-input"
      />
    </div>
    <button
      onClick={() => {
        setSearchTitle("");
        setSearchAuthor("");
        setSelectedGenre("");
      }}
      className="filter-clear"
    >
      🧹 Očisti filtere
    </button>
    <p style={{ margin: "16px 0 0 0", color: "#555", fontSize: ".95em" }}>
      Prikazano <b>{filteredBooks.length}</b> od {books.length} knjiga
    </p>
        </div>

<div className="mood-card">
  <label htmlFor="mood-select" className="mood-label">
    🧠 Kako se osjećaš danas?
  </label>
  <select
    id="mood-select"
    value={mood}
    onChange={handleMoodChange}
    className="mood-select"
  >
    <option value="">Odaberi raspoloženje...</option>
    <option value="tužno">😢 Tužno</option>
    <option value="veselo">😊 Veselo</option>
    <option value="umorno">😴 Umorno</option>
    <option value="zaljubljeno">😍 Zaljubljeno</option>
    <option value="znatiželjno">🧐 Znatiželjno</option>
    <option value="avanturistički">🧭 Avanturistički</option>
 
  </select>

  {mood && (
    <div className="mood-suggestions">
      <div className="mood-suggestions-title">
        <span role="img" aria-label="book">📖</span> Prijedlozi za raspoloženje: <b>{mood}</b>
      </div>
      {moodSuggestions.length === 0 ? (
        <div className="mood-empty">Nema prijedloga za odabrano raspoloženje.</div>
      ) : (
        <ul>
          {moodSuggestions.map(b => (
            <li key={b.id}>
              <span role="img" aria-label="book" className="book-emoji">📗</span>
              {b.title} <span className="mood-genre">({b.genre})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )}
</div>

      </div>

      <div className="main-content">



{user && user.role === "admin" && (
  <button onClick={() => navigate("/admin")} className="admin-btn">
    Admin panel
  </button>
)}

        <div className="welcome">
          Zavirite u ponudu naše knjižnice! <span role="img" aria-label="smile">😊</span>
          <br></br>
          <br></br>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", fontSize: "1.2em", marginTop: 40 }}>
            Učitavanje podataka...
          </div>
          
        ) : (
          
        <div className="book-list">
  {filteredBooks.map((book) => {
    const alreadyLoaned = myActiveLoans.some(
      loan => loan.book_id === book.id && loan.return_date == null
    );
    const nemaNaZalihi = book.available_now === 0; // ili ako imaš drugačiji property, zamijeni

    return (
      <div
        key={book.id}
        className={`book-item ${selectedBook && selectedBook.id === book.id ? "selected" : ""}`}
        onClick={() => setSelectedBook(book)}
      >
        <img
          src={imageUrls[book.id] || "/images/default-book.png"}
          alt={book.title}
          width={165}
          height={220}
          loading="lazy"
        />
        <h3>{book.title}</h3>
        <p><i>{book.author}</i></p>
        <p><b>Žanr:</b> {book.genre}</p>
        <p><b>Dostupno primjeraka:</b> {book.available_now} / {book.available_copies}</p>

        {nemaNaZalihi ? (
          <span style={{ color: 'darkred', fontWeight: 'bold' }}>
            Nema na zalihi
          </span>
        ) : !alreadyLoaned ? (
          <button onClick={e => {
            e.stopPropagation();
            handleLoan(book.id);
          }}>
            Dodaj u posudbe
          </button>
        ) : (
          <span style={{ color: 'gray', fontWeight: 'bold' }}>
            Već posuđeno
          </span>
        )}
      </div>
    );
  })}
</div>
        )}

        {selectedBook && !loading && (
          <div className="book-details" ref={detailsRef}>
            <h2>{selectedBook.title}</h2>
            <p>Autor: {selectedBook.author}</p>
            <p>Žanr: {selectedBook.genre}</p>
            <p>Dostupno primjeraka: {selectedBook.available_now} / {selectedBook.available_copies}</p>
            <h3>Recenzije:</h3>
            {reviews.length === 0 ? (
              <p>Nema recenzija za ovu knjigu.</p>
            ) : (
              <ul>
                {reviews.map(r => (
                  <li key={r.id}>
                    <strong>{r.rating ? `Ocjena: ${r.rating}/5` : ""}</strong>
                    {r.comment && <> - {r.comment}</>}
                    {r.user_email && <small> ({r.user_email})</small>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;