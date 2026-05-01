import express, { json } from 'express'
import Database from 'better-sqlite3'
const db = new Database('airlog.db')

const app = express()
const PORT = 3000

// Anfrage lesen können
app.use(json())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

db.exec(`CREATE TABLE IF NOT EXISTS artikel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
    )
`)

//GET
app.get('/artikel', (req, res) => {
    const artikel = db.prepare('SELECT * FROM artikel').all()
    res.json(artikel)
})

//POST
app.post('/artikel', (req, res) => {
    const { name } = req.body
    const result = db.prepare('INSERT INTO artikel (name) VALUES (?)').run(name)
    res.json({ id: result.lastInsertRowid, name })
})

//Server starten
app.listen(PORT, () => {
    console.log(`Server läuft auf Port http://localhost:${PORT}`)
})


// HTML-Datei serve
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Artikel Manager</title>
      <style>
        body { font-family: Arial; margin: 40px; }
        input { padding: 8px; margin: 10px 0; width: 300px; }
        button { padding: 8px 16px; background: #007bff; color: white; border: none; cursor: pointer; }
        pre { background: #f0f0f0; padding: 10px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <h1>Artikel Manager</h1>
      <input type="text" id="name" placeholder="Artikelname...">
      <button onclick="addArtikel()">Hinzufügen</button>
      <button onclick="loadArtikel()">Laden</button>
      <pre id="result"></pre>
      
      <script>
        async function loadArtikel() {
          const res = await fetch('/artikel')
          const data = await res.json()
          document.getElementById('result').innerText = JSON.stringify(data, null, 2)
        }
        
        async function addArtikel() {
          const name = document.getElementById('name').value
          const res = await fetch('/artikel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
          })
          const data = await res.json()
          document.getElementById('result').innerText = JSON.stringify(data, null, 2)
          document.getElementById('name').value = ''
          loadArtikel()
        }
        
        loadArtikel()
      </script>
    </body>
    </html>
  `)
})