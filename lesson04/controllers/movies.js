import { MovieModel } from '../models/movie.js'
import { validateMovie, validateMoviePartially } from '../schemes/movies.js'

export class MovieController {
  static async getAll (req, res) {
    const { genre } = req.query
    const movies = await MovieModel.getAll({ genre })
    // What is rendering
    if (movies.length === 0) return res.status(404).json({ message: `Not films found with this searching criteria genre ${genre}` })
    res.json(movies)
  }

  static async getById (req, res) {
    const { id } = req.params
    const movie = await MovieModel.getById(id)

    if (movie) return res.json(movie)

    res.status(404).json({ message: 'movie not found' })
  }

  static async create (req, res) {
    const result = validateMovie(req.body)

    if (!result.success) {
    // 400 - Bad Request
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const newMovie = await MovieModel.create({ input: result.data })
    res.status(201).json(newMovie)
  }

  static async update (req, res) {
    const { id } = req.params
    const result = validateMoviePartially(req.body)

    if (result.error) return res.status(423).json({ message: JSON.parse(result.error.message) })

    const updateMovie = await MovieModel.update({ id, input: result.data })

    if (updateMovie === false) return res.status(404).json({ message: 'Movie not found' })

    // return res.json(movies[movieIndex])
    res.json(updateMovie)
  }

  static async delete (req, res) {
    const { id } = req.params
    const movieIndex = MovieModel.delete({ id })

    if (movieIndex === false) return res.status(404).json({ message: 'Movie not found' })

    res.json({ message: 'Movie deleted' })
  }
}
