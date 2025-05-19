# Sustav za upravljanje knjižnicom izvan mreže

## Pregled projekta

Offline Library je sveobuhvatan sustav za upravljanje knjižnicom dizajniran za potpuno izvanmrežno funkcioniranje, a istovremeno nudi mogućnosti besprijekorne sinkronizacije kada se veza ponovno uspostavi. Aplikacija omogućuje knjižničarima i korisnicima upravljanje zbirkama knjiga, praćenje procesa posudbe/vraćanja i održavanje knjižničnih operacija čak i bez internetske veze. Koristi moderne web tehnologije kako bi pružio responzivno i pouzdano iskustvo u raznim scenarijima povezivosti.

## Ključne značajke

### Funkcionalnost izvan mreže
- **Potpuni pristup izvan mreže**: Potpune mogućnosti upravljanja knjižnicom bez internetske veze
- **Prijava/Odjava izvan mreže**: Obrada posudbe i povrata knjiga čak i izvan mreže
- **Lokalna pretraga i filtriranje**: Napredne mogućnosti pretraživanja knjiga

### Sinkronizacija
- **Sinkronizacija u pozadini**: Automatska sinkronizacija podataka kada se veza obnovi
- **Rješavanje sukoba**: Pametno spajanje promjena izvan mreže s podacima poslužitelja
- **Pokazatelji statusa sinkronizacije**: Jasni vizualni pokazatelji statusa sinkronizacije

### Upravljanje podacima
- **Katalog knjiga**: Sveobuhvatno upravljanje metapodacima knjiga, uključujući naslove, autore, žanrove
- **Upravljanje članovima**: Praćenje informacija o članovima, povijesti posudbe
- **Praćenje posudbe**: Praćenje posudbi, povrata

## Korištene tehnologije

### Frontend
- **CSS/JavaScript**: Osnovne web tehnologije
- **Progresivna web aplikacija (PWA)**: Za mogućnosti izvan mreže i iskustvo instalacije
- **Service Workers**: Omogućite funkcionalnost izvan mreže i sinkronizaciju u pozadini
- **IndexedDB**: Pohrana na strani klijenta za perzistenciju izvanmrežnih podataka u preglednicima

### Backend
- **Node.js**: Izvršno okruženje JavaScripta na strani poslužitelja
- **Express.js**: Okvir web aplikacije
- **SQLite**: Lokalna baza podataka za varijantu desktop aplikacije
- **RESTful API**: Za komunikaciju klijent-poslužitelj

### Pohrana podataka i sinkronizacija
- **IndexedDB**: Baza podataka temeljena na pregledniku za izvanmrežnu pohranu web klijenta
- **SQLite**: Ugrađena baza podataka za lokalnu pohranu u varijantama desktop aplikacije
- **Sync adapteri**: Prilagođeni middleware za rukovanje sinkronizacijom podataka

### Alati za razvoj
- **Webpack**: Paketiranje modula i optimizacija izgradnje
- **Babel**: JavaScript kompajler za kompatibilnost
- **ESLint**: Kvaliteta i konzistentnost koda
- **Jest**: Okvir za testiranje

## Arhitektura sustava

Izvanmrežna biblioteka prati hibridnu arhitekturu dizajniranu za otpornost i izvanmrežne mogućnosti:

1. **Klijentska razina**
- Progresivni web Sučelje aplikacije s responzivnim dizajnom
- Servisni radnici za presretanje mrežnih zahtjeva i omogućavanje izvanmrežnih funkcionalnosti
- IndexedDB za pohranu podataka na strani klijenta i izvanmrežne operacije
- Registracija sinkronizacije u pozadini za odgođena ažuriranja poslužitelja

2. **Sloj sinkronizacije**
- Sustav sinkronizacije temeljen na redu čekanja za praćenje izvanmrežnih promjena
- Strategije rješavanja sukoba temeljene na vremenskim oznakama
- Diferencijalna sinkronizacija za minimiziranje prijenosa podataka
- Sustav prioritizacije za sinkronizaciju kritičnih podataka

3. **Sloj poslužitelja**
- RESTful API krajnje točke za CRUD operacije
- Usluge autentifikacije i autorizacije
- Glavna baza podataka za centralizirane podatke kada je online
- Kontroleri sinkronizacije za rukovanje usklađivanjem klijenata

4. **Opcije implementacije**
- Centralni poslužitelj u oblaku
- Lokalni mrežni poslužitelj za institucionalnu implementaciju
- Samostalni način rada za potpuno izvanmrežne operacije

## Model podataka

### Osnovne kolekcije/tablice

**knjige**
- `id`: Jedinstveni identifikator
- `title`: Naslov knjige
- `author`: Autor(i) knjige
- `publishDate`: Datum objave
- `category`: Knjiga kategorija/žanr
- `description`: Opis knjige
- `coverImage`: Slika naslovnice knjige (pohranjena kao putanja ili blob)

**members**
- `id`: Jedinstveni identifikator
- `name`: Ime člana
- `email`: Kontakt e-mail
- `phone`: Kontakt telefon

**syncQueue**
- `id`: Jedinstveni identifikator operacije
- `operation`: Stvaranje, ažuriranje, brisanje
- `entityType`: Knjige, članovi, transakcije
- `entityId`: ID pogođenog entiteta
- `changeData`: Korisni teret podataka promjene
- `timestamp`: Kada se promjena dogodila
- `priority`: Razina prioriteta sinkronizacije
- `attempts`: Broj pokušaja sinkronizacije
- `status`: Na čekanju, dovršeno, neuspješno

## Postavljanje Upute

### Preduvjeti
- Node.js (v14 ili noviji)
- npm (v6 ili noviji)
- Moderni web preglednik (za podršku za PWA)

### Instalacija

1. Klonirajte repozitorij
```
git clone https://github.com/yourusername/library-sync.git
cd library-sync
```

2. Instalirajte ovisnosti
```
npm install
```

3. Konfigurirajte varijable okruženja
```
cp .env.example .env
```
Uredite datoteku `.env` kako bi odgovarala vašem okruženju

4. Inicijalizirajte bazu podataka
   ```
npm run init-db
```

5. Pokrenite razvojni poslužitelj
```
npm run dev
```

6. Pristupite aplikaciji
- Web aplikacija: http://localhost:3000
- Za izvanmrežni rad, otvorite aplikaciju jednom dok ste online kako biste predmemorirali potrebne resurse

### Izrada za produkciju
```
npm run build
```

### Struktura projekta
```
library-sync/
├── client/                     # Frontend code
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API and sync services
│   │   ├── utils/              # Utility functions
│   │   ├── hooks/              # Custom React hooks
│   │   ├── context/            # React context providers
│   │   ├── serviceWorker.js    # Service worker configuration
│   │   └── App.js              # Main App component
│   └── package.json            # Frontend dependencies
├── server/                     # Backend code
│   ├── controllers/            # Request handlers
│   ├── models/                 # Data models
│   ├── routes/                 # API routes
│   ├── services/               # Business logic services
│   ├── utils/                  # Utility functions
│   ├── db/                     # Database setup and migrations
│   ├── middleware/             # Express middleware
│   ├── sync/                   # Synchronization logic
│   └── server.js               # Server entry point
├── tests/                      # Unit and integration tests
├── .env.example                # Example environment variables
├── README.md                   # Project documentation
└── package.json                # Project dependencies
```


## Licenca
Ovaj projekt je licenciran pod MIT licencom - detalje potražite u datoteci LICENSE.
