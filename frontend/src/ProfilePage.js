/*import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfilePage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [loansVisible, setLoansVisible] = useState(false);
  const [loans, setLoans] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

 const fetchLoans = async () => {
  if (!user.id) {
    setError("ID korisnika nije dostupan.");
    return;
  }
  setLoadingLoans(true);
  setError(null);

  try {
    const response = await fetch(`http://localhost:3001/loans/${user.id}`);
    if (!response.ok) throw new Error("Neuspješan dohvat posudbi.");
    const data = await response.json();

    // Filtriraj posudbe tako da prikazuješ samo jedinstvene knjige (naslov + autor)
    const uniqueLoans = data.reduce((acc, current) => {
      // Provjeri je li knjiga (naslov + autor) već dodana
      if (!acc.find(item => item.title === current.title && item.author === current.author)) {
        acc.push(current);
      }
      return acc;
    }, []);

    setLoans(uniqueLoans);
  } catch (e) {
    setError(e.message);
  } finally {
    setLoadingLoans(false);
  }
};



  const toggleLoans = () => {
    if (!loansVisible) {
      fetchLoans();
    }
    setLoansVisible(!loansVisible);
  };

  const goBackToHomepage = () => {
    navigate("/home");
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f9f9f9", padding: "2rem" }}>
      
   
      <div style={{ position: "absolute", top: "20px", left: "20px" }}>
        <button
          onClick={goBackToHomepage}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          Početna
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "2rem",
          marginTop: "3rem",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            width: "400px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ margin: 0 }}>
              {user.first_name} {user.last_name}
            </h2>
            <p style={{ color: "#555" }}>{user.email}</p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <strong>Korisničko ime:</strong> {user.username}
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <strong>Telefon:</strong> {user.phone || "Nije unesen"}
          </div>

          <button
            onClick={toggleLoans}
            style={{
              marginBottom: "1rem",
              width: "100%",
              padding: "0.8rem",
              backgroundColor: loansVisible ? "#555" : "#3498db",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            {loansVisible ? "Sakrij posudbe" : "Prikaži posudbe"}
          </button>

          <button
            onClick={handleLogout}
            style={{
              marginBottom: "1rem",
              width: "100%",
              padding: "0.8rem",
              backgroundColor: "#2c3e50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Odjavi se
          </button>
        </div>

        {loansVisible && (
          <div
            style={{
              backgroundColor: "white",
              padding: "1rem",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              width: "600px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>
              Posudbe korisnika
            </h3>

            {loadingLoans && <p>Učitavanje posudbi...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {!loadingLoans && loans.length === 0 && (
              <p>Korisnik nema evidentiranih posudbi.</p>
            )}

            <ul style={{ listStyle: "none", padding: 0 }}>
              {loans.map((loan) => (
                <li
                  key={loan.loan_id}
                  style={{
                    display: "flex",
                    marginBottom: "1rem",
                    borderBottom: "1px solid #ddd",
                    paddingBottom: "1rem",
                  }}
                >
                  <img
                    src={`http://localhost:3000/images/${loan.image}`}
                    alt={loan.title}
                    style={{
                      width: "80px",
                      height: "100px",
                      objectFit: "cover",
                      marginRight: "1rem",
                      borderRadius: "8px",
                    }}
                  />
                  <div>
                    <h4 style={{ margin: "0 0 0.25rem 0" }}>{loan.title}</h4>
                    <p style={{ margin: "0 0 0.25rem 0", fontStyle: "italic" }}>
                      Autor: {loan.author}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Datum posudbe:</strong> {loan.loan_date}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Datum vraćanja:</strong> {loan.return_date || "Nije vraćena"}
                    </p>
                    <p style={{ margin: 0 }}>
  <strong>ID knjige:</strong> {loan.book_id}
</p>

                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
*/
/*
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import { getImage, fetchAndSaveLoanImages } from "./indexedDB-utils";

export default function ProfilePage({ user: propUser, onLogout }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(
    propUser || {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      phone: "",
    }
  );

  const [loans, setLoans] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [error, setError] = useState(null);
  const [loansVisible, setLoansVisible] = useState(false);

  const [reviewFormVisible, setReviewFormVisible] = useState({});
  const [rating, setRating] = useState({});
  const [comment, setComment] = useState({});

  // Ref za IndexedDB instancu
  const dbRef = useRef(null);

  // Inicijalizacija korisnika i IndexedDB
  useEffect(() => {
  if (!propUser) {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  } else {
    setUser(propUser);
  }

  initIndexedDB().catch(() => {
    console.error("Nije moguće otvoriti IndexedDB");
  });

  window.addEventListener("online", syncReviews);
  return () => {
    window.removeEventListener("online", syncReviews);
  };
}, [propUser]);


  const goBackToHomepage = () => navigate("/home");

  const handleLogout = () => {
    if (onLogout) onLogout();
    else {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };
const fetchLoans = async () => {
  setLoadingLoans(true);
  setError(null);

  // Čekaj da se IndexedDB inicijalizira prije daljnjih radnji
  if (!dbRef.current) {
    try {
      await initIndexedDB();
    } catch {
      setError("Ne mogu pristupiti lokalnoj bazi podataka.");
      setLoadingLoans(false);
      return;
    }
  }

  try {
    const response = await fetch(`http://localhost:3001/loans/${user.id}`);
    if (!response.ok) throw new Error("Neuspjelo dohvaćanje posudbi.");

    const data = await response.json();

    await fetchAndSaveLoanImages(user.id);

    setLoans(data);
    await saveLoansToIndexedDB(data);
  } catch (err) {
    setError("Niste povezani s internetom. Prikazujem spremljene posudbe.");
    const savedLoans = await getLoansFromIndexedDB();
    const enrichedLoans = await Promise.all(
      savedLoans.map(async (loan) => {
        const imageBlob = await getImage(loan.book_id);
        if (imageBlob) {
          loan.localImageUrl = URL.createObjectURL(imageBlob);
        }
        return loan;
      })
    );
    setLoans(enrichedLoans || []);
  } finally {
    setLoadingLoans(false);
  }
};


  const handleToggleLoans = () => {
  if (loansVisible) {
    setLoans([]);  // brišemo posudbe kad sakrijemo listu
  }
  setLoansVisible(prevVisible => !prevVisible);
};

  // Automatski fetch posudbi kad se lista pokaže
  useEffect(() => {
    if (loansVisible) {
      fetchLoans();
    }
  }, [loansVisible]);

  const toggleReviewForm = (bookId) => {
    setReviewFormVisible((prev) => ({
      ...prev,
      [bookId]: !prev[bookId],
    }));
  };

  const handleReviewSubmit = async (bookId) => {
    const currentRating = rating[bookId];
    const currentComment = comment[bookId];

    if (!currentRating || currentRating < 1 || currentRating > 5) {
      alert("Molimo odaberite ocjenu između 1 i 5.");
      return;
    }

    const reviewData = {
      user_id: user.id,
      book_id: bookId,
      rating: Number(currentRating),
      comment: currentComment || "",
    };

    try {
      if (!navigator.onLine) {
        await saveReviewToIndexedDB(reviewData);
        alert("Recenzija spremljena offline. Sinkronizirat će se kad se povežete.");
      } else {
        await sendReviewToServer(reviewData);
        alert("Recenzija je uspješno poslana.");
      }

      // Reset forme
      setReviewFormVisible((prev) => ({ ...prev, [bookId]: false }));
      setRating((prev) => ({ ...prev, [bookId]: "" }));
      setComment((prev) => ({ ...prev, [bookId]: "" }));
    } catch (err) {
      alert("Greška pri slanju recenzije.");
    }
  };

  // --- IndexedDB funkcije ---
const initIndexedDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("LibraryDB", 5);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("loans")) {
        db.createObjectStore("loans", { keyPath: "loan_id" });
      }
      if (!db.objectStoreNames.contains("reviews")) {
        db.createObjectStore("reviews", { autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("images")) {
        db.createObjectStore("images");
      }
    };

    request.onsuccess = (event) => {
      dbRef.current = event.target.result;
      resolve();
    };

    request.onerror = () => {
      console.error("Greška pri otvaranju IndexedDB.");
      reject();
    };
  });
};



  const saveLoansToIndexedDB = async (loans) => {
    if (!dbRef.current) return;
    const transaction = dbRef.current.transaction("loans", "readwrite");
    const store = transaction.objectStore("loans");
    loans.forEach((loan) => store.put(loan));
    // Optional: handle transaction.oncomplete/onerror
  };

  const getLoansFromIndexedDB = () => {
    return new Promise((resolve) => {
      if (!dbRef.current) return resolve([]);
      const transaction = dbRef.current.transaction("loans", "readonly");
      const store = transaction.objectStore("loans");
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve([]);
    });
  };

  const saveReviewToIndexedDB = (review) => {
    return new Promise((resolve, reject) => {
      if (!dbRef.current) return reject();
      const transaction = dbRef.current.transaction("reviews", "readwrite");
      const store = transaction.objectStore("reviews");
      const request = store.add(review);
      request.onsuccess = () => resolve();
      request.onerror = () => reject();
    });
  };

  const syncReviews = () => {
    if (!navigator.onLine || !dbRef.current) return;

    const transaction = dbRef.current.transaction("reviews", "readwrite");
    const store = transaction.objectStore("reviews");
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = async () => {
      const reviews = getAllRequest.result;

      for (const review of reviews) {
        try {
          await sendReviewToServer(review);
        } catch (e) {
          console.error("Neuspjela sinkronizacija recenzije", review);
        }
      }

      store.clear();
    };
  };

  const sendReviewToServer = async (review) => {
    const response = await fetch("http://localhost:3001/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(review),
    });

    if (!response.ok) throw new Error("Greška pri slanju na server.");
  };

  // --- UI ---

  return (
    <div className="profile-container">
      <div>
        <button onClick={goBackToHomepage} className="back-button">
          Početna
        </button>
      </div>

      <div className="main-flex">
        <div className="profile-card">
          <div className="profile-header">
            <p>👤</p>
            <h2>
              {user.first_name} {user.last_name}
            </h2>
            <p>{user.email}</p>
          </div>

          <div className="user-info">
            <strong>Korisničko ime:</strong> {user.username}
          </div>
          <div className="user-info">
            <strong>Telefon:</strong> {user.phone || "Nije unesen"}
          </div>

          <button
            onClick={handleToggleLoans}
            className={`loans-toggle-button ${loansVisible ? "active" : ""}`}
          >
            {loansVisible ? "Sakrij posudbe" : "Prikaži posudbe"}
          </button>

          <button onClick={handleLogout} className="logout-button">
            Odjavi se
          </button>
        </div>

        {loansVisible && (
          <div className="loans-card">
            <h3>Posudbe korisnika</h3>

            {loadingLoans && <p>Učitavanje posudbi...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loadingLoans && loans.length === 0 && (
              <p>Korisnik nema evidentiranih posudbi.</p>
            )}

            <ul className="loans-list">
              {loans.map((loan) => (
                <li key={loan.loan_id} className="loan-item">
                  <div className="loan-item-header">
                    <img
                      src={
                        loan.localImageUrl
                          ? loan.localImageUrl
                          : `http://localhost:3000/images/${loan.image}`
                      }
                      alt={loan.title}
                    />
                    <div>
                      <h4>{loan.title}</h4>
                      <p className="author">Autor: {loan.author}</p>
                      <p>
                        <strong>Datum posudbe:</strong> {loan.loan_date}
                      </p>
                      <p>
                        <strong>Datum vraćanja:</strong>{" "}
                        {loan.return_date || "Nije vraćena"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleReviewForm(loan.book_id)}
                    className="review-toggle-button"
                  >
                    {reviewFormVisible[loan.book_id]
                      ? "Sakrij recenziju"
                      : "Dodaj recenziju"}
                  </button>

                  {reviewFormVisible[loan.book_id] && (
                    <div className="review-form">
                      <label>
                        Ocjena (1-5):
                        <select
                          value={rating[loan.book_id] || ""}
                          onChange={(e) =>
                            setRating((prev) => ({
                              ...prev,
                              [loan.book_id]: e.target.value,
                            }))
                          }
                        >
                          <option value="">Odaberi</option>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        Komentar:
                        <textarea
                          value={comment[loan.book_id] || ""}
                          onChange={(e) =>
                            setComment((prev) => ({
                              ...prev,
                              [loan.book_id]: e.target.value,
                            }))
                          }
                        />
                      </label>

                      <button
                        onClick={() => handleReviewSubmit(loan.book_id)}
                        className="submit-review-button"
                      >
                        Pošalji recenziju
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

Radi offline dohvat posudbi ali ne i spremanje recenzija */



