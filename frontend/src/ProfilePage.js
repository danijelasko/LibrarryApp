
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { syncPendingLoans } from "./indexedDB-utils";


import "./ProfilePage.css";
import {
  getImage,
  fetchAndSaveImage,
  saveReviewOffline,
  syncPendingReviews,
  saveReviews,
  loadReviews,
  savePendingReturn,
  getAllPendingReturns,
  deletePendingReturn,
  getAllUserLoansCombined,
  syncPendingReturns,
   saveLoansToIndexedDB
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
      id: null,
    }
  );

  const [loans, setLoans] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [error, setError] = useState(null);
  const [loansVisible, setLoansVisible] = useState(false);
const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [reviewFormVisible, setReviewFormVisible] = useState({});
  const [rating, setRating] = useState({});
  const [comment, setComment] = useState({});
  const [reviewStatus, setReviewStatus] = useState({}); // za ispis nakon slanja



useEffect(() => {
  const handleStatusChange = () => setIsOnline(navigator.onLine);
  window.addEventListener('online', handleStatusChange);
  window.addEventListener('offline', handleStatusChange);
  return () => {
    window.removeEventListener('online', handleStatusChange);
    window.removeEventListener('offline', handleStatusChange);
  };
}, []);




  // --- Sync recenzija ---
  const handleSyncReviews = useCallback(async () => {
    if (navigator.onLine) {
      await syncPendingReviews();
    }
  }, []);

  const goBackToHomepage = () => navigate("/home");

  const handleLogout = () => {
    if (onLogout) onLogout();
    else {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  // --- Dohvat posudbi (online i offline, kombinirano) ---
  const fetchLoans = async () => {
  let id = user.id || propUser?.id;
  if (!id) {
    try {
      const lsUser = JSON.parse(localStorage.getItem("user"));
      id = lsUser?.id;
    } catch { }
  }
  if (!id) {
    setError("Korisnički ID nije dostupan.");
    setLoans([]);
    return;
  }
  setLoadingLoans(true);
  setError(null);

  try {
    
    if (navigator.onLine) {
      // Fetch sa servera, spremi u IndexedDB!
      const response = await fetch(`http://localhost:3001/loans/${id}`);
      if (response.ok) {
        const loansFromServer = await response.json();
        await saveLoansToIndexedDB(loansFromServer, id); // Osvježi IndexedDB!
      }
    }

    //  pokupi sve, kombinirano, iz IndexedDB-a
    const allLoans = await getAllUserLoansCombined(id);

    // Slike 
    const enrichedLoans = await Promise.all(
      allLoans.map(async (loan) => {
        try {
          const imageBlob = await getImage(loan.book_id);
          if (imageBlob) {
            loan.localImageUrl = URL.createObjectURL(imageBlob);
          }
        } catch { }
        return loan;
      })
    );
    setLoans(enrichedLoans || []);
  } catch (err) {
    setError("Greška pri dohvaćanju posudbi.");
    setLoans([]);
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
  }, [loansVisible, user.id]); 

  // --- Slanje recenzije (online i offline) ---
  const handleReviewSubmit = async (bookId) => {
    const currentRating = rating[bookId];
    const currentComment = comment[bookId];

    let userId = user.id;
    if (!userId && user.email) {
     
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
        await saveReviewOffline(reviewData);

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
    await savePendingReturn(loan_id);
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

    // Nakon PATCHA: fetchaj posudbe sa servera i upiši u IndexedDB!
    const lsUser = JSON.parse(localStorage.getItem("user"));
    const userId = lsUser?.id || user.id;

    if (userId) {
      const response = await fetch(`http://localhost:3001/loans/${userId}`);
      if (response.ok) {
        const freshLoans = await response.json();
        await saveLoansToIndexedDB(freshLoans, userId);
      }
    }

    alert("Knjiga je vraćena!");
    await fetchLoans(); 

  } catch (e) {
    alert("Greška pri povratu knjige.");
  }
};



  // Sync na online/offline događaje, refresha loans
  useEffect(() => {
    fetchLoans(); 
    const handleStatusChange = async () => {
      if (navigator.onLine) {
        await syncPendingLoans(user.id);
        await syncPendingReviews();
        await syncPendingReturns();
      }
      await fetchLoans();
    };
    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);
    handleStatusChange();
    return () => {
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
    };
    // eslint-disable-next-line
  }, [user.id]);

  // Sync recenzija na mount
  useEffect(() => {
    handleSyncReviews();
  }, [handleSyncReviews]);

  // --- Prikaz ---
  return (
    <div className="profile-container">



       <div className={`status-badge ${isOnline ? "online" : "offline"}`}>
        {isOnline ? "ONLINE" : "OFFLINE"}
      </div>
      <div>
        <button onClick={goBackToHomepage} className="back-button">
          Početna
        </button>

         
      </div>

      <div className="main-flex">
        <div className="profile-card">
          <div className="profile-avatar">👤</div>
          <h2 style={{ marginTop: 0, marginBottom: "7px" }}>
            {user.first_name} {user.last_name}
          </h2>
          <div className="profile-email">{user.email}</div>

          <div className="user-info">
            <span className="icon">👤</span>
            <strong>Korisničko ime:</strong> {user.username}
          </div>
          <div className="user-info">
            <span className="icon">📞</span>
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
                    <button
                      onClick={() => handleReturnBook(loan.loan_id)}
                      className="vrati_button"
                    >
                      Vrati knjigu
                    </button>
                  )}

                  <button
                    onClick={() =>
                      setReviewFormVisible((prev) => ({
                        ...prev,
                        [loan.book_id]: !prev[loan.book_id],
                      }))
                    }
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
                    <div className="review-status-msg">
                      {reviewStatus[loan.book_id]}
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
