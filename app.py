

import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app)

def get_db_connection():
  
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))   
    db_path = os.path.join(BASE_DIR, "library.db")          
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
 

    return conn


# Ruta za slike
@app.route('/images/<path:filename>')
def serve_image(filename):
    return send_from_directory('static/images', filename)

# Registracija
@app.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        phone = data.get('phone')

        # Provjera obaveznih polja
        if not username or not email or not password or not first_name or not last_name or not phone:
            return jsonify({"error": "Sva polja su obavezna: username, email, password, first_name, last_name, phone."}), 400

        conn = get_db_connection()
        existing = conn.execute("SELECT * FROM Users WHERE email=?", (email,)).fetchone()
        if existing:
            conn.close()
            return jsonify({"message": "Korisnik s ovim emailom već postoji."}), 409

        conn.execute(
            "INSERT INTO Users (username, email, password, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?)",
            (username, email, password, first_name, last_name, phone)
        )
        conn.commit()
        conn.close()

        return jsonify({"message": "Uspješna registracija."}), 201

    except Exception as e:
        print("Greška u registraciji:", e)
        return jsonify({"error": "Došlo je do greške na serveru."}), 500

# Login (ne šalje password natrag!)
@app.route('/users', methods=['GET'])
def get_user():
    email = request.args.get('email')
    password = request.args.get('password')

    if not email or not password:
        return jsonify([])

    conn = get_db_connection()
    user = conn.execute(
        "SELECT * FROM Users WHERE email=? AND password=?",
        (email, password)
    ).fetchone()
    conn.close()

    if user:
        user_dict = dict(user)
        user_dict.pop('password', None)  # ne šalji password!
        return jsonify([user_dict])
    else:
        return jsonify([])

# Lista knjiga s brojem dostupnih primjeraka!
@app.route('/books', methods=['GET'])
def get_books():
    try:
        conn = get_db_connection()
        books = conn.execute("""
            SELECT Books.id, Books.title, Books.author, Books.description,
                   Genres.name AS genre, Books.image as image,
                   Books.available_copies,
                   (
                     Books.available_copies - IFNULL(
                        (SELECT COUNT(*) FROM Loans WHERE Loans.book_id = Books.id AND Loans.return_date IS NULL),
                        0
                     )
                   ) AS available_now
            FROM Books
            JOIN Genres ON Books.genre_id = Genres.id
        """).fetchall()
        conn.close()

        return jsonify([dict(book) for book in books])
    except Exception as e:
        print("Greška pri dohvaćanju knjiga:", e)
        return jsonify({"error": "Ne mogu dohvatiti knjige."}), 500

# Žanrovi
@app.route('/genres', methods=['GET'])
def get_genres():
    try:
        conn = get_db_connection()
        genres = conn.execute("SELECT name FROM Genres").fetchall()
        conn.close()
        genre_names = [genre['name'] for genre in genres]
        return jsonify(genre_names)
    except Exception as e:
        print("Greška pri dohvaćanju žanrova:", e)
        return jsonify({"error": "Ne mogu dohvatiti žanrove."}), 500

# Knjige po žanru (opcionalno)
@app.route('/books/genre/<int:genre_id>', methods=['GET'])
def get_books_by_genre(genre_id):
    try:
        conn = get_db_connection()
        books = conn.execute(
            """
            SELECT Books.*, Genres.name as genre_name
            FROM Books
            JOIN Genres ON Books.genre_id = Genres.id
            WHERE genre_id = ?
            """,
            (genre_id,)
        ).fetchall()
        conn.close()

        return jsonify([dict(book) for book in books])
    except Exception as e:
        print("Greška pri dohvaćanju knjiga po žanru:", e)
        return jsonify({"error": "Ne mogu dohvatiti knjige za taj žanr."}), 500