/*
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import { getImage, fetchAndSaveLoanImages } from "./indexedDB-utils";

export default function ProfilePage({ user: propUser, onLogout }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(
    propUser || {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      phone: "",
    }
  );

  const [loans, setLoans] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [error, setError] = useState(null);
  const [loansVisible, setLoansVisible] = useState(false);

  const [reviewFormVisible, setReviewFormVisible] = useState({});
  const [rating, setRating] = useState({});
  const [comment, setComment] = useState({});

  const dbRef = useRef(null);

  const getUserIdByEmail = async (email) => {
    const db = dbRef.current;
    if (!db || !email) return null;

    try {
      const tx = db.transaction("users", "readonly");
      const store = tx.objectStore("users");
      const index = store.index("email_idx");
      const user = await index.get(email);
      return user?.id || null;
    } catch (err) {
      console.error("Error in getUserIdByEmail:", err);
      return null;
    }
  };

 const syncReviews = useCallback(() => {
  console.log("syncReviews called", navigator.onLine, !!dbRef.current);
  if (!navigator.onLine || !dbRef.current) return;

  const transaction = dbRef.current.transaction("reviews", "readonly");
  const store = transaction.objectStore("reviews");
  const getAllRequest = store.getAll();

  getAllRequest.onsuccess = async () => {
    const allReviews = getAllRequest.result;
    const pendingReviews = allReviews.filter((r) => r.status !== "synced");

    console.log("Broj offline recenzija za sinkronizaciju:", pendingReviews.length);

    for (let review of pendingReviews) {
      if (!review.user_id && review.user_email) {
        review.user_id = await getUserIdByEmail(review.user_email);
      }

      if (!review.user_id || !review.book_id || !review.rating) {
        console.warn("Preskačem nekompletnu recenziju:", review);
        continue;
      }

      try {
        await sendReviewToServer(review);

        // Nakon uspješnog slanja, ažuriraj status u IndexedDB
        const updateTx = dbRef.current.transaction("reviews", "readwrite");
        const updateStore = updateTx.objectStore("reviews");
        const updatedReview = { ...review, status: "synced" };
        updateStore.put(updatedReview);
      } catch (e) {
        console.error("Neuspjela sinkronizacija recenzije", review, e);
      }
    }

    // ✅ (opcionalno) Dohvati najnovije recenzije s backenda i spremi ih lokalno
    try {
      const syncedReviews = await fetchReviewsFromServer(user.id);
      const tx = dbRef.current.transaction("reviews", "readwrite");
      const store = tx.objectStore("reviews");
      syncedReviews.forEach((review) => {
        const reviewWithStatus = { ...review, status: "synced" };
        store.put(reviewWithStatus);
      });
    } catch (e) {
      console.error("Greška pri dohvaćanju recenzija s backend servera:", e);
    }
  };

  getAllRequest.onerror = () => {
    console.error("Greška pri dohvaćanju recenzija iz IndexedDB za sinkronizaciju.");
  };
}, [user.id]);


  useEffect(() => {
    if (!propUser) {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } else {
      setUser(propUser);
      localStorage.setItem("user", JSON.stringify(propUser));
    }

    initIndexedDB()
  .then(() => {
    console.log("IndexedDB inicijaliziran");
    syncReviews(); // odmah pokreni sinkronizaciju ako smo online
  })

      .catch(() => {
        console.error("Nije moguće otvoriti IndexedDB");
      });

    window.addEventListener("online", syncReviews);

    return () => {
      window.removeEventListener("online", syncReviews);
    };
  }, [propUser, syncReviews]);

  const goBackToHomepage = () => navigate("/home");

  const handleLogout = () => {
    if (onLogout) onLogout();
    else {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const fetchLoans = async () => {
    if (!user.id) {
      setError("Korisnički ID nije dostupan.");
      return;
    }
    setLoadingLoans(true);
    setError(null);

    if (!dbRef.current) {
      try {
        await initIndexedDB();
      } catch (initErr) {
        console.error("Greška pri inicijalizaciji IndexedDB:", initErr);
        setError("Ne mogu pristupiti lokalnoj bazi podataka.");
        setLoadingLoans(false);
        return;
      }
    }

    try {
      const response = await fetch(`http://localhost:3001/loans/${user.id}`);
      if (!response.ok) throw new Error("Neuspjelo dohvaćanje posudbi.");

      const data = await response.json();

      await fetchAndSaveLoanImages(user.id);

      setLoans(data);
      await saveLoansToIndexedDB(data);
    } catch (err) {
      console.error("Greška u fetchLoans:", err);
      setError("Niste povezani s internetom. Prikazujem spremljene posudbe.");

      try {
        const savedLoans = await getLoansFromIndexedDB();

        const enrichedLoans = await Promise.all(
          savedLoans.map(async (loan) => {
            try {
              const imageBlob = await getImage(loan.book_id);
              if (imageBlob) {
                loan.localImageUrl = URL.createObjectURL(imageBlob);
                // Moguće kasnije osloboditi memoriju pozivom URL.revokeObjectURL ako je potrebno
              }
            } catch (imgErr) {
              console.error(`Greška pri dohvaćanju slike za knjigu ${loan.book_id}:`, imgErr);
            }
            return loan;
          })
        );

        setLoans(enrichedLoans || []);
      } catch (offlineErr) {
        console.error("Greška kod dohvaćanja posudbi iz IndexedDB:", offlineErr);
        setLoans([]);
      }
    } finally {
      setLoadingLoans(false);
    }
  };

  const handleToggleLoans = () => {
    if (loansVisible) {
      // Oslobodi memoriju URL-ova slika ako ih ima (opcionalno)
      loans.forEach((loan) => {
        if (loan.localImageUrl) {
          URL.revokeObjectURL(loan.localImageUrl);
        }
      });
      setLoans([]); // brišemo posudbe kad sakrijemo listu
    }
    setLoansVisible((prevVisible) => !prevVisible);
  };

  useEffect(() => {
    if (loansVisible) {
      const safeFetchLoans = async () => {
        try {
          await fetchLoans();
        } catch (err) {
          console.error("Greška prilikom poziva fetchLoans:", err);
        }
      };

      safeFetchLoans();
    }
  }, [loansVisible]);

  const toggleReviewForm = (bookId) => {
    setReviewFormVisible((prev) => ({
      ...prev,
      [bookId]: !prev[bookId],
    }));
  };

  const handleReviewSubmit = async (bookId) => {
    const currentRating = rating[bookId];
    const currentComment = comment[bookId];

    let userId = user.id;
    if (!userId && user.email) {
      userId = await getUserIdByEmail(user.email);
    }

    if (!userId) {
      alert("Korisnik nije prepoznat. Nije moguće poslati recenziju.");
      return;
    }

    if (!currentRating || currentRating < 1 || currentRating > 5) {
      alert("Molimo odaberite ocjenu između 1 i 5.");
      return;
    }

    const reviewData = {
      id: crypto.randomUUID(),
      user_id: userId,
      book_id: bookId,
      rating: Number(currentRating),
      comment: currentComment || "",
    };

    try {
      if (!navigator.onLine) {
        console.log("Review koji se sprema offline:", reviewData);
          // Dodaj status polje za offline recenzije
  const offlineReview = { ...reviewData, status: "pending" };

        await saveReviewToIndexedDB(offlineReview);
        alert("Recenzija spremljena offline. Sinkronizirat će se kad se povežete.");
      } else {
        await sendReviewToServer(reviewData);
        alert("Recenzija je uspješno poslana.");
      }

      setReviewFormVisible((prev) => ({ ...prev, [bookId]: false }));
      setRating((prev) => ({ ...prev, [bookId]: "" }));
      setComment((prev) => ({ ...prev, [bookId]: "" }));
    } catch (err) {
      console.error("Greška pri slanju recenzije:", err);
      alert("Greška pri slanju recenzije: " + err.message);
    }
  };
const fetchReviewsFromServer = async (userId) => {
  try {
    const res = await fetch(`http://localhost:3001/reviews/user/${userId}`);
    if (!res.ok) throw new Error("Neuspjelo dohvaćanje recenzija sa servera");
    return await res.json();
  } catch (err) {
    console.error("Greška u fetchReviewsFromServer:", err);
    return [];
  }
};

  // --- IndexedDB funkcije ---
  const initIndexedDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("LibraryDB", 8);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains("loans")) {
          db.createObjectStore("loans", { keyPath: "loan_id" });
        }
        if (!db.objectStoreNames.contains("reviews")) {
          db.createObjectStore("reviews", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("users")) {
          const userStore = db.createObjectStore("users", { keyPath: "id" });
          userStore.createIndex("email_idx", "email", { unique: true });
        }
        if (!db.objectStoreNames.contains("images")) {
          db.createObjectStore("images");
        }
      };

      request.onsuccess = (event) => {
        dbRef.current = event.target.result;
        resolve();
      };

      request.onerror = () => {
        console.error("Greška pri otvaranju IndexedDB.");
        reject();
      };
    });
  };

  const saveLoansToIndexedDB = async (loans) => {
    if (!dbRef.current) return;
    const transaction = dbRef.current.transaction("loans", "readwrite");
    const store = transaction.objectStore("loans");
    loans.forEach((loan) => store.put(loan));
  };

  const getLoansFromIndexedDB = () => {
    return new Promise((resolve) => {
      if (!dbRef.current) return resolve([]);
      const transaction = dbRef.current.transaction("loans", "readonly");
      const store = transaction.objectStore("loans");
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve([]);
    });
  };

  const saveReviewToIndexedDB = (review) => {
  return new Promise((resolve, reject) => {
    if (!dbRef.current) {
      console.error("saveReviewToIndexedDB: dbRef.current je null");
      return reject(new Error("IndexedDB nije inicijalizirana"));
    }

    if (!review.id) {
      review.id = crypto.randomUUID();
    }

    const transaction = dbRef.current.transaction("reviews", "readwrite");
    const store = transaction.objectStore("reviews");
    const request = store.put(review);

    request.onsuccess = () => {
      console.log("Recenzija je spremljena u IndexedDB:", review);
      resolve();
    };

    request.onerror = (event) => {
      console.error("Greška pri spremanju recenzije u IndexedDB:", event.target.error);
      reject(event.target.error);
    };
  });
};


  const sendReviewToServer = async (review) => {
    const response = await fetch("http://localhost:3001/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(review),
    });

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}: ${responseText}`);
    }
  };

  return (
    <div className="profile-container">
      <div>
        <button onClick={goBackToHomepage} className="back-button">
          Početna
        </button>
      </div>

      <div className="main-flex">
        <div className="profile-card">
          <div className="profile-header">
            <p>👤</p>
            <h2>
              {user.first_name} {user.last_name}
            </h2>
            <p>{user.email}</p>
          </div>

          <div className="user-info">
            <strong>Korisničko ime:</strong> {user.username}
          </div>
          <div className="user-info">
            <strong>Telefon:</strong> {user.phone || "Nije unesen"}
          </div>

          <button
            onClick={handleToggleLoans}
            className={`loans-toggle-button ${loansVisible ? "active" : ""}`}
          >
            {loansVisible ? "Sakrij posudbe" : "Prikaži posudbe"}
          </button>

          <button onClick={handleLogout} className="logout-button">
            Odjavi se
          </button>
        </div>

        {loansVisible && (
          <div className="loans-card">
            <h3>Posudbe korisnika</h3>

            {loadingLoans && <p>Učitavanje posudbi...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loadingLoans && loans.length === 0 && (
              <p>Korisnik nema evidentiranih posudbi.</p>
            )}

            <ul className="loans-list">
              {loans.map((loan) => (
                <li key={loan.loan_id} className="loan-item">
                  <div className="loan-item-header">
                    <img
                      src={
                        loan.localImageUrl
                          ? loan.localImageUrl
                          : `http://localhost:3000/images/${loan.image}`
                      }
                      alt={loan.title}
                    />
                    <div>
                      <h4>{loan.title}</h4>
                      <p className="author">Autor: {loan.author}</p>
                      <p>
                        <strong>Datum posudbe:</strong> {loan.loan_date}
                      </p>
                      <p>
                        <strong>Datum vraćanja:</strong>{" "}
                        {loan.return_date || "Nije vraćena"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleReviewForm(loan.book_id)}
                    className="review-toggle-button"
                  >
                    {reviewFormVisible[loan.book_id]
                      ? "Sakrij recenziju"
                      : "Dodaj recenziju"}
                  </button>

                  {reviewFormVisible[loan.book_id] && (
                    <div className="review-form">
                      <label>
                        Ocjena (1-5):
                        <select
                          value={rating[loan.book_id] || ""}
                          onChange={(e) =>
                            setRating((prev) => ({
                              ...prev,
                              [loan.book_id]: e.target.value,
                            }))
                          }
                        >
                          <option value="">Odaberi</option>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        Komentar:
                        <textarea
                          value={comment[loan.book_id] || ""}
                          onChange={(e) =>
                            setComment((prev) => ({
                              ...prev,
                              [loan.book_id]: e.target.value,
                            }))
                          }
                        />
                      </label>

                      <button
                        onClick={() => handleReviewSubmit(loan.book_id)}
                        className="submit-review-button"
                      >
                        Pošalji recenziju
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

*/

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import { getImage, fetchAndSaveImage,
  saveReviewOffline,
  syncPendingReviews,
  saveReviews,
  loadReviews,
    savePendingReturn,
  getAllPendingReturns,
  deletePendingReturn
 
} from "./indexedDB-utils";

