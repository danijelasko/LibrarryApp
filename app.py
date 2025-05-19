#from flask import Flask, request, jsonify
#from flask_cors import CORS
#import sqlite3

#app = Flask(__name__)
#CORS(app)

# Funkcija za spajanje na SQLite bazu
#def get_db_connection():
 #   conn = sqlite3.connect('library.db')
  #  conn.row_factory = sqlite3.Row  # Omogućava pristup kolonama po imenu
   # return conn

# Ruta koja podržava GET i POST metodu za autentikaciju korisnika
#@app.route('/users', methods=['GET', 'POST'])
#def get_user():
 #   if request.method == 'GET':
  #      email = request.args.get('email')
   #     password = request.args.get('password')
    #elif request.method == 'POST':
     #   data = request.get_json()
      #  email = data.get('email')
       # password = data.get('password')
  #  else:
   #     return jsonify({'error': 'Metoda nije podržana'}), 405

    #conn = get_db_connection()
    #user = conn.execute(
     #   "SELECT * FROM Users WHERE email=? AND password=?",
      #  (email, password)
    #).fetchone()
    #conn.close()

    #if user:
     #   return jsonify([dict(user)])
    #else:
     #   return jsonify([])

#if __name__ == '__main__':
 #   app.run(port=3001)


from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app)

def get_db_connection():
    conn = sqlite3.connect('library.db')
    conn.row_factory = sqlite3.Row
    return conn

# Ruta za posluživanje slika iz static/images foldera
@app.route('/images/<path:filename>')
def serve_image(filename):
    return send_from_directory('static/images', filename)

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
        return jsonify([dict(user)])
    else:
        return jsonify([])

@app.route('/books', methods=['GET'])
def get_books():
    try:
        conn = get_db_connection()
        books = conn.execute("""
            SELECT Books.id, Books.title, Books.author, Books.description,
                   Genres.name AS genre, Books.image as image
            FROM Books
            JOIN Genres ON Books.genre_id = Genres.id
        """).fetchall()
        conn.close()

        return jsonify([dict(book) for book in books])
    except Exception as e:
        print("Greška pri dohvaćanju knjiga:", e)
        return jsonify({"error": "Ne mogu dohvatiti knjige."}), 500

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

@app.route('/loans/<int:user_id>', methods=['GET'])
def get_loans_by_user(user_id):
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

@app.route('/loans', methods=['POST'])
def add_loan():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        book_id = data.get('book_id')

        if not user_id or not book_id:
            return jsonify({"error": "Nedostaje user_id ili book_id."}), 400

        conn = get_db_connection()

        # Provjeri je li knjiga već posuđena (return_date je NULL)
        loaned = conn.execute(
            "SELECT * FROM Loans WHERE book_id = ? AND return_date IS NULL", 
            (book_id,)
        ).fetchone()

        if loaned:
            conn.close()
            return jsonify({"message": "Knjiga je već posuđena."}), 400

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






if __name__ == '__main__':
    app.run(port=3001, debug=True)