# Posudbe korisnika
@app.route('/loans/<int:user_id>', methods=['GET'])
def get_loans_by_user(user_id):
    print("TRAŽIM POSUDBE ZA USER_ID:", user_id)
    try:
        conn = get_db_connection()
        loans = conn.execute("""
            SELECT Loans.id as loan_id, Books.title, Books.author, Books.image as image,
                   Loans.loan_date, Loans.return_date, Books.id as book_id
            FROM Loans
            JOIN Books ON Loans.book_id = Books.id
            WHERE Loans.user_id = ?
            ORDER BY Loans.loan_date DESC
        """, (user_id,)).fetchall()
        conn.close()

        return jsonify([dict(loan) for loan in loans])
    except Exception as e:
        print("Greška pri dohvaćanju posudbi:", e)
        return jsonify({"error": "Ne mogu dohvatiti posudbe korisnika."}), 500

# Nova posudba – provjera broja dostupnih primjeraka!
@app.route('/loans', methods=['POST'])
def add_loan():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        book_id = data.get('book_id')

        if not user_id or not book_id:
            return jsonify({"error": "Nedostaje user_id ili book_id."}), 400

        conn = get_db_connection()
        
        #Provjeri ima li ovaj korisnik već posudbu te knjige koja nije vraćena
        existing_loan = conn.execute(
            "SELECT * FROM Loans WHERE user_id = ? AND book_id = ? AND return_date IS NULL",
            (user_id, book_id)
        ).fetchone()
        if existing_loan:
            conn.close()
            return jsonify({"message": "Već ste posudili ovu knjigu, prvo je vratite!"}), 400

        # Broj trenutno posuđenih primjeraka
        loaned_count = conn.execute(
            "SELECT COUNT(*) FROM Loans WHERE book_id = ? AND return_date IS NULL", 
            (book_id,)
        ).fetchone()[0]
        total_copies = conn.execute(
            "SELECT available_copies FROM Books WHERE id = ?", 
            (book_id,)
        ).fetchone()[0]

        if loaned_count >= total_copies:
            conn.close()
            return jsonify({"message": "Nema dostupnih primjeraka knjige."}), 400

        # Dodaj novu posudbu
        loan_date = datetime.now().strftime('%Y-%m-%d')
        conn.execute(
            "INSERT INTO Loans (book_id, user_id, loan_date) VALUES (?, ?, ?)",
            (book_id, user_id, loan_date)
        )
        conn.commit()
        conn.close()

        return jsonify({"message": "Knjiga je uspješno posuđena."}), 201

    except Exception as e:
        print("Greška pri dodavanju posudbe:", e)
        return jsonify({"error": "Greška na serveru."}), 500


# Povrat knjige – PATCH ruta!
@app.route('/loans/<int:loan_id>/return', methods=['PATCH'])
def return_loan(loan_id):
    try:
        conn = get_db_connection()
        today = datetime.now().strftime('%Y-%m-%d')
        conn.execute(
            "UPDATE Loans SET return_date = ? WHERE id = ? AND return_date IS NULL",
            (today, loan_id)
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "Knjiga je uspješno vraćena."}), 200
    except Exception as e:
        print("Greška pri vraćanju knjige:", e)
        return jsonify({"error": "Greška na serveru."}), 500

# Dodavanje recenzije
@app.route('/reviews', methods=['POST'])
def add_review():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        book_id = data.get('book_id')
        rating = data.get('rating')
        comment = data.get('comment')

        if not all([user_id, book_id, rating]):
            return jsonify({"error": "Nedostaju podaci za recenziju."}), 400

        conn = get_db_connection()
        
        conn.execute(
            "INSERT INTO Reviews (user_id, book_id, rating, comment) VALUES (?, ?, ?, ?)",
            (user_id, book_id, rating, comment)
        )
        conn.commit()
        conn.close()

        return jsonify({"message": "Recenzija je uspješno dodana."}), 201

    except Exception as e:
        print("Greška pri dodavanju recenzije:", e)
        return jsonify({"error": "Greška na serveru."}), 500

