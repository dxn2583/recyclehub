from flask import Flask, render_template, request, redirect
import sqlite3

app = Flask(__name__)

# Δημιουργία βάσης 
def init_db():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            message TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        name = request.form['name']
        message = request.form['message']

        conn = sqlite3.connect('database.db')
        c = conn.cursor()
        c.execute('INSERT INTO messages (name, message) VALUES (?, ?)', (name, message))
        conn.commit()
        conn.close()

        return redirect('/')

    return render_template('form.html')

@app.route('/messages')
def show_messages():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('SELECT name, message FROM messages ORDER BY id DESC')
    data = c.fetchall()
    conn.close()
    return render_template('messages.html', messages=data)

# Εκκίνηση της εφαρμογής
if __name__ == '__main__':
    init_db()
    app.run(debug=True)
