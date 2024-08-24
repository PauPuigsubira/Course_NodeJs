import express, { json } from 'express'
import { corsMiddleware } from './middlewares/cors.js'
import { moviesRouter } from './routes/movies.js'

// import movies from './assets/movies.json' assert { type: 'json' } -> Experimental
// import movies from './assets/movies.json' assert { type: 'json' } -> Not available for now
// Valid but worst in Performance
// import fs from 'node:fs'
// const movies = JSON.parse(fs.readFileSync('./assets/movies.json','utf-8'))
// Recomended Option
// import { createRequire } from 'node:module'
// const require = createRequire(import.meta.url)
// const movies = require('./assets/movies.json')
// import { readJSON } from './libs/utils.js'
// const movies = readJSON('../assets/movies.json')

const PORT = process.env.PORT ?? 1234
const app = express()
// MiddleWare to access directly to request.body
app.use(json())
app.use(corsMiddleware())
/*
import cors from 'cors'
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))
*/
app.disable('x-powered-by')

app.get('/', (req, res) => {
  res.json({ message: 'Hola Mundo' })
})

app.use('/movies', moviesRouter)

app.listen(PORT, () => {
  console.log(`Server is listening at port http://localhost:${PORT}`)
})
