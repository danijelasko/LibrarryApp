
/*import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const HomePage = ({ user }) => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);

  const navigate = useNavigate();
  const detailsRef = useRef(null); // referenca na detalje knjige

  // Scrollaj na detalje kada se odabere knjiga
  useEffect(() => {
    if (selectedBook && detailsRef.current) {
      detailsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedBook]);

  // Dohvati knjige i žanrove
  useEffect(() => {
    fetch("http://localhost:3001/books")
      .then((res) => res.json())
      .then((data) => {
         console.log("Dohvaćene knjige:", data);
        setBooks(data);
        setFilteredBooks(data);
      })
      .catch((err) => console.error("Greška pri dohvatu knjiga:", err));

    fetch("http://localhost:3001/genres")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setGenres(data);
        } else {
          console.error("Očekivao sam niz žanrova, ali dobio:", data);
          setGenres([]);
        }
      })
      .catch((err) => {
        console.error("Greška pri dohvatu žanrova:", err);
        setGenres([]);
      });
  }, []);

  useEffect(() => {
    if (selectedGenre === "" || selectedGenre === "Svi žanrovi") {
      setFilteredBooks(books);
    } else {
      setFilteredBooks(books.filter(book => book.genre === selectedGenre));
    }
    setSelectedBook(null);
  }, [selectedGenre, books]);



  const handleLoan = (bookId) => {
  fetch("http://localhost:3001/loans", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user_id: user.id,
      book_id: bookId
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.message) {
        alert(data.message);
      } else if (data.error) {
        alert("Greška: " + data.error);
      }
    })
    .catch(err => {
      console.error("Greška pri posudbi:", err);
      alert("Greška pri pokušaju posudbe.");
    });
};


  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>
      
      
      <div style={{ width: "250px", backgroundColor: "#f0f0f0", padding: "1.5rem", display: "flex", flexDirection: "column" }}>
        <button 
          onClick={() => navigate("/profile")}
          style={{
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#2c3e50",
            color: "white",
            cursor: "pointer"
          }}
        >
          Profil
        </button>

        <h3>Filtriraj po žanru</h3>
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
        >
          <option value="">Svi žanrovi</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
      </div>

    
      <div style={{ flex: 1, padding: "1.5rem", overflowY: "auto", position: "relative" }}>
        <div style={{ position: "absolute", top: "1rem", right: "1rem", fontWeight: "bold" }}>
          Dobrodošao, {user.first_name || user.email}!
        </div>

        <h1>Knjige</h1>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {filteredBooks.length === 0 && <p>Nema knjiga za prikaz.</p>}
          {filteredBooks.map(book => (
            <div
              key={book.id}
              onClick={() => setSelectedBook(book)}
              style={{
                cursor: "pointer",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
                width: "200px",
                boxShadow: selectedBook && selectedBook.id === book.id ? "0 0 10px #2c3e50" : "none"
              }}
            >
              <img 
                src={`/images/${book.image}`} 
                alt={book.title} 
                style={{ width: "100%", height: "auto", marginBottom: "0.5rem", borderRadius: "4px" }} 
              />
              <h3>{book.title}</h3>
              <p><i>{book.author}</i></p>
              <p><b>Žanr:</b> {book.genre}</p>
              <button
  onClick={(e) => {
    e.stopPropagation();
    handleLoan(book.id);
  }}
  style={{
    marginTop: "0.5rem",
    padding: "8px 12px",
    backgroundColor: "#2c3e50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  }}
>
  Dodaj u posudbe
</button>



            </div>
            
          ))}
        </div>

       
        {selectedBook && (
          <div
            ref={detailsRef} // referenca za scroll
            style={{ marginTop: "2rem", padding: "1rem", borderTop: "1px solid #ccc" }}
          >
            <h2>{selectedBook.title}</h2>
            <p><b>Autor:</b> {selectedBook.author}</p>
            <p><b>Žanr:</b> {selectedBook.genre}</p>
            <p><b>Opis:</b> {selectedBook.description || "Nema opisa."}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;


*/
/*


import "./Homepage.css";

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { openDB } from "idb";
import { saveReviews, loadReviews } from './indexedDB-utils';


const HomePage = ({ user }) => {

  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [imageUrls, setImageUrls] = useState({}); // bookId -> objectURL
  const [onlineBooksLoaded, setOnlineBooksLoaded] = useState(false);

  const navigate = useNavigate();
  const detailsRef = useRef(null);

  // --- IndexedDB setup ---
  const initDB = () => {
    return openDB("LibraryDB", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("books")) {
          db.createObjectStore("books", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("genres")) {
          db.createObjectStore("genres", { keyPath: "id", autoIncrement: true });
        }
        if (!db.objectStoreNames.contains("images")) {
          db.createObjectStore("images");
        }
      },
    });
  };

  // Spremanje i učitavanje knjiga, žanrova, slika u IndexedDB
  const saveBooksToIndexedDB = async (books) => {
    const db = await initDB();
    const tx = db.transaction("books", "readwrite");
    const store = tx.objectStore("books");
    await store.clear();
    for (const book of books) {
      await store.put(book);
    }
    await tx.done;
  };

  const saveGenresToIndexedDB = async (genres) => {
    const db = await initDB();
    const tx = db.transaction("genres", "readwrite");
    const store = tx.objectStore("genres");
    await store.clear();
    for (const genre of genres) {
      await store.put({ name: genre });
    }
    await tx.done;
  };



  const loadBooksFromIndexedDB = async () => {
    const db = await initDB();
    return await db.getAll("books");
  };

  const loadGenresFromIndexedDB = async () => {
    const db = await initDB();
    const genresFromDB = await db.getAll("genres");
    return genresFromDB.map((g) => g.name);
  };

  // --- Slike ---
  const saveImage = async (key, blob) => {
    const db = await initDB();
    const tx = db.transaction("images", "readwrite");
    const store = tx.objectStore("images");
    await store.put(blob, key);
    await tx.done;
  };

  const getImage = async (key) => {
    const db = await initDB();
    const tx = db.transaction("images", "readonly");
    const store = tx.objectStore("images");
    const blob = await store.get(key);
    await tx.done;
    return blob;
  };

  const fetchImageAsBlob = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image");
    return await response.blob();
  };

  const fetchAndSaveImage = async (bookId, imageUrl) => {
    try {
      const blob = await fetchImageAsBlob(imageUrl);
      await saveImage(bookId, blob);
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error("Error fetching and saving image:", err);
      return null;
    }
  };

  // Funkcija za učitavanje slike za knjigu, ovisno o online statusu
  const loadImageForBook = async (book, isOnline) => {
    if (!isOnline) {
      // offline - uzmi iz IndexedDB
      const blob = await getImage(book.id);
      if (blob) {
        console.log("Dohvaćam sliku iz OFFLINE baze (IndexedDB) za knjigu:", book.title);
        return URL.createObjectURL(blob);
      } else {
        return "/images/default-book.png";
      }
    } else {
      // online - fetchaj i spremi u IndexedDB
      const imageUrl = `/images/${book.image}`;
      console.log("Dohvaćam sliku iz ONLINE baze (server) za knjigu:", book.title);
      return await fetchAndSaveImage(book.id, imageUrl);
    }
  };

  // Glavna funkcija za dohvat knjiga i slika ovisno o online statusu
  useEffect(() => {
    const fetchBooksAndGenres = async () => {
      if (navigator.onLine) {
        try {
          console.log("Online: pokušavam dohvatiti knjige i žanrove s servera...");
          // Dohvati knjige online
          const resBooks = await fetch("http://localhost:3001/books");
          if (!resBooks.ok) throw new Error("Neuspješan dohvat knjiga s servera");
          const dataBooks = await resBooks.json();

          // Dohvati žanrove online
          const resGenres = await fetch("http://localhost:3001/genres");
          if (!resGenres.ok) throw new Error("Neuspješan dohvat žanrova s servera");
          const dataGenres = await resGenres.json();

          setBooks(dataBooks);
          setFilteredBooks(dataBooks);
          setGenres(dataGenres);

          // Spremi u IndexedDB za offline
          await saveBooksToIndexedDB(dataBooks);
          await saveGenresToIndexedDB(dataGenres);

          setOnlineBooksLoaded(true);

          // Učitaj slike za svaku knjigu (fetch i spremi u IndexedDB)
          const urls = {};
          for (const book of dataBooks) {
            urls[book.id] = (await loadImageForBook(book, true)) || "/images/default-book.png";
          }
          setImageUrls(urls);

          console.log("Online dohvat i spremanje knjiga, žanrova i slika završen.");
        } catch (error) {
          console.error("Greška pri online dohvaćanju:", error);
          // Ako online dohvat ne uspije, pali offline način
          await loadOfflineData();
        }
      } else {
        // Nema interneta - učitaj iz IndexedDB
        await loadOfflineData();
      }
    };

    const loadOfflineData = async () => {
      console.log("Offline: učitavam knjige, žanrove i slike iz IndexedDB...");
      const offlineBooks = await loadBooksFromIndexedDB();
      const offlineGenres = await loadGenresFromIndexedDB();
      setBooks(offlineBooks);
      setFilteredBooks(offlineBooks);
      setGenres(offlineGenres);
      setOnlineBooksLoaded(false);

      // Učitaj slike iz IndexedDB
      const urls = {};
      for (const book of offlineBooks) {
        urls[book.id] = (await loadImageForBook(book, false)) || "/images/default-book.png";
      }
      setImageUrls(urls);

      console.log("Offline dohvat završen.");
    };

    fetchBooksAndGenres();

    // Event listeneri za promjenu online statusa (ako želiš dinamički refresh)
    const handleOnline = () => fetchBooksAndGenres();
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // Filtriranje knjiga po žanru
  useEffect(() => {
    if (selectedGenre === "" || selectedGenre === "Svi žanrovi") {
      setFilteredBooks(books);
    } else {
      setFilteredBooks(books.filter((book) => book.genre === selectedGenre));
    }
    setSelectedBook(null);
  }, [selectedGenre, books]);

  // Dohvat recenzija za odabranu knjigu (ovaj dio ostaje online)
  useEffect(() => {
    if (selectedBook) {
      fetch(`http://localhost:3001/reviews/${selectedBook.id}`)
        .then((res) => res.json())
        .then((data) => {
           console.log("Recenzije za knjigu", selectedBook.title, data);
          if (Array.isArray(data)) {
            setReviews(data);
          } else {
            console.error("Neočekivan format recenzija:", data);
            setReviews([]);
          }
        })
        .catch(() => {
          setReviews([]);
        });
    } else {
      setReviews([]);
    }
  }, [selectedBook]);

  // Posudba knjige (ostaje online)
  const handleLoan = (bookId) => {
    fetch("http://localhost:3001/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, book_id: bookId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) alert(data.message);
        else if (data.error) alert("Greška: " + data.error);
      })
      .catch(() => alert("Greška pri posudbi knjige"));
  };


useEffect(() => {
  if (selectedBook && detailsRef.current) {
    detailsRef.current.scrollIntoView({ behavior: "smooth" });
  }
}, [selectedBook]);


  return (
    <div className="homepage">
      <h1>Dobro došli, {user.name}</h1>

       <button
    onClick={() => navigate("/profile")}
    className="btn-profile"
  >
    Profil
  </button>

      <div className="filter">
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
        >
          <option value="">Svi žanrovi</option>
          {genres.map((genre, i) => (
            <option key={i} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      <div className="book-list">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            className={`book-item ${
              selectedBook && selectedBook.id === book.id ? "selected" : ""
            }`}
            onClick={() => setSelectedBook(book)}
          >
            <img
              src={imageUrls[book.id] || "/images/default-book.png"}
              alt={book.title}
              width={100}
              height={150}
              loading="lazy"
            />
            <div>
              <h3>{book.title}</h3>
              <p>{book.author}</p>
              <p>Žanr: {book.genre}</p>
              <button onClick={(e) => {
                e.stopPropagation();
                handleLoan(book.id);
              }}>Posudi</button>
            </div>
          </div>
        ))}
      </div>

      {selectedBook && (
        <div className="book-details" ref={detailsRef}>
          <h2>{selectedBook.title}</h2>
          <p>Autor: {selectedBook.author}</p>
          <p>Žanr: {selectedBook.genre}</p>
          <h3>Recenzije:</h3>
          {reviews.length > 0 ? (
            <ul>
              {reviews.map((review) => (
                <li key={review.id}>{review.comment}</li>
              ))}
            </ul>
          ) : (
            <p>Nema recenzija za ovu knjigu.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;


radi offline dohvat knjiga
*/
/*



import "./Homepage.css";

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { openDB } from "idb";
import { saveReviews, loadReviews } from './indexedDB-utils';


const HomePage = ({ user }) => {

  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [imageUrls, setImageUrls] = useState({}); // bookId -> objectURL
  const [onlineBooksLoaded, setOnlineBooksLoaded] = useState(false);

  const navigate = useNavigate();
  const detailsRef = useRef(null);

  // --- IndexedDB setup ---
  const initDB = () => {
    return openDB("LibraryDB", 5, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("books")) {
          db.createObjectStore("books", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("genres")) {
          db.createObjectStore("genres", { keyPath: "id", autoIncrement: true });
        }
        if (!db.objectStoreNames.contains("images")) {
          db.createObjectStore("images");
        }
      },
    });
  };

  // Spremanje i učitavanje knjiga, žanrova, slika u IndexedDB
  const saveBooksToIndexedDB = async (books) => {
    const db = await initDB();
    const tx = db.transaction("books", "readwrite");
    const store = tx.objectStore("books");
    await store.clear();
    for (const book of books) {
      await store.put(book);
    }
    await tx.done;
  };

  const saveGenresToIndexedDB = async (genres) => {
    const db = await initDB();
    const tx = db.transaction("genres", "readwrite");
    const store = tx.objectStore("genres");
    await store.clear();
    for (const genre of genres) {
      await store.put({ name: genre });
    }
    await tx.done;
  };



  const loadBooksFromIndexedDB = async () => {
    const db = await initDB();
    return await db.getAll("books");
  };

  const loadGenresFromIndexedDB = async () => {
    const db = await initDB();
    const genresFromDB = await db.getAll("genres");
    return genresFromDB.map((g) => g.name);
  };

  // --- Slike ---
  const saveImage = async (key, blob) => {
    const db = await initDB();
    const tx = db.transaction("images", "readwrite");
    const store = tx.objectStore("images");
    await store.put(blob, key);
    await tx.done;
  };

  const getImage = async (key) => {
    const db = await initDB();
    const tx = db.transaction("images", "readonly");
    const store = tx.objectStore("images");
    const blob = await store.get(key);
    await tx.done;
    return blob;
  };

  const fetchImageAsBlob = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image");
    return await response.blob();
  };

  const fetchAndSaveImage = async (bookId, imageUrl) => {
    try {
      const blob = await fetchImageAsBlob(imageUrl);
      await saveImage(bookId, blob);
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error("Error fetching and saving image:", err);
      return null;
    }
  };

  // Funkcija za učitavanje slike za knjigu, ovisno o online statusu
  const loadImageForBook = async (book, isOnline) => {
    if (!isOnline) {
      // offline - uzmi iz IndexedDB
      const blob = await getImage(book.id);
      if (blob) {
        console.log("Dohvaćam sliku iz OFFLINE baze (IndexedDB) za knjigu:", book.title);
        return URL.createObjectURL(blob);
      } else {
        return "/images/default-book.png";
      }
    } else {
      // online - fetchaj i spremi u IndexedDB
      const imageUrl = `/images/${book.image}`;
      console.log("Dohvaćam sliku iz ONLINE baze (server) za knjigu:", book.title);
      return await fetchAndSaveImage(book.id, imageUrl);
    }
  };

  // Glavna funkcija za dohvat knjiga i slika ovisno o online statusu
  useEffect(() => {
    const fetchBooksAndGenres = async () => {
      if (navigator.onLine) {
        try {
          console.log("Online: pokušavam dohvatiti knjige i žanrove s servera...");
          // Dohvati knjige online
          const resBooks = await fetch("http://localhost:3001/books");
          if (!resBooks.ok) throw new Error("Neuspješan dohvat knjiga s servera");
          const dataBooks = await resBooks.json();

          // Dohvati žanrove online
          const resGenres = await fetch("http://localhost:3001/genres");
          if (!resGenres.ok) throw new Error("Neuspješan dohvat žanrova s servera");
          const dataGenres = await resGenres.json();

          setBooks(dataBooks);
          setFilteredBooks(dataBooks);
          setGenres(dataGenres);

          // Spremi u IndexedDB za offline
          await saveBooksToIndexedDB(dataBooks);
          await saveGenresToIndexedDB(dataGenres);

          setOnlineBooksLoaded(true);

          // Učitaj slike za svaku knjigu (fetch i spremi u IndexedDB)
          const urls = {};
          for (const book of dataBooks) {
            urls[book.id] = (await loadImageForBook(book, true)) || "/images/default-book.png";
          }
          setImageUrls(urls);

          console.log("Online dohvat i spremanje knjiga, žanrova i slika završen.");
        } catch (error) {
          console.error("Greška pri online dohvaćanju:", error);
          // Ako online dohvat ne uspije, pali offline način
          await loadOfflineData();
        }
      } else {
        // Nema interneta - učitaj iz IndexedDB
        await loadOfflineData();
      }
    };

    const loadOfflineData = async () => {
      console.log("Offline: učitavam knjige, žanrove i slike iz IndexedDB...");
      const offlineBooks = await loadBooksFromIndexedDB();
      const offlineGenres = await loadGenresFromIndexedDB();
      setBooks(offlineBooks);
      setFilteredBooks(offlineBooks);
      setGenres(offlineGenres);
      setOnlineBooksLoaded(false);

      // Učitaj slike iz IndexedDB
      const urls = {};
      for (const book of offlineBooks) {
        urls[book.id] = (await loadImageForBook(book, false)) || "/images/default-book.png";
      }
      setImageUrls(urls);

      console.log("Offline dohvat završen.");
    };

    fetchBooksAndGenres();

    // Event listeneri za promjenu online statusa (ako želiš dinamički refresh)
    const handleOnline = () => fetchBooksAndGenres();
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // Filtriranje knjiga po žanru
  useEffect(() => {
    if (selectedGenre === "" || selectedGenre === "Svi žanrovi") {
      setFilteredBooks(books);
    } else {
      setFilteredBooks(books.filter((book) => book.genre === selectedGenre));
    }
    setSelectedBook(null);
  }, [selectedGenre, books]);

  useEffect(() => {
  const fetchReviewsOnline = async (bookId) => {
    try {
      const res = await fetch(`http://localhost:3001/reviews/${bookId}`);
      if (!res.ok) throw new Error('Neuspješan dohvat recenzija');
      const data = await res.json();

      if (Array.isArray(data)) {
        setReviews(data);
        await saveReviews(bookId, data); // spremi u IndexedDB
      } else {
        console.error("Neočekivan format recenzija:", data);
        setReviews([]);
      }
    } catch (error) {
      console.error("Greška pri dohvaćanju recenzija online:", error);
      setReviews([]);
    }
  };

  const fetchReviewsOffline = async (bookId) => {
    const offlineReviews = await loadReviews(bookId);
    setReviews(offlineReviews);
  };

  if (selectedBook) {
    if (navigator.onLine) {
      fetchReviewsOnline(selectedBook.id);
    } else {
      fetchReviewsOffline(selectedBook.id);
    }
  } else {
    setReviews([]);
  }
}, [selectedBook]);

  // Posudba knjige (ostaje online)
  const handleLoan = (bookId) => {
    fetch("http://localhost:3001/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, book_id: bookId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) alert(data.message);
        else if (data.error) alert("Greška: " + data.error);
      })
      .catch(() => alert("Greška pri posudbi knjige"));
  };


useEffect(() => {
  if (selectedBook && detailsRef.current) {
    detailsRef.current.scrollIntoView({ behavior: "smooth" });
  }
}, [selectedBook]);


  return (
    <div className="homepage">
      <h1>Dobro došli, {user.name}</h1>

       <button
    onClick={() => navigate("/profile")}
    className="btn-profile"
  >
    Profil
  </button>

      <div className="filter">
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
        >
          <option value="">Svi žanrovi</option>
          {genres.map((genre, i) => (
            <option key={i} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      <div className="book-list">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            className={`book-item ${
              selectedBook && selectedBook.id === book.id ? "selected" : ""
            }`}
            onClick={() => setSelectedBook(book)}
          >
            <img
              src={imageUrls[book.id] || "/images/default-book.png"}
              alt={book.title}
              width={100}
              height={150}
              loading="lazy"
            />
            <div>
              <h3>{book.title}</h3>
              <p>{book.author}</p>
              <p>Žanr: {book.genre}</p>
              <button onClick={(e) => {
                e.stopPropagation();
                handleLoan(book.id);
              }}>Posudi</button>
            </div>
          </div>
        ))}
      </div>

      {selectedBook && (
        <div className="book-details" ref={detailsRef}>
          <h2>{selectedBook.title}</h2>
          <p>Autor: {selectedBook.author}</p>
          <p>Žanr: {selectedBook.genre}</p>
          <h3>Recenzije:</h3>
          {reviews.length > 0 ? (
            <ul>
              {reviews.map((review) => (
                <li key={review.id}>{review.comment}</li>
              ))}
            </ul>
          ) : (
            <p>Nema recenzija za ovu knjigu.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
*//*
import "./Homepage.css";
import axios from 'axios';

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { openDB } from "idb";
import { saveReviews, loadReviews } from './indexedDB-utils';
import { initDB } from './indexedDB-utils'; // prilagodi putanju ako treba

const HomePage = ({ user }) => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [onlineBooksLoaded, setOnlineBooksLoaded] = useState(false);

  const navigate = useNavigate();
  const detailsRef = useRef(null);

  useEffect(() => {
    initDB().then(() => {
      console.log("IndexedDB initialized");
    });
  }, []);

  const saveBooksToIndexedDB = async (books) => {
    const db = await initDB();
    const tx = db.transaction("books", "readwrite");
    const store = tx.objectStore("books");
    await store.clear();
    for (const book of books) {
      await store.put(book);
    }
    await tx.done;
  };

  const saveGenresToIndexedDB = async (genres) => {
    const db = await initDB();
    const tx = db.transaction("genres", "readwrite");
    const store = tx.objectStore("genres");
    await store.clear();
    for (let i = 0; i < genres.length; i++) {
      await store.put({ id: i, name: genres[i] });
    }
    await tx.done;
  };

  const loadBooksFromIndexedDB = async () => {
    const db = await initDB();
    return await db.getAll("books");
  };

  const loadGenresFromIndexedDB = async () => {
    const db = await initDB();
    const genresFromDB = await db.getAll("genres");
    return genresFromDB.map((g) => g.name);
  };

  const saveImage = async (key, blob) => {
    const db = await initDB();
    const tx = db.transaction("images", "readwrite");
    const store = tx.objectStore("images");
    await store.put(blob, key);
    await tx.done;
  };

  const getImage = async (key) => {
    const db = await initDB();
    const tx = db.transaction("images", "readonly");
    const store = tx.objectStore("images");
    const blob = await store.get(key);
    await tx.done;
    return blob;
  };

  const fetchImageAsBlob = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image");
    return await response.blob();
  };

  const fetchAndSaveImage = async (bookId, imageUrl) => {
    try {
      const blob = await fetchImageAsBlob(imageUrl);
      await saveImage(bookId, blob);
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error("Error fetching and saving image:", err);
      return null;
    }
  };

  const loadImageForBook = async (book, isOnline) => {
    if (!isOnline) {
      const blob = await getImage(book.id);
      if (blob) {
        console.log("Dohvaćam sliku iz OFFLINE baze (IndexedDB) za knjigu:", book.title);
        return URL.createObjectURL(blob);
      } else {
        return "/images/default-book.png";
      }
    } else {
      const imageUrl = `/images/${book.image}`;
      console.log("Dohvaćam sliku iz ONLINE baze (server) za knjigu:", book.title);
      return await fetchAndSaveImage(book.id, imageUrl);
    }
  };

  useEffect(() => {
    const fetchBooksAndGenres = async () => {
      if (navigator.onLine) {
        try {
          console.log("Online: pokušavam dohvatiti knjige i žanrove s servera...");
          const resBooks = await fetch("http://localhost:3001/books");
          if (!resBooks.ok) throw new Error("Neuspješan dohvat knjiga s servera");
          const dataBooks = await resBooks.json();

          const resGenres = await fetch("http://localhost:3001/genres");
          if (!resGenres.ok) throw new Error("Neuspješan dohvat žanrova s servera");
          const dataGenres = await resGenres.json();

          setBooks(dataBooks);
          setFilteredBooks(dataBooks);
          setGenres(dataGenres);

          await saveBooksToIndexedDB(dataBooks);
          await saveGenresToIndexedDB(dataGenres);

          setOnlineBooksLoaded(true);

          const urls = {};
          for (const book of dataBooks) {
            urls[book.id] = (await loadImageForBook(book, true)) || "/images/default-book.png";
          }
          setImageUrls(urls);

          console.log("Online dohvat i spremanje knjiga, žanrova i slika završen.");
        } catch (error) {
          console.error("Greška pri online dohvaćanju:", error);
          await loadOfflineData();
        }
      } else {
        await loadOfflineData();
      }
    };

    const loadOfflineData = async () => {
      console.log("Offline: učitavam knjige, žanrove i slike iz IndexedDB...");
      const offlineBooks = await loadBooksFromIndexedDB();
      const offlineGenres = await loadGenresFromIndexedDB();
      setBooks(offlineBooks);
      setFilteredBooks(offlineBooks);
      setGenres(offlineGenres);
      setOnlineBooksLoaded(false);

      const urls = {};
      for (const book of offlineBooks) {
        urls[book.id] = (await loadImageForBook(book, false)) || "/images/default-book.png";
      }
      setImageUrls(urls);

      console.log("Offline dohvat završen.");
    };

    fetchBooksAndGenres();

    const handleOnline = () => fetchBooksAndGenres();
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  useEffect(() => {
    if (selectedGenre === "" || selectedGenre === "Svi žanrovi") {
      setFilteredBooks(books);
    } else {
      setFilteredBooks(books.filter((book) => book.genre === selectedGenre));
    }
    setSelectedBook(null);
  }, [selectedGenre, books]);

  useEffect(() => {
  const fetchReviewsOnline = async (bookId) => {
    try {
      // Dohvati recenzije sa servera
      const res = await fetch(`http://localhost:3001/reviews/${bookId}`);
      if (!res.ok) throw new Error('Neuspješan dohvat recenzija');
      const serverReviews = await res.json();

      // Dohvati sve recenzije iz IndexedDB za tu knjigu (uključujući pending)
      const offlineReviews = await loadReviews(bookId);

      // Filtriraj offline recenzije koje nisu još sinkronizirane
      const pendingReviews = offlineReviews.filter(r => r.status !== "synced");

      // Spoji recenzije - ako isti ID postoji, uzmi server verziju
      const mergedMap = new Map();
      serverReviews.forEach(r => mergedMap.set(r.id, { ...r, status: "synced" }));
      pendingReviews.forEach(r => {
        if (!mergedMap.has(r.id)) {
          mergedMap.set(r.id, r);
        }
      });

      const mergedReviews = Array.from(mergedMap.values());

      // Postavi u React state
      setReviews(mergedReviews);

      // Spremi spojene recenzije u IndexedDB
      await saveReviews(bookId, mergedReviews);

    } catch (error) {
      console.error("Greška pri dohvaćanju recenzija online:", error);
      setReviews([]);
    }
  };

  const fetchReviewsOffline = async (bookId) => {
    const offlineReviews = await loadReviews(bookId);
    setReviews(offlineReviews);
  };

  if (selectedBook) {
    if (navigator.onLine) {
      fetchReviewsOnline(selectedBook.id);
    } else {
      fetchReviewsOffline(selectedBook.id);
    }
  } else {
    setReviews([]);
  }
}, [selectedBook]);


  const handleLoan = async (bookId) => {
    console.log("Posuđujem knjigu s ID-om:", bookId);

    const user_id = parseInt(localStorage.getItem("user_id"));
    if (!user_id || !bookId) return;

    if (!navigator.onLine) {
      const db = await openDB('LibraryDB', 8);
      const tx = db.transaction("pendingLoans", "readwrite");
      const store = tx.objectStore("pendingLoans");
      await store.add({ id: Date.now(), user_id, bookId }); // Dodan ID
      await tx.done;
      alert("Posudba spremljena offline i bit će sinkronizirana kad se povežeš na internet.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/loans", {
        user_id,
        bookId,
      });

      if (response.status === 201) {
        alert("Knjiga posuđena!");
      }
    } catch (error) {
      console.error("Greška pri posudbi:", error);
      alert("Greška pri posudbi.");
    }
  };

  useEffect(() => {
    const syncPendingLoans = async () => {
      const db = await openDB('LibraryDB', 8);
      const tx = db.transaction("pendingLoans", "readonly");
      const store = tx.objectStore("pendingLoans");
      const allLoans = await store.getAll();

      for (const loan of allLoans) {
        try {
          const response = await axios.post("http://localhost:3001/loans", {
            user_id: loan.user_id,
            book_id: loan.bookId,
          });

          if (response.status === 201) {
            const deleteTx = db.transaction("pendingLoans", "readwrite");
            const deleteStore = deleteTx.objectStore("pendingLoans");
            await deleteStore.delete(loan.id); // Mora postojati ID
            await deleteTx.done;
          }
        } catch (err) {
          console.error("Greška pri sinkronizaciji posudbe:", err);
        }
      }
    };

    window.addEventListener("online", syncPendingLoans);
    return () => window.removeEventListener("online", syncPendingLoans);
  }, []);

  useEffect(() => {
    if (selectedBook && detailsRef.current) {
      detailsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedBook]);

  return (
    <div className="homepage">
      <h1>Dobro došli, {user.name}</h1>

      <button
        onClick={() => navigate("/profile")}
        className="btn-profile"
      >
        Profil
      </button>

      <div className="filter">
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
        >
          <option value="">Svi žanrovi</option>
          {genres.map((genre, i) => (
            <option key={i} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      <div className="book-list">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            className={`book-item ${selectedBook && selectedBook.id === book.id ? "selected" : ""}`}
            onClick={() => setSelectedBook(book)}
          >
            <img
              src={imageUrls[book.id] || "/images/default-book.png"}
              alt={book.title}
              width={100}
              height={150}
              loading="lazy"
            />
            <div>
              <h3>{book.title}</h3>
              <p>{book.author}</p>
              <p>Žanr: {book.genre}</p>
              <button onClick={(e) => {
                e.stopPropagation();
                handleLoan(book.id);
              }}>Posudi</button>
            </div>
          </div>
        ))}
      </div>

      {selectedBook && (
        <div className="book-details" ref={detailsRef}>
          <h2>{selectedBook.title}</h2>
          <p>Autor: {selectedBook.author}</p>
          <p>Žanr: {selectedBook.genre}</p>
          <h3>Recenzije:</h3>
          {reviews.length > 0 ? (
            <ul>
              {reviews.map((review) => (
                <li key={review.id}>{review.comment}</li>
              ))}
            </ul>
          ) : (
            <p>Nema recenzija za ovu knjigu.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
*/

