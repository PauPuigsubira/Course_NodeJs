import { Router } from 'express'
// import { randomUUID } from 'node:crypto'
// import { readJSON } from '../libs/utils.js'
// import { validateMovie, validateMoviePartially } from '../schemes/movies.js'
// import { MovieModel } from '../models/movie.js'
import { MovieController } from '../controllers/movies.js'

export const moviesRouter = Router()
// const movies = readJSON('../assets/movies.json')

moviesRouter.get('/', MovieController.getAll)
// moviesRouter.get('/', async (req, res) => {
// const { genre } = req.query
// const movies = await MovieModel.getAll({ genre })
/*
  if (genre) {
    const filteredMovies = movies.filter(
      // movie => movie.genre.includes(genre)
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    if (filteredMovies.length > 0) return res.json(filteredMovies)
    return res.status(404).json({ message: `Not films found with this searching criteria genre ${genre}` })
  }
  */
// if (movies.length > 0) return res.json(movies)

// return res.status(404).json({ message: `Not films found with this searching criteria genre ${genre}` })
// })

moviesRouter.get('/:id', MovieController.getById)
// moviesRouter.get('/:id', async (req, res) => {
// const { id } = req.params
// const movie = movies.find(movie => movie.id === id)
// try {
// const movie = await MovieModel.getById(id)

// if (movie) return res.json(movie)

// res.status(404).json({ message: 'movie not found' })
// } catch {
// res.status(500).json({ message: 'raised an unexpected error. Try again later.' })
// }
// })

moviesRouter.post('/', MovieController.create)
// moviesRouter.post('/', async (req, res) => {
// const result = validateMovie(req.body)

// if (result.error) {
// 400 - Bad Request
// return res.status(400).json({ error: JSON.parse(result.error.message) })
// }
/*
  const newMovie = {
    id: randomUUID(), // creates a native UUID v4
    ...req.body
  }
  // This won't be REST protocol because we are saving data in memory!!!
  movies.push(newMovie)
  */
// const newMovie = await MovieModel.create({ input: result.data })
// res.status(201).json(newMovie)
// })

moviesRouter.patch('/:id', MovieController.update)
// moviesRouter.patch('/:id', async (req, res) => {
// const { id } = req.params
// const movieIndex = movies.findIndex(movie => movie.id === id)

// if (movieIndex < 0) return res.status(404).json({ message: 'Movie not found' })

// const result = validateMoviePartially(req.body)

// if (result.error) return res.status(423).json({ message: JSON.parse(result.error.message) })

/*
  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie
  */
// const updateMovie = await MovieModel.update({ id, input: result.data })

// if (updateMovie === false) return res.status(404).json({ message: 'Movie not found' })

// return res.json(movies[movieIndex])
// return res.json(updateMovie)
// })

moviesRouter.options('/:id', (req, res) => {
  // Do nothing. Though for CORS in POST, PUT, PATCH methods
  // You should add header Access-Control-Allow-Origin & Access-Control-Allow-Methods
})

moviesRouter.delete('/:id', MovieController.delete)
// moviesRouter.delete('/:id', async (req, res) => {
// const { id } = req.params
/*
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) return res.status(404).json({ message: 'Movie not found' })

  movies.splice(movieIndex, 1)
  */
// const movieIndex = MovieModel.delete({ id })

// if (movieIndex === false) return res.status(404).json({ message: 'Movie not found' })

// return res.json({ message: 'Movie deleted' })
// })
