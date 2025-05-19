# Specifikacija aplikacije za izvanmrežni rad u knjižnici

## 1. Pregled projekta

### 1.1 Ciljevi projekta
- Stvoriti sveobuhvatan sustav upravljanja knjižnicom s potpunom izvanmrežnom funkcionalnošću
- Implementirati robustan mehanizam sinkronizacije za nesmetan prijelaz između online i izvanmrežnog načina rada
- Pružiti intuitivno korisničko iskustvo za upravljanje osobnim i dijeljenim knjižnicama
- Osigurati integritet podataka na više uređaja i platformi

### 1.2 Komponente sustava
- **Sloj lokalne pohrane**: SQLite za izvorne aplikacije, IndexedDB za aplikacije temeljene na pregledniku
- **Modul sinkronizacije**: Mehanizam sinkronizacije u pozadini s rješavanjem sukoba
- **API sloj**: RESTful krajnje točke za komunikaciju s poslužiteljem
- **Korisničko sučelje**: Responzivni dizajn s pristupom koji je prvi na izvanmrežnom radu
- **Modul za autentifikaciju**: Podrška za izvanmrežnu autentifikaciju i autorizaciju

## 2. Funkcionalna specifikacija

### 2.1 Osnovne značajke

#### Upravljanje knjižnicom
- Katalogizacija knjiga s metapodacima (naslov, autor, godina objave, žanr, fotografija naslovnice)
- Mogućnosti filtriranja prema žanrovima
- Napredno pretraživanje i mogućnosti filtriranja koje rade izvan mreže
- Povijest čitanja
- Sustav posudbe s podsjetnicima na datume dospijeća
#### Upravljanje korisnicima
- Korisnički profili s postavkama čitanja
- Društvene značajke (recenzije, preporuke) koje se sinkroniziraju kada su online

#### Mogućnosti izvan mreže
- Potpuni pristup svim funkcijama knjižnice bez internetske veze
- Unos i izmjena podataka izvan mreže
- Funkcija pretraživanja i pregledavanja u predmemoriji
- Sadržaj medija izvan mreže (naslovnice knjiga, pregledi)
- Mogućnosti izvoza/uvoza za potrebe sigurnosne kopije

#### Značajke sinkronizacije
- Sinkronizacija u pozadini kada je veza dostupna
- Selektivne opcije sinkronizacije za upravljanje propusnošću
- Strategije rješavanja sukoba s korisnički definiranim postavkama
- Pokazatelji statusa sinkronizacije i povijest
- Sinkronizacija temeljena na prioritetu za kritične podatke

#### SQLite shema (izvorne aplikacije)
```sql
cursor.executescript("""
CREATE TABLE IF NOT EXISTS Genres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS Books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    year INTEGER,
    genre_id INTEGER,
    available_copies INTEGER DEFAULT 1,
    description TEXT DEFAULT '',
    image TEXT DEFAULT '',
    FOREIGN KEY (genre_id) REFERENCES Genres(id)
);


CREATE TABLE IF NOT EXISTS  Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT
);

CREATE TABLE IF NOT EXISTS Loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    loan_date TEXT NOT NULL,
    return_date TEXT,
    FOREIGN KEY (book_id) REFERENCES Books(id),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
""")


#### IndexedDB shema (aplikacije temeljene na pregledniku)
```javascript
// Trgovina knjigama

keyPath: "book_id",
indexes: [
{ name: "title", keyPath: "title", options: { unique: false } },
{ name: "author", keyPath: "author", options: { unique: false } },
{ name: "žanr", keyPath: "žanr", options: { unique: false } },
{ name: "sync_status", keyPath: "sync_status", options: { unique: false } }
]
}

// Trgovina zbirki

keyPath: "collection_id",
indexes: [
{ name: "name", keyPath: "name", options: { unique: true } },
{ name: "sync_status", keyPath: "sync_status", options: { unique: false } }
]
}

// Trgovina kolekcija knjiga
{
keyPath: ["id_knjige", "id_kolekcije"],
indexes: [
{ name: "id_knjige",