import "./Homepage.css";
import axios from 'axios';
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  saveBooks,
  getAllBooks,
  saveGenres,
  getAllGenres,
  fetchAndSaveImage,
  getImage,
  savePendingLoan,
  getAllPendingLoans,
  deletePendingLoan,
    saveMyActiveLoansOffline,
  getMyActiveLoansOffline,
  saveReviews,
  loadReviews,
  syncPendingReviews

} from './indexedDB-utils';

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

  const navigate = useNavigate();
  const detailsRef = useRef(null);

  // --- Funkcija za slike ---
  const loadImageForBook = async (book, online) => {
  if (!online) {
    const blob = await getImage(book.id);
    if (blob) {
      return URL.createObjectURL(blob);
    }
    // Fallback ako ni to ne postoji, koristi embedded placeholder:
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

  // --- Dohvati aktivne posudbe korisnika (return_date == null) ---
const fetchActiveLoans = async () => {
  const user_id = parseInt(localStorage.getItem("user_id"));
  if (!user_id) return;
  if (navigator.onLine) {
    try {
      const res = await fetch(`http://localhost:3001/loans/${user_id}`);
      const data = await res.json();
      const active = data.filter(loan => loan.return_date == null);
      setMyActiveLoans(active);
      // NOVO: Spremi aktivne posudbe offline
      await saveMyActiveLoansOffline(active);
    } catch (e) {
      setMyActiveLoans([]);
    }
  } else {
    // OFFLINE: Učitaj aktivne posudbe iz IndexedDB!
    const localLoans = await getMyActiveLoansOffline();
    setMyActiveLoans(localLoans);
  }
};


  // --- Funkcija za offline fallback ---
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

  // --- SINKRONIZACIJA offline posudbi ---
const syncPendingLoans = async () => {
  console.log("syncPendingLoans POKRENUT");
  const pendingLoans = await getAllPendingLoans();
  for (const loan of pendingLoans) {
    try {
      console.log("Šaljem offline loan:", loan);
      const response = await axios.post("http://localhost:3001/loans", {
        user_id: loan.user_id,
        book_id: loan.book_id,
      });
      if (response.status === 201) {
        await deletePendingLoan(loan.id);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "";
      // Ako znaš da je to "nemoguća" posudba, automatski briši:
      if (
        errorMessage.includes("Već ste posudili ovu knjigu") ||
        errorMessage.includes("Nema dostupnih primjeraka")
      ) {
        await deletePendingLoan(loan.id);
        alert(errorMessage + " (Lokalna offline posudba uklonjena iz reda.)");
      }
      console.error("Greška pri sinkronizaciji offline posudbe:", err);
    }
  }
  await fetchBooksAndGenres();
  await fetchActiveLoans();
};


  // --- JEDINI useEffect za online/offline status i sync ---
  useEffect(() => {
    const handleStatusChange = async () => {
  setIsOnline(navigator.onLine);
  if (navigator.onLine) {
    await syncPendingLoans();
    await syncPendingReviews();
    // *** DODANO: Ako je prikazana knjiga, osvježi recenzije ***
    if (selectedBook) {
      await fetchReviews(selectedBook.id);
    }
  }
  await fetchBooksAndGenres();
  await fetchActiveLoans();
};


    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);

    // Init na mount
    handleStatusChange();

    return () => {
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
    };
  }, []);

  // --- Filter knjiga po žanru ---
  useEffect(() => {
    setFilteredBooks(
      selectedGenre === "" || selectedGenre === "Svi žanrovi"
        ? books
        : books.filter((book) => book.genre === selectedGenre)
    );
    setSelectedBook(null);
  }, [selectedGenre, books]);

  // --- POSUDBA KNJIGE ---
  const handleLoan = async (bookId) => {
  const user_id = parseInt(localStorage.getItem("user_id"));
  if (!user_id || !bookId) return;

  if (!navigator.onLine) {
    await savePendingLoan({ user_id, book_id: bookId });

    // DODANO: odmah lokalno dodaj u myActiveLoans
    setMyActiveLoans(prev => [
      ...prev,
      { book_id: bookId, user_id, id: Date.now(), return_date: null }
    ]);

    alert("Posudba spremljena offline i bit će sinkronizirana kad se povežeš na internet.");
    return;
  }

  try {
    const response = await axios.post("http://localhost:3001/loans", { user_id, book_id: bookId });
    if (response.status === 201) {
      alert("Knjiga posuđena!");
      await fetchBooksAndGenres();
      await fetchActiveLoans(); // da se odmah sakrije gumb
    } else if (response.data && response.data.message) {
      alert(response.data.message);
    }
  } catch (error) {
    alert("Greška pri posudbi.");
  }
};

//Dohvat recenzija
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
      await saveReviews(bookId, data); // Spremi za offline!
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
}, [selectedBook]);








  // Automatski scroll do detalja kad korisnik odabere knjigu
