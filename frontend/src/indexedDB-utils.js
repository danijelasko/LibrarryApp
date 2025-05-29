/*import { openDB } from 'idb';

const DB_NAME = 'LibraryDB';
const DB_VERSION =8;

const STORE_BOOKS = 'books';
const STORE_GENRES = 'genres';
const STORE_REVIEWS = 'reviews';
const STORE_IMAGES = 'images';
const STORE_LOANS = 'loans';
const STORE_PENDING_LOANS = 'pendingLoans';

export async function initDB() {
  return openDB('LibraryDB', 8, {
    upgrade(db) {
      // BOOKS
      if (!db.objectStoreNames.contains('books')) {
        db.createObjectStore('books', { keyPath: 'id' });
      }

      // GENRES
      if (!db.objectStoreNames.contains('genres')) {
        db.createObjectStore('genres', { keyPath: 'id' });
      }

      // REVIEWS
      // REVIEWS
if (!db.objectStoreNames.contains('reviews')) {
  const reviewStore = db.createObjectStore('reviews', { keyPath: 'id' });
  reviewStore.createIndex('book_id_idx', 'book_id', { unique: false });
  reviewStore.createIndex('status_idx', 'status', { unique: false }); // ✅ dodaj ovaj red
}


      // IMAGES
      if (!db.objectStoreNames.contains('images')) {
        db.createObjectStore('images');
      }

      // LOANS
      if (!db.objectStoreNames.contains('loans')) {
        db.createObjectStore('loans', { keyPath: 'loan_id' });
      }

      // PENDING LOANS
      if (!db.objectStoreNames.contains('pendingLoans')) {
        db.createObjectStore('pendingLoans', { keyPath: 'id', autoIncrement: true });
      }

      // USERS
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' }); // možeš koristiti UUID ili backend id
        userStore.createIndex('email_idx', 'email', { unique: true }); // ⚠️ dodajemo indeks na email
      }
    },
  });
}



// --- Funkcije za rad sa slikama ---

// Spremi Blob slike pod ključ (npr. bookId)
export async function saveImage(key, blob) {
  const db = await initDB();
  return db.put(STORE_IMAGES, blob, key);
}

// Dohvati Blob slike po ključu (npr. bookId)
export function getImage(bookId) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("LibraryDB", 8);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("images", "readonly");
      const store = transaction.objectStore("images");
      const getRequest = store.get(bookId);

      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = () => reject();
    };

    request.onerror = () => reject();
  });
}


// Uzmi sliku s URL-a i vrati Blob
export async function fetchImageAsBlob(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch image');
  return response.blob();
}

// Skini sliku i spremi u IndexedDB, vrati URL za <img src>
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

// Default slika ako učitavanje slike ne uspije
export const handleImageError = (e) => {
  e.target.src = '/images/default-book.png';
};

// --- Funkcije za knjige ---

export async function saveBook(book) {
  const db = await initDB();
  return db.put(STORE_BOOKS, book);
}

export async function getBook(id) {
  const db = await initDB();
  return db.get(STORE_BOOKS, id);
}

export async function getAllBooks() {
  const db = await initDB();
  return db.getAll(STORE_BOOKS);
}

// --- Funkcije za žanrove ---

export async function saveGenre(genre) {
  const db = await initDB();
  return db.put(STORE_GENRES, genre);
}

export async function getGenre(id) {
  const db = await initDB();
  return db.get(STORE_GENRES, id);
}

export async function getAllGenres() {
  const db = await initDB();
  return db.getAll(STORE_GENRES);
}

// --- Funkcije za recenzije ---

export async function saveReview(review) {
  const db = await initDB();
  if (!review.id) {
    review.id = crypto.randomUUID();  // Generira novi id ako ga nema
  }
  return db.put(STORE_REVIEWS, review);
}

export async function getReview(id) {
  const db = await initDB();
  return db.get(STORE_REVIEWS, id);
}

export async function getAllReviews() {
  const db = await initDB();
  return db.getAll(STORE_REVIEWS);
}

export const saveReviewsToIndexedDB = async (reviews) => {
  const db = await initDB();
  const tx = db.transaction(STORE_REVIEWS, "readwrite");
  const store = tx.objectStore(STORE_REVIEWS);
  await store.clear();
  for (const review of reviews) {
    if (!review.id) {
      review.id = crypto.randomUUID(); // Dodaj ID ako ga nema
    }
    await store.put(review);
  }
  await tx.done;
};


export const loadReviewsForBookFromIndexedDB = async (bookId) => {
  const db = await initDB();
  const tx = db.transaction(STORE_REVIEWS, "readonly");
  const store = tx.objectStore(STORE_REVIEWS);
  const index = store.index('book_id_idx');
const reviews = await index.getAll(bookId);
return reviews;

};

// Spremi recenzije za knjigu u IndexedDB
export async function saveReviews(bookId, reviews) {
  const db = await initDB();
  const tx = db.transaction(STORE_REVIEWS, 'readwrite');
  const store = tx.objectStore(STORE_REVIEWS);

  // Očisti stare recenzije za tu knjigu
  const allReviews = await store.getAll();
  for (const review of allReviews) {
    if (review.book_id === bookId) {
      await store.delete(review.id);
    }
  }

  for (const review of reviews) {
  const reviewWithId = { ...review, book_id: bookId };
  if (!reviewWithId.id) {
    reviewWithId.id = crypto.randomUUID();
  }
  await store.put(reviewWithId);
}

  await tx.done;
}

// Dohvati recenzije za knjigu iz IndexedDB
export async function loadReviews(bookId) {
  const db = await initDB();
  const tx = db.transaction(STORE_REVIEWS, 'readonly');
  const store = tx.objectStore(STORE_REVIEWS);

  const allReviews = await store.getAll();
  return allReviews.filter((review) => review.book_id === bookId);
}
export async function saveReviewOffline(review) {
  const db = await initDB();
  if (!review.id) {
    review.id = crypto.randomUUID();
  }
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
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });

      if (!response.ok) throw new Error('Failed to sync review');

      const savedReview = await response.json(); // <- dobivena recenzija s ID-em i svim podacima

      const db = await initDB();

      // 1. Obriši pending verziju
      await db.delete(STORE_REVIEWS, review.id);

      // 2. Spremi novu, sinkroniziranu verziju
      await db.put(STORE_REVIEWS, { ...savedReview, status: 'synced' });

    } catch (err) {
      console.error('Error syncing review:', err);
    }
  }
}


// --- Funkcije za posudbe (loans) ---

export async function saveLoan(loan) {
  const db = await initDB();
  return db.put(STORE_LOANS, loan);
}

export async function getLoan(id) {
  const db = await initDB();
  return db.get(STORE_LOANS, id);
}

export async function getAllLoans() {
  const db = await initDB();
  return db.getAll(STORE_LOANS);
}

// Dohvati sve posudbe za određenog korisnika (filter po user_id)
export async function getLoansForUser(userId) {
  const db = await initDB();
  const allLoans = await db.getAll(STORE_LOANS);
  return allLoans.filter(loan => loan.user_id === userId);
}



// Spremi offline posudbu s statusom pending za kasniju sinkronizaciju
export async function saveLoanOffline(loan) {
  const db = await initDB();
  return db.put(STORE_LOANS, { ...loan, status: 'pending' });
}

// Dohvati posudbe koje još nisu sinkronizirane
export async function getPendingLoans() {
  const db = await initDB();
  const allLoans = await db.getAll(STORE_LOANS);
  return allLoans.filter(loan => loan.status === 'pending');
}

// Sinkroniziraj posudbe koje su offline napravljene
export async function syncPendingLoans() {
  const pendingLoans = await getPendingLoans();

  for (const loan of pendingLoans) {
    try {
      // Pošalji posudbu na backend API (promijeni URL i strukturu prema tvojem API-ju)
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loan),
      });

      if (!response.ok) throw new Error('Failed to sync loan');

      // Ako je uspješno, izbriši posudbu iz IndexedDB
      const db = await initDB();
      await db.delete(STORE_LOANS, loan.loan_id);

    } catch (err) {
      console.error('Error syncing loan:', err);
      // Ostavi loan za kasniju sinkronizaciju
    }
  }
}

// Provjera postoji li posudba s određenim loan_id u IndexedDB
export async function doesLoanExist(loanId) {
  const db = await initDB();
  const loan = await db.get(STORE_LOANS, loanId);
  return loan !== undefined;
}




// Dodaj posudbe u IndexedDB
export async function saveLoans(loans) {
  const db = await initDB();
  const tx = db.transaction(STORE_LOANS, 'readwrite');
  const store = tx.objectStore(STORE_LOANS);
  for (const loan of loans) {
    await store.put(loan);
  }
  await tx.done;
}

// Dohvati posudbe iz IndexedDB
export async function getLoansByUserId(userId) {
  const db = await initDB();
  const store = db.transaction(STORE_LOANS).objectStore(STORE_LOANS);
  const allLoans = await store.getAll();
  return allLoans.filter(loan => loan.user_id === userId);
}








export async function fetchAndSaveLoanImages(userId) {
  const loans = await getLoansByUserId(userId);
  for (const loan of loans) {
    const book = await getBook(loan.book_id);
    if (book && book.image_url) {
      try {
        const imageBlob = await fetchImageAsBlob(book.image_url);
        await saveImage(book.id, imageBlob);
      } catch (error) {
        console.error(`Greška pri dohvaćanju slike za knjigu ${book.title}:`, error);
      }
    }
  }
}*/




import { openDB } from 'idb';

const DB_NAME = 'LibraryDB';
const DB_VERSION = 10;

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
        // ako nije JSON (možda vraća samo poruku)
        savedReview = {};
      }
      const db = await initDB();
      // OBRATI PAŽNJU: id MORA POSTOJATI!
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


// U indexedDB-utils.js, nakon ostalih funkcija...
export async function saveMyActiveLoansOffline(loans) {
  const db = await initDB();
  if (!db.objectStoreNames.contains('myActiveLoans')) {
    // Ako objektni spremnik ne postoji (prvi put), kreiraj ga!
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
  const db = await initDB();
  // Možeš koristiti loan_id kao ključ, ne trebaš više polja.
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
