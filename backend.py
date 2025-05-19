import sqlite3

conn = sqlite3.connect('library.db')
cursor = conn.cursor()
cursor.execute("DROP TABLE IF EXISTS Books")

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


CREATE TABLE IF NOT EXISTS Reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    rating INTEGER CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES Users(id),
    FOREIGN KEY(book_id) REFERENCES Books(id)
);
""")

conn.commit()




# Ubaci žanrove
genres_to_insert = [
    ("Fantastika",),
    ("Pustolovina",),
    ("Distopija",),
    ("Povijest",),
    ("Romantika",),
    ("Znanstvena fantastika",),
    ("Triler",),
    ("Drama",),
    ("Misterija",),
    ("Komedija",),
]

cursor.executemany("""
INSERT OR IGNORE INTO Genres (name) VALUES (?)
""", genres_to_insert)

conn.commit()

# Ubaci 50 knjiga (naslov, autor, godina, genre_id, available_copies)
books_to_insert = [
    ("Harry Potter i Kamen mudraca", "J.K. Rowling", 1997, 1, 5, "Prva knjiga iz serijala o mladom čarobnjaku Harryju Potteru.", "harrypotterikamenmudraca.jpg"),
    ("Gospodar prstenova", "J.R.R. Tolkien", 1954, 2, 3, "Epska fantastična priča o putovanju i borbi za moćni prsten.", "gospodaruprstenova.jpg"),
    ("1984", "George Orwell", 1949, 3, 4, "Distopijski roman koji prikazuje totalitarno društvo i kontrolu nad ljudima.", "1984.jpg"),
    ("Povijest svijeta", "John Smith", 2001, 4, 2, "Pregled najvažnijih događaja u povijesti čovječanstva.", "povijestsvijeta.jpg"),
    ("Ljubavna priča", "Ana K.", 2010, 5, 7, "Dirljiva priča o ljubavi i sudbini dvoje mladih ljudi.", "ljubavnaprica.jpg"),
    ("Marsova misija", "Ivan I.", 2020, 6, 6, "Znanstvenofantastični roman o istraživanju Marsa.", "marsovamisija.jpg"),
    ("Mračna tajna", "Petar P.", 2018, 7, 4, "Napeta kriminalistička priča punih neočekivanih obrata.", "mracnatajna.jpg"),
    ("Obiteljska drama", "Lucija L.", 2015, 8, 3, "Emotivna priča o odnosima u jednoj obitelji.", "obiteljskadrama.jpg"),
    ("Nestali u magli", "Marko M.", 2017, 9, 5, "Misteriozni roman o nestanku ljudi u malom gradu.", "nestaliumagli.jpg"),
    ("Smijeh do suza", "Ivana I.", 2013, 10, 6, "Komedija koja će vas nasmijati do suza.", "smijehdosuza.jpg"),
    ("Čarobnjakov povratak", "J.K. Rowling", 1998, 1, 4, "Nastavak avantura mladog čarobnjaka.", "carobnjakovpovratak.jpg"),
    ("Pustolovine kapetana Marka", "Mark Twain", 1884, 2, 3, "Klasik pustolovne literature.", "pustolovinekapetanamarka.jpg"),
    ("Svijet poslije nas", "George Orwell", 1950, 3, 5, "Vizija svijeta nakon katastrofe.", "svijetposlijenas.jpg"),
    ("Kratka povijest vremena", "Stephen Hawking", 1988, 4, 2, "Popularnoznanstveni pregled teorije svemira.", "kratkapovijestvremena.jpg"),
    ("Srce za srce", "Ana K.", 2011, 5, 7, "Priča o ljubavi i međuljudskim odnosima.", "srcezasrce.jpg"),
    ("Put do Marsa", "Ivan I.", 2021, 6, 4, "Nastavak znanstvenofantastičnih pustolovina.", "putdomarsa.jpg"),
    ("Sjena prošlosti", "Petar P.", 2019, 7, 3, "Napeta drama s elementima tajne.", "sjenaproslosti.jpg"),
    ("Obiteljske tajne", "Lucija L.", 2016, 8, 5, "Otkrivanje tajni koje mijenjaju živote.", "obiteljsketajne.jpg"),
    ("Tajanstveni grad", "Marko M.", 2018, 9, 4, "Misteriozni roman smješten u zagonetnom gradu.", "tajanstvenigrad.jpg"),
    ("Komedija života", "Ivana I.", 2014, 10, 6, "Priča prepuna humora i životnih situacija.", "komedijazivota.jpg"),
    ("Čarobna knjiga", "J.K. Rowling", 1999, 1, 5, "Čarobna avantura u svijetu magije.", "carobnaknjiga.jpg"),
    ("More pustolovina", "Mark Twain", 1885, 2, 3, "Pustolovine na moru i dalekim krajevima.", "morepustolovina.jpg"),
    ("Nova distopija", "George Orwell", 1951, 3, 4, "Još jedna distopijska vizija društva.", "novadistopija.jpg"),
    ("Povijest umjetnosti", "John Smith", 2005, 4, 2, "Pregled razvoja umjetnosti kroz povijest.", "povijestumjetnosti.jpg"),
    ("Ljubav i sudbina", "Ana K.", 2012, 5, 7, "Ljubavna priča s elementima sudbine.", "ljubavisudbina.jpg"),
    ("Zvjezdana flota", "Ivan I.", 2022, 6, 6, "Znanstvenofantastični serijal o svemirskim ekspedicijama.", "zvjezdanaflota.jpg"),
    ("Tajni agent", "Petar P.", 2020, 7, 4, "Špijunski triler pun akcije.", "tajniagent.jpg"),
    ("Porodične veze", "Lucija L.", 2017, 8, 3, "Drama o složenim obiteljskim odnosima.", "porodicneveze.jpg"),
    ("Zagonetka", "Marko M.", 2019, 9, 5, "Misteriozni roman s nepredvidivim završetkom.", "zagonetka.jpg"),
    ("Smijeh ulice", "Ivana I.", 2015, 10, 6, "Komedija smještena u urbani ambijent.", "smijehulice.jpg"),
    ("Čarobnjakova škola", "J.K. Rowling", 2000, 1, 4, "Školske pustolovine mladih čarobnjaka.", "carobnjakovaskola.jpg"),
    ("Pustolovina na sjeveru", "Mark Twain", 1886, 2, 3, "Pustolovni roman o sjevernim krajevima.", "pustolovinanasjeveru.jpg"),
    ("Distopijski san", "George Orwell", 1952, 3, 5, "Još jedna distopijska vizija budućnosti.", "distopijskisan.jpg"),
    ("Povijest znanosti", "John Smith", 2010, 4, 2, "Pregled razvoja znanosti i tehnologije.", "povijestznanosti.jpg"),
    ("Ljubavna ispovijest", "Ana K.", 2013, 5, 7, "Intimna priča o ljubavi i gubicima.", "ljubavnaispovijest.jpg"),
    ("Putovanje kroz svemir", "Ivan I.", 2023, 6, 4, "Nastavak svemirskih avantura.", "putovanjekrozsvemir.jpg"),
    ("Opasni poslovi", "Petar P.", 2021, 7, 3, "Napeta kriminalistička priča.", "opasniposlovi.jpg"),
    ("Obiteljske priče", "Lucija L.", 2018, 5, 5, "Kolekcija priča o obiteljskim događajima.", "obiteljskiprice.jpg"),
    ("Misteriozni otok", "Marko M.", 2020, 9, 4, "Misterija otoka i njegovih stanovnika.", "misteriozniotok.jpg"),
    ("Komedija zabune", "Ivana I.", 2016, 10, 6, "Humoristična priča o nesporazumima.", "komedijazabune.jpg"),
    ("Čarobna avantura", "J.K. Rowling", 2001, 1, 5, "Još jedna čarobna pustolovina.", "carobnaavantura.jpg"),
    ("Pustolovine brodom", "Mark Twain", 1887, 2, 3, "Pustolovine na moru s novim likovima.", "pustolovinebrodom.jpg"),
    ("Nova era", "George Orwell", 1953, 3, 4, "Distopijski roman o novom dobu.", "novaera.jpg"),
    ("Povijest filozofije", "John Smith", 2015, 4, 2, "Pregled filozofskih pravaca i misli.", "povijestfilozofije.jpg"),
    ("Srce i duša", "Ana K.", 2014, 5, 7, "Emotivna ljubavna priča.", "srceidusa.jpg"),
    ("Galaktička ekspedicija", "Ivan I.", 2024, 6, 6, "Nove svemirske pustolovine.", "galaktickaekspedicija.jpg"),
    ("Tajna ulice", "Petar P.", 2022, 7, 4, "Misteriozni događaji u malom gradu.", "tajnaulice.jpg"),
    ("Obiteljska drama 2", "Lucija L.", 2019, 8, 3, "Nastavak drame u obitelji.", "obiteljskadrama2.jpg"),
    ("Zagonetni dvorac", "Marko M.", 2021, 9, 5, "Misterija starog dvorca.", "zagonetnidvorac.jpg"),
    ("Komedija grešaka", "Ivana I.", 2017, 10, 6, "Humoristična priča o životnim greškama.", "komedijagresaka.jpg")
]
# Ubaci 50 knjiga
cursor.executemany("""
INSERT INTO Books (title, author, year, genre_id, available_copies, description, image)
VALUES (?, ?, ?, ?, ?, ?, ?)
""", books_to_insert)

conn.commit()




users_to_insert = [
    ('user1', 'pass123', 'user1@example.com', 'Ana', 'Horvat', '0911234567'),
    ('user2', 'secret', 'user2@example.com', 'Ivan', 'Kovač', '0987654321'),
    ('user3', '123456', 'user3@example.com', 'Petra', 'Novak', '0912345678'),
    ('user4', 'password', 'user4@example.com', 'Marko', 'Babić', '0923456789'),
    ('user5', 'qwerty', 'user5@example.com', 'Lucija', 'Marić', '0976543210')
]

cursor.executemany("""
    INSERT OR IGNORE INTO Users (username, password, email, first_name, last_name, phone)
    VALUES (?, ?, ?, ?, ?, ?)