export default function ProfilePage({ user: propUser, onLogout }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(
    propUser || {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      phone: "",
    }
  );

  const [loans, setLoans] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [error, setError] = useState(null);
  const [loansVisible, setLoansVisible] = useState(false);

  const [reviewFormVisible, setReviewFormVisible] = useState({});
  const [rating, setRating] = useState({});
  const [comment, setComment] = useState({});
  const [reviewStatus, setReviewStatus] = useState({}); // za ispis nakon slanja

  const dbRef = useRef(null);

  // --- IndexedDB inicijalizacija ---
  const initIndexedDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("LibraryDB", 10);

    request.onupgradeneeded = (event) => {
  const db = event.target.result;
  if (!db.objectStoreNames.contains("loans")) {
    db.createObjectStore("loans", { keyPath: "loan_id" });
  }
  if (!db.objectStoreNames.contains("reviews")) {
    const revStore = db.createObjectStore("reviews", { keyPath: "id" });
    revStore.createIndex("book_id_idx", "book_id", { unique: false });
    revStore.createIndex("status_idx", "status", { unique: false });
  }
  if (!db.objectStoreNames.contains("users")) {
    const userStore = db.createObjectStore("users", { keyPath: "id" });
    userStore.createIndex("email_idx", "email", { unique: true });
  }
  if (!db.objectStoreNames.contains("images")) {
    db.createObjectStore("images");
  }
if (!db.objectStoreNames.contains("pending_returns")) {
  db.createObjectStore("pending_returns", { keyPath: "id", autoIncrement: true });
}

  
};


      request.onsuccess = (event) => {
        dbRef.current = event.target.result;
        resolve();
      };

      request.onerror = () => {
        console.error("Greška pri otvaranju IndexedDB.");
        reject();
      };
    });
  };

  // --- Spremanje i dohvat loans iz IndexedDB ---
  const saveLoansToIndexedDB = async (loans) => {
    if (!dbRef.current) return;
    const transaction = dbRef.current.transaction("loans", "readwrite");
    const store = transaction.objectStore("loans");
    loans.forEach((loan) => store.put(loan));
  };

  const getLoansFromIndexedDB = () => {
    return new Promise((resolve) => {
      if (!dbRef.current) return resolve([]);
      const transaction = dbRef.current.transaction("loans", "readonly");
      const store = transaction.objectStore("loans");
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve([]);
    });
  };

  // --- Sinkronizacija recenzija na online event ---
  const handleSyncReviews = useCallback(async () => {
    if (navigator.onLine) {
      await syncPendingReviews(); // util funkcija za sinkronizaciju svih pending recenzija
    }
  }, []);

  // --- On mount: user info + IndexedDB + event listener ---
 useEffect(() => {
  // Prvo: provjeri je li IndexedDB već otvoren
  if (!dbRef.current) {
    initIndexedDB()
      .then(() => handleSyncReviews())
      .catch((err) => console.error("Nije moguće otvoriti IndexedDB:", err));
  } else {
    // Ako je već otvoren, samo syncaj
    handleSyncReviews();
  }

  window.addEventListener("online", handleSyncReviews);

  return () => {
    window.removeEventListener("online", handleSyncReviews);
  };
}, [propUser, handleSyncReviews]);


  const goBackToHomepage = () => navigate("/home");

  const handleLogout = () => {
    if (onLogout) onLogout();
    else {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  // --- Dohvati posudbe ---
  const fetchLoans = async () => {
    if (!user.id) {
      setError("Korisnički ID nije dostupan.");
      return;
    }
    setLoadingLoans(true);
    setError(null);

    if (!dbRef.current) {
      try {
        await initIndexedDB();
      } catch (initErr) {
        console.error("Greška pri inicijalizaciji IndexedDB:", initErr);
        setError("Ne mogu pristupiti lokalnoj bazi podataka.");
        setLoadingLoans(false);
        return;
      }
    }

    try {
      const response = await fetch(`http://localhost:3001/loans/${user.id}`);
      if (!response.ok) throw new Error("Neuspjelo dohvaćanje posudbi.");

      const data = await response.json();
      await fetchAndSaveImage(user.id);
      setLoans(data);
      await saveLoansToIndexedDB(data);
    } catch (err) {
      setError("Niste povezani s internetom. Prikazujem spremljene posudbe.");
      try {
        const savedLoans = await getLoansFromIndexedDB();
        const enrichedLoans = await Promise.all(
          savedLoans.map(async (loan) => {
            try {
              const imageBlob = await getImage(loan.book_id);
              if (imageBlob) {
                loan.localImageUrl = URL.createObjectURL(imageBlob);
              }
            } catch (imgErr) {}
            return loan;
          })
        );
        setLoans(enrichedLoans || []);
      } catch (offlineErr) {
        setLoans([]);
      }
    } finally {
      setLoadingLoans(false);
    }
  };

  // --- Toggle loans prikaz ---
  const handleToggleLoans = () => {
    if (loansVisible) {
      loans.forEach((loan) => {
        if (loan.localImageUrl) {
          URL.revokeObjectURL(loan.localImageUrl);
        }
      });
      setLoans([]);
    }
    setLoansVisible((prevVisible) => !prevVisible);
  };

  useEffect(() => {
    if (loansVisible) {
      fetchLoans();
    }
  }, [loansVisible]);

  // --- Slanje recenzije (online i offline) ---
  const handleReviewSubmit = async (bookId) => {
    const currentRating = rating[bookId];
    const currentComment = comment[bookId];

    let userId = user.id;
    if (!userId && user.email) {
      // Ako trebaš dohvatiti ID iz IndexedDB prema emailu, možeš dodati helper
      userId = undefined;
    }

    if (!userId) {
      alert("Korisnik nije prepoznat. Nije moguće poslati recenziju.");
      return;
    }
    if (!currentRating || currentRating < 1 || currentRating > 5) {
      alert("Molimo odaberite ocjenu između 1 i 5.");
      return;
    }

    const reviewData = {
      id: crypto.randomUUID(),
      user_id: userId,
      book_id: bookId,
      rating: Number(currentRating),
      comment: currentComment || "",
    };

    try {
      if (!navigator.onLine) {
        await saveReviewOffline(reviewData); // util funkcija za offline spremanje
        
        setReviewStatus((prev) => ({
          ...prev,
          [bookId]: "Recenzija spremljena offline. Sinkronizirat će se kad se povežete."
        }));
      } else {
        await fetch("http://localhost:3001/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reviewData),
        });
        setReviewStatus((prev) => ({
          ...prev,
          [bookId]: "Recenzija je uspješno poslana."
        }));
      }
      setReviewFormVisible((prev) => ({ ...prev, [bookId]: false }));
      setRating((prev) => ({ ...prev, [bookId]: "" }));
      setComment((prev) => ({ ...prev, [bookId]: "" }));
    } catch (err) {
      alert("Greška pri slanju recenzije: " + err.message);
    }
  };

const handleReturnBook = async (loan_id) => {
  if (!loan_id) return;

  if (!navigator.onLine) {
    // Spremi za kasniju sinkronizaciju
    await savePendingReturn(loan_id);

    // LOKALNO updateaj prikaz da odmah sakriješ gumb i označiš kao vraćenu:
    setLoans(loans =>
      loans.map(l =>
        l.loan_id === loan_id ? { ...l, return_date: "pending_offline" } : l
      )
    );
    alert("Zahtjev za povrat spremljen offline. Sinkronizirat će se kad budeš online.");
    return;
  }

  // ONLINE povrat
  try {
    const res = await fetch(`http://localhost:3001/loans/${loan_id}/return`, { method: "PATCH" });
    if (!res.ok) throw new Error("Povrat nije uspio");
    alert("Knjiga je vraćena!");
    await fetchLoans(); // Refresha listu posudbi
  } catch (e) {
    alert("Greška pri povratu knjige.");
  }
};

const syncPendingReturns = async () => {
  const pending = await getAllPendingReturns();
  for (const ret of pending) {
    try {
      const res = await fetch(`http://localhost:3001/loans/${ret.loan_id}/return`, { method: "PATCH" });
      if (res.ok) {
        await deletePendingReturn(ret.id);
      }
    } catch (e) {
      // Greška, pokušaj kasnije opet
      console.error("Greška pri sinkronizaciji povrata:", e);
    }
  }
  // Poželjno je ponovno dohvatiti posudbe!
  await fetchLoans();
};


useEffect(() => {
  const handleStatusChange = async () => {
    if (navigator.onLine) {
      await syncPendingReviews();
      await syncPendingReturns();  // sinkronizacija offline povrata
    }
    await fetchLoans?.(); // refresha posudbe samo na ovoj stranici!
  };
  window.addEventListener("online", handleStatusChange);
  window.addEventListener("offline", handleStatusChange);
  handleStatusChange();
  return () => {
    window.removeEventListener("online", handleStatusChange);
    window.removeEventListener("offline", handleStatusChange);
  };
}, []);

  // --- Prikaz ---
  return (
    <div className="profile-container">
      <div>
        <button onClick={goBackToHomepage} className="back-button">
          Početna
        </button>
      </div>

      <div className="main-flex">
        <div className="profile-card">
          <div className="profile-header">
            <p>👤</p>
            <h2>
              {user.first_name} {user.last_name}
            </h2>
            <p>{user.email}</p>
          </div>

          <div className="user-info">
            <strong>Korisničko ime:</strong> {user.username}
          </div>
          <div className="user-info">
            <strong>Telefon:</strong> {user.phone || "Nije unesen"}
          </div>

          <button
            onClick={handleToggleLoans}
            className={`loans-toggle-button ${loansVisible ? "active" : ""}`}
          >
            {loansVisible ? "Sakrij posudbe" : "Prikaži posudbe"}
          </button>

          <button onClick={handleLogout} className="logout-button">
            Odjavi se
          </button>
        </div>

        {loansVisible && (
          <div className="loans-card">
            <h3>Posudbe korisnika</h3>
            {loadingLoans && <p>Učitavanje posudbi...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loadingLoans && loans.length === 0 && (
              <p>Korisnik nema evidentiranih posudbi.</p>
            )}

            <ul className="loans-list">
              {loans.map((loan) => (
                <li key={loan.loan_id} className="loan-item">
                  <div className="loan-item-header">
                    <img
                      src={
                        loan.localImageUrl
                          ? loan.localImageUrl
                          : `http://localhost:3000/images/${loan.image}`
                      }
                      alt={loan.title}
                    />
                    <div>
                      <h4>{loan.title}</h4>
                      <p className="author">Autor: {loan.author}</p>
                      <p>
                        <strong>Datum posudbe:</strong> {loan.loan_date}
                      </p>
                      <p>
  <strong>Datum vraćanja:</strong>{" "}
  {loan.return_date === "pending_offline"
    ? "Čeka povrat (offline)"
    : loan.return_date || "Nije vraćena"}
</p>

                    </div>
                  </div>
                  {!loan.return_date && (
  <button onClick={() => handleReturnBook(loan.loan_id)}>
    Vrati knjigu
  </button>
)}


                  <button
                    onClick={() => setReviewFormVisible((prev) => ({
                      ...prev,
                      [loan.book_id]: !prev[loan.book_id]
                    }))}
                    className="review-toggle-button"
                  >
                    {reviewFormVisible[loan.book_id]
                      ? "Sakrij recenziju"
                      : "Dodaj recenziju"}
                  </button>

                  {reviewFormVisible[loan.book_id] && (
                    <div className="review-form">
                      <label>
                        Ocjena (1-5):
                        <select
                          value={rating[loan.book_id] || ""}
                          onChange={(e) =>
                            setRating((prev) => ({
                              ...prev,
                              [loan.book_id]: e.target.value,
                            }))
                          }
                        >
                          <option value="">Odaberi</option>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        Komentar:
                        <textarea
                          value={comment[loan.book_id] || ""}
                          onChange={(e) =>
                            setComment((prev) => ({
                              ...prev,
                              [loan.book_id]: e.target.value,
                            }))
                          }
                        />
                      </label>

                      <button
                        onClick={() => handleReviewSubmit(loan.book_id)}
                        className="submit-review-button"
                      >
                        Pošalji recenziju
                      </button>
                    </div>
                  )}

                  {/* PORUKA O STATUSU RECENZIJE */}
                  {reviewStatus[loan.book_id] && (
                    <div className="review-status-msg">{reviewStatus[loan.book_id]}</div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
