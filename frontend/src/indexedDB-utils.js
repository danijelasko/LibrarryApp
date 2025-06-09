
import { openDB } from 'idb';
import axios from "axios"; 

const DB_NAME = 'LibraryDB';
const DB_VERSION = 11;

const STORE_BOOKS = 'books';
const STORE_GENRES = 'genres';
const STORE_REVIEWS = 'reviews';
const STORE_IMAGES = 'images';
const STORE_LOANS = 'loans';
const STORE_PENDING_LOANS = 'pendingLoans';

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_BOOKS)) db.createObjectStore(STORE_BOOKS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_GENRES)) db.createObjectStore(STORE_GENRES, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_REVIEWS)) {
        const reviewStore = db.createObjectStore(STORE_REVIEWS, { keyPath: 'id' });
        reviewStore.createIndex('book_id_idx', 'book_id', { unique: false });
        reviewStore.createIndex('status_idx', 'status', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_IMAGES)) db.createObjectStore(STORE_IMAGES);
      if (!db.objectStoreNames.contains(STORE_LOANS)) db.createObjectStore(STORE_LOANS, { keyPath: 'loan_id' });
      if (!db.objectStoreNames.contains(STORE_PENDING_LOANS)) db.createObjectStore(STORE_PENDING_LOANS, { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('email_idx', 'email', { unique: true });

      }
      if (!db.objectStoreNames.contains('myActiveLoans')) {
  db.createObjectStore('myActiveLoans', { keyPath: 'id', autoIncrement: true });
}
if (!db.objectStoreNames.contains("pending_returns")) {
  db.createObjectStore("pending_returns", { keyPath: "id" });
}
if (!db.objectStoreNames.contains('loans')) {
  const store = db.createObjectStore('loans', { keyPath: 'loan_id' });
  store.createIndex('user_id_idx', 'user_id', { unique: false });
}

    }
  });
}

// ---- Slike ----
export async function saveImage(key, blob) {
  const db = await initDB();
  return db.put(STORE_IMAGES, blob, key);
}
export async function getImage(key) {
  const db = await initDB();
  return db.get(STORE_IMAGES, key);
}
export async function fetchImageAsBlob(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch image');
  return response.blob();
}
export async function fetchAndSaveImage(bookId, imageUrl) {
  try {
    const blob = await fetchImageAsBlob(imageUrl);
    await saveImage(bookId, blob);
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('Error fetching and saving image:', err);
    return null;
  }
}

// ---- Knjige ----
export async function saveBooks(books) {
    console.log("SPREMAM KNJIGE U INDEXEDDB:", books); // dodaj ovo
  const db = await initDB();
  const tx = db.transaction(STORE_BOOKS, "readwrite");
  const store = tx.objectStore(STORE_BOOKS);
  await store.clear();
  for (const book of books) await store.put(book);
  await tx.done;
}
export async function getAllBooks() {
  const db = await initDB();
  return db.getAll(STORE_BOOKS);
}

// ---- Žanrovi ----
export async function saveGenres(genres) {
  const db = await initDB();
  const tx = db.transaction(STORE_GENRES, "readwrite");
  const store = tx.objectStore(STORE_GENRES);
  await store.clear();
  for (let i = 0; i < genres.length; i++) {
    await store.put({ id: i, name: genres[i] });
  }
  await tx.done;
}
export async function getAllGenres() {
  const db = await initDB();
  const genresFromDB = await db.getAll(STORE_GENRES);
  return genresFromDB.map(g => g.name);
}

