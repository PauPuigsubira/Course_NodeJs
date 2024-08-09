const express = require('express')
const ditto = require('./pokemon/ditto.json')

const PORT = process.env.PORT ?? 1234

const app = express()

app.disable('x-powered-by')

// MiddleWares filter URL
app.use('/poke*', (req, res, next) => {
  console.log('This MiddleWare is only for routes that starts with poke')
  next()
})
// MiddleWares Default
// This middleware is the same as: app.use(express.json())
app.use((req, res, next) => {
  if (req.method !== 'POST') return next()
  if (req.headers['content-type'] !== 'application/json') return next()
  // Only POST method with header content-type: application/json
  // Variable to accumulate request Chunks
  let reqBody = ''
  // Reading fragments of data
  req.on('data', chunk => {
    reqBody += chunk.toString()
  })

  req.on('end', () => {
    // Convert JSON data to a JavaScript Object using JSON.parse(data)
    const data = JSON.parse(reqBody)
    data.timestamp = Date.now()
    // We will mutate the request and set the data inside the request
    req.body = data
    next()
  })
})

app.get('/', (req, res) => {
  res.status(200).send('<h1>Server Up</h1>')
})

app.get('/pokemon/ditto', (req, res) => {
  res.json(ditto)
})

app.post('/', (req, res) => {
  res.json({ variable1: 'valor 1', variable2: [1, 2], variable3: { id: 1, nombre: 'pau' } })
})

app.post('/pokemon', (req, res) => {
  // Pending -> Call to a DataBase to save the new resource
  res.status(201).json(req.body)
})

app.use((req, res) => {
  res.status(404).send('<h1>404</h1>')
})

app.listen(PORT, () => {
  console.log(`Server is listening on port http://localhost:${PORT}`)
})