""", users_to_insert)

conn.commit()


loans_to_insert = [
    # user1 (id=1) - 7 posudbi
    (1, 1, '2025-05-01', '2025-05-10'),
    (2, 1, '2025-05-05', None),
    (3, 1, '2025-05-07', '2025-05-15'),
    (4, 1, '2025-05-08', None),
    (5, 1, '2025-05-09', '2025-05-20'),
    (6, 1, '2025-05-10', None),
    (7, 1, '2025-05-11', None),

    # user2 (id=2) - 5 posudbi
    (8, 2, '2025-04-25', '2025-05-05'),
    (9, 2, '2025-05-02', None),
    (10, 2, '2025-05-06', None),
    (11, 2, '2025-05-08', '2025-05-18'),
    (12, 2, '2025-05-10', None),

    # user3 (id=3) - 5 posudbi
    (13, 3, '2025-04-28', '2025-05-07'),
    (14, 3, '2025-05-01', None),
    (15, 3, '2025-05-03', '2025-05-12'),
    (16, 3, '2025-05-09', None),
    (17, 3, '2025-05-11', None),

    # user4 (id=4) - 5 posudbi
    (18, 4, '2025-05-01', '2025-05-10'),
    (19, 4, '2025-05-05', None),
    (20, 4, '2025-05-06', None),
    (21, 4, '2025-05-08', '2025-05-17'),
    (22, 4, '2025-05-10', None),

    # user5 (id=5) - 5 posudbi
    (23, 5, '2025-05-02', None),
    (24, 5, '2025-05-04', '2025-05-13'),
    (25, 5, '2025-05-06', None),
    (26, 5, '2025-05-09', None),
    (27, 5, '2025-05-11', None),
]
cursor.executemany("""
    INSERT INTO Loans (book_id, user_id, loan_date, return_date)
    VALUES (?, ?, ?, ?)
""", loans_to_insert)
conn.commit()



# Pretpostavimo da već imaš otvorenu vezu i cursor, npr.
# conn = sqlite3.connect('tvoja_baza.db')
# cursor = conn.cursor()

reviews_to_insert = [
    (1, 1, 5, 'Odlična knjiga! Vrhunska radnja i stil.'),
    (2, 1, 4, 'Zanimljiva i poučna. Preporučujem.'),
    (1, 2, 3, 'Dobar pokušaj, ali kraj je predvidiv.'),
    (2, 2, 2, 'Teško za pratiti, stil mi ne odgovara.'),
]

cursor.executemany("""
    INSERT OR IGNORE INTO Reviews (user_id, book_id, rating, comment) 
    VALUES (?, ?, ?, ?)
""", reviews_to_insert)

conn.commit()


conn.close()


