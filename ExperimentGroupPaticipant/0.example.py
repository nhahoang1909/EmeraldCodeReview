# example of SQL injection

def search():
    query = request.args.get('q', '')
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute("SELECT username FROM users WHERE username LIKE '%%%s%%'" % query) # SQL injection, not parameterized query
    cursor.execute("SELECT username FROM users WHERE username LIKE ?", ('%' + query + '%',)) #correct
    results = cursor.fetchall()
    conn.close()
    return jsonify(results)