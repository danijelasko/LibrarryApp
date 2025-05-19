


const request = indexedDB.open('LibraryDB', 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;

  const genresStore = db.createObjectStore('Genres', { keyPath: 'id', autoIncrement: true });
  genresStore.createIndex('name', 'name', { unique: true });

  const booksStore = db.createObjectStore('Books', { keyPath: 'id', autoIncrement: true });
  booksStore.createIndex('title', 'title', { unique: false });
  booksStore.createIndex('genre_id', 'genre_id', { unique: false });

  const usersStore = db.createObjectStore('Users', { keyPath: 'id', autoIncrement: true });
  usersStore.createIndex('email', 'email', { unique: true });

  const loansStore = db.createObjectStore('Loans', { keyPath: 'id', autoIncrement: true });
  loansStore.createIndex('book_id', 'book_id', { unique: false });
  loansStore.createIndex('user_id', 'user_id', { unique: false });
};

request.onsuccess = function() {
  console.log('IndexedDB baza je otvorena!');
};

request.onerror = function() {
  console.error('Greška pri otvaranju IndexedDB baze!');
};