// ---- Recenzije ----
export async function saveReviews(book_id, reviews) {
  const db = await initDB();
  const tx = db.transaction(STORE_REVIEWS, 'readwrite');
  const store = tx.objectStore(STORE_REVIEWS);

  // Očisti stare recenzije za tu knjigu
  const allReviews = await store.getAll();
  for (const review of allReviews) {
    if (review.book_id === book_id) await store.delete(review.id);
  }

  for (const review of reviews) {
    const reviewWithId = { ...review, book_id };
    if (!reviewWithId.id) reviewWithId.id = crypto.randomUUID();
    await store.put(reviewWithId);
  }
  await tx.done;
}
export async function loadReviews(book_id) {
  const db = await initDB();
  const tx = db.transaction(STORE_REVIEWS, 'readonly');
  const store = tx.objectStore(STORE_REVIEWS);
  const index = store.index('book_id_idx');
  return await index.getAll(book_id);
}
export async function saveReviewOffline(review) {
  const db = await initDB();
  if (!review.id) review.id = crypto.randomUUID();
  return db.put(STORE_REVIEWS, { ...review, status: 'pending' });
}
export async function getPendingReviews() {
  const db = await initDB();
  const tx = db.transaction(STORE_REVIEWS, 'readonly');
  const store = tx.objectStore(STORE_REVIEWS);
  const index = store.index('status_idx');
  return await index.getAll('pending');
}
export async function syncPendingReviews() {
  const pendingReviews = await getPendingReviews();
  for (const review of pendingReviews) {
    try {
      const response = await fetch(`http://localhost:3001/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
      if (!response.ok) throw new Error('Failed to sync review');
      let savedReview = {};
      try {
        savedReview = await response.json();
      } catch {
       
        savedReview = {};
      }
      const db = await initDB();
      
      const reviewToSave = { ...review, ...savedReview, status: 'synced' };
      if (!reviewToSave.id) reviewToSave.id = review.id;
      await db.put(STORE_REVIEWS, reviewToSave);
    } catch (err) {
      console.error('Error syncing review:', err);
    }
  }
}


// ---- Posudbe (Pending) ----
export async function savePendingLoan(loan) {
  const db = await initDB();
  return db.add(STORE_PENDING_LOANS, loan);
}
export async function getAllPendingLoans() {
  const db = await initDB();
  return db.getAll(STORE_PENDING_LOANS);
}
export async function deletePendingLoan(id) {
  const db = await initDB();
  return db.delete(STORE_PENDING_LOANS, id);
}


// Aktivne posudbe
export async function saveMyActiveLoansOffline(loans) {
  const db = await initDB();
  if (!db.objectStoreNames.contains('myActiveLoans')) {
  
    db.close();
    await openDB('LibraryDB', 10, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('myActiveLoans')) {
          db.createObjectStore('myActiveLoans', { keyPath: 'id', autoIncrement: true });
        }
      }
    });
    // Re-kreiraj vezu s novim storeom
    return await saveMyActiveLoansOffline(loans);
  }
  const tx = db.transaction('myActiveLoans', 'readwrite');
  const store = tx.objectStore('myActiveLoans');
  await store.clear();
  for (const loan of loans) {
    await store.put(loan);
  }
  await tx.done;
}

export async function getMyActiveLoansOffline() {
  const db = await initDB();
  if (!db.objectStoreNames.contains('myActiveLoans')) return [];
  return await db.getAll('myActiveLoans');
}


// --- PENDING RETURNS (offline povrati) ---
const STORE_PENDING_RETURNS = "pending_returns";

export async function savePendingReturn(loan_id) {
  console.log("savePendingReturn zvan za loan_id:", loan_id);
  const db = await initDB();
  return db.put(STORE_PENDING_RETURNS, { id: loan_id, loan_id });
}


export async function getAllPendingReturns() {
  const db = await initDB();
  return db.getAll(STORE_PENDING_RETURNS);
}

export async function deletePendingReturn(id) {
  const db = await initDB();
  return db.delete(STORE_PENDING_RETURNS, id);
}



//Sprema sve posudbe (loans) u IndexedDB 
export async function saveLoansToIndexedDB(loans, user_id) {
  const db = await initDB();
  const tx = db.transaction('loans', "readwrite");
  const store = tx.objectStore('loans');
  await store.clear();
  for (const loan of loans) {
    
    await store.put({ ...loan, user_id: loan.user_id || user_id });
  }
  await tx.done;
}

export async function getLoansForUserFromIndexedDB(user_id) {
  const db = await initDB();
  const tx = db.transaction('loans', 'readonly');
  const store = tx.objectStore('loans');
  const allLoans = await store.getAll();
  // Vrati samo one za korisnika
  return allLoans.filter(loan => loan.user_id === user_id);
}



// Sinkronizacija offline vraćanja (pending_returns)
export async function syncPendingReturns(userId = null) {
  const pending = await getAllPendingReturns();
  for (const ret of pending) {
    try {
      const res = await fetch(`http://localhost:3001/loans/${ret.loan_id}/return`, { method: "PATCH" });
      if (res.ok) {
        await deletePendingReturn(ret.id);
      }
    } catch (e) {
      console.error("Greška pri sinkronizaciji povrata:", e);
    }
  }

  // Nakon sinkronizacije, ažuriraj lokalne posudbe ako je userId poznat
  try {
 
    const id = userId || JSON.parse(localStorage.getItem("user"))?.id;
    if (id) {
      const response = await fetch(`http://localhost:3001/loans/${id}`);
      if (response.ok) {
        const freshLoans = await response.json();
        await saveLoansToIndexedDB(freshLoans, id); 
      }
    }
  } catch (e) {
    console.warn("Ne mogu refreshati posudbe nakon sync-a returns:", e);
  }
}


// Vraca SVE posudbe za usera (i pending i syncane, bez duplikata)
export async function getAllUserLoansCombined(user_id) {
  const savedLoans = await getLoansForUserFromIndexedDB(user_id);
  const pendingLoans = await getAllPendingLoans();
  const myPendingLoans = pendingLoans.filter(l => l.user_id === user_id);

  // GLEDAJ SAMO AKTIVNE! 
  const syncaniBookIds = new Set(
    savedLoans
      .filter(l => l.return_date == null)
      .map(l => l.book_id)
  );

  // Prikaži pending samo ako NE postoji AKTIVNA za taj book_id
  const pendingLoanObjects = myPendingLoans
    .filter(l => !syncaniBookIds.has(l.book_id))
    .map(l => ({
      loan_id: "pending_" + l.book_id,
      book_id: l.book_id,
      title: "NEPOZNATO (offline)",
      author: "",
      loan_date: "Offline",
      return_date: null,
      status: "Čeka sinkronizaciju",
      ...l
    }));

  return [...savedLoans, ...pendingLoanObjects];
}






export async function syncPendingLoans(userId = null) {
  const pendingLoans = await getAllPendingLoans();
  for (const loan of pendingLoans) {
    try {
      const response = await axios.post("http://localhost:3001/loans", {
        user_id: loan.user_id,
        book_id: loan.book_id,
      });
      if (response.status === 201) {
        await deletePendingLoan(loan.id);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "";
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
 
  try {
    const id = userId || JSON.parse(localStorage.getItem("user"))?.id;
    if (id) {
      const response = await axios.get(`http://localhost:3001/loans/${id}`);
      if (response.status === 200) {
        const freshLoans = response.data;
        await saveLoansToIndexedDB(freshLoans, id);
      }
    }
  } catch (e) {
    console.warn("Ne mogu refreshati posudbe nakon sync-a loans:", e);
  }
}






//admin

export async function deleteUserAndRelatedDataFromIndexedDB(userId) {
  const db = await initDB();

  // Briši korisnika iz "users" storea
  await db.delete('users', userId);

  // Briši njegove posudbe iz "loans" storea
  const loans = await db.getAll('loans');
  for (const loan of loans) {
    if (loan.user_id === userId) {
      await db.delete('loans', loan.loan_id);
    }
  }

  // Briši njegove recenzije iz "reviews" storea
  const reviews = await db.getAll('reviews');
  for (const review of reviews) {
    if (review.user_id === userId) {
      await db.delete('reviews', review.id);
    }
  }

}
export async function saveUsersToIndexedDB(users) {
  const db = await initDB();
  const tx = db.transaction('users', 'readwrite');
  const store = tx.objectStore('users');



  for (const user of users) {
    // Pokušaj pronaći usera po ID-u u IndexedDB
    const existingUser = await store.get(user.id);

    // Ako već postoji user i ima spremljen password, zadrži taj password
    if (existingUser && existingUser.password) {
      user.password = existingUser.password;
    }
    // Inače, user dolazi bez passworda (npr. kod prvog synca), ostaje bez
    await store.put(user);
  }

  await tx.done;
}


export async function getAllUsersFromIndexedDB() {
  const db = await initDB();
  return db.getAll('users');
}