useEffect(() => {
  if (selectedBook && detailsRef.current) {
    detailsRef.current.scrollIntoView({ behavior: "smooth" });
  }
}, [selectedBook]);


  // --- Prikaz knjiga s onemogućenim "Posudi" ---
  return (
    <div className="homepage">
      <div className={`status-badge ${isOnline ? "online" : "offline"}`}>
        {isOnline ? "ONLINE" : "OFFLINE"}
      </div>
      <h1>Dobro došli, {user.name || user.first_name || user.username}</h1>
      <button onClick={() => navigate("/profile")} className="btn-profile">Profil</button>
      <div className="filter">
        <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
          <option value="">Svi žanrovi</option>
          {genres.map((genre, i) => (
            <option key={i} value={genre}>{genre}</option>
          ))}
        </select>
      </div>
      <div className="book-list">
        {filteredBooks.map((book) => {
          const alreadyLoaned = myActiveLoans.some(loan => loan.book_id === book.id);
          return (
            <div
              key={book.id}
              className={`book-item ${selectedBook && selectedBook.id === book.id ? "selected" : ""}`}
              onClick={() => setSelectedBook(book)}
            >
              <img
                src={imageUrls[book.id] || "/images/default-book.png"}
                alt={book.title}
                width={100}
                height={150}
                loading="lazy"
              />
              <div>
                <h3>{book.title}</h3>
                <p>{book.author}</p>
                <p>Žanr: {book.genre}</p>
                <p>Dostupno primjeraka: {book.available_now} / {book.available_copies}</p>
                {!alreadyLoaned ? (
                  <button onClick={e => {
                    e.stopPropagation();
                    handleLoan(book.id);
                  }}>
                    Posudi
                  </button>
                ) : (
                  <span style={{ color: 'gray', fontWeight: 'bold' }}>
                    Već posuđeno
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {selectedBook && (
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
  );
};

export default HomePage;