# Recenzije za knjigu
@app.route('/reviews/<int:book_id>', methods=['GET'])
def get_reviews_by_book(book_id):
    try:
        conn = get_db_connection()
        reviews = conn.execute("""
            SELECT Reviews.id, Reviews.rating, Reviews.comment, Users.email as user_email
            FROM Reviews
            JOIN Users ON Reviews.user_id = Users.id
            WHERE Reviews.book_id = ?
        """, (book_id,)).fetchall()
        conn.close()

        return jsonify([dict(review) for review in reviews])
    except Exception as e:
        print("Greška pri dohvaćanju recenzija:", e)
        return jsonify({"error": "Ne mogu dohvatiti recenzije za ovu knjigu."}), 500
        





# Ruta: DOHVATI SVE KORISNIKE (admin funkcija)
@app.route('/users/all', methods=['GET'])
def get_all_users():
    try:
        conn = get_db_connection()
        users = conn.execute(
            "SELECT id, username, email, first_name, last_name, role FROM Users"
        ).fetchall()
        conn.close()
        return jsonify([dict(user) for user in users])
    except Exception as e:
        print("Greška pri dohvaćanju korisnika:", e)
        return jsonify({"error": "Ne mogu dohvatiti korisnike."}), 500





@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        conn = get_db_connection()
        # Prvo obriši povezane recenzije i posudbe
        conn.execute("DELETE FROM Reviews WHERE user_id = ?", (user_id,))
        conn.execute("DELETE FROM Loans WHERE user_id = ?", (user_id,))
        # Onda korisnika
        conn.execute("DELETE FROM Users WHERE id = ?", (user_id,))
        conn.commit()
        conn.close()
        return jsonify({"message": "Korisnik obrisan."}), 200
    except Exception as e:
        print("Greška pri brisanju korisnika:", e)
        return jsonify({"error": "Ne mogu obrisati korisnika."}), 500


@app.route('/books', methods=['POST'])
def add_book():
    try:
        data = request.get_json()
        title = data.get('title')
        author = data.get('author')
        year = data.get('year')
        genre_id = data.get('genre_id')
        available_copies = data.get('available_copies')
        description = data.get('description', '')
        image = data.get('image', '')

        if not all([title, author, year, genre_id, available_copies]):
            return jsonify({"error": "Sva polja osim opisa i slike su obavezna."}), 400

        conn = get_db_connection()
        conn.execute("""
            INSERT INTO Books (title, author, year, genre_id, available_copies, description, image)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (title, author, year, genre_id, available_copies, description, image))
        conn.commit()
        conn.close()

        return jsonify({"message": "Knjiga je uspješno dodana."}), 201

    except Exception as e:
        print("Greška pri dodavanju knjige:", e)
        return jsonify({"error": "Greška na serveru."}), 500






@app.route('/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    try:
        conn = get_db_connection()
        # Prvo obrisi sve posudbe i recenzije vezane uz tu knjigu
        conn.execute("DELETE FROM Loans WHERE book_id = ?", (book_id,))
        conn.execute("DELETE FROM Reviews WHERE book_id = ?", (book_id,))
        conn.execute("DELETE FROM Books WHERE id = ?", (book_id,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Knjiga obrisana.'}), 200
    except Exception as e:
        print("Greška pri brisanju knjige:", e)
        return jsonify({'error': 'Ne mogu obrisati knjigu.'}), 500




@app.route('/books/<int:book_id>', methods=['PATCH', 'PUT'])
def update_book(book_id):
    try:
        data = request.get_json()
        conn = get_db_connection()
        conn.execute("""
            UPDATE Books
            SET title = ?, author = ?, year = ?, genre_id = ?, available_copies = ?, description = ?, image = ?
            WHERE id = ?
        """, (
            data.get('title', ''),
            data.get('author', ''),
            data.get('year', None),
            data.get('genre_id', None),
            data.get('available_copies', 1),
            data.get('description', ''),
            data.get('image', ''),
            book_id
        ))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Knjiga ažurirana.'}), 200
    except Exception as e:
        print("Greška pri ažuriranju knjige:", e)
        return jsonify({'error': 'Ne mogu ažurirati knjigu.'}), 500










# Glavni pokretanje
if __name__ == '__main__':
    app.run(port=3001, debug=True)



