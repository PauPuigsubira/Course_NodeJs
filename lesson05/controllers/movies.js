// import { MovieModel } from '../models/localfilesystem/movie.js'
// import { MovieModel } from '../models/mysql/movie.js'
import { validateMovie, validateMoviePartially } from '../schemes/movies.js'

export class MovieController {
  constructor ({ movieModel }) {
    this.movieModel = movieModel
  }

  getAll = async (req, res) => {
    const { genre } = req.query
    const movies = await this.movieModel.getAll({ genre })
    // What is rendering
    if (!movies || movies.length === 0) return res.status(404).json({ message: `Not films found with this searching criteria genre ${genre}` })
    res.json(movies)
  }

  getById = async (req, res) => {
    const { id } = req.params
    const movie = await this.movieModel.getById({ id })

    if (movie) return res.json(movie)

    res.status(404).json({ message: 'movie not found' })
  }

  create = async (req, res) => {
    const result = validateMovie(req.body)

    if (!result.success) {
    // 400 - Bad Request
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const newMovie = await this.movieModel.create({ input: result.data })
    res.status(201).json(newMovie)
  }

  update = async (req, res) => {
    const { id } = req.params
    const result = validateMoviePartially(req.body)

    if (result.error) return res.status(423).json({ message: JSON.parse(result.error.message) })

    const updateMovie = await this.movieModel.update({ id, input: result.data })

    if (updateMovie === false) return res.status(404).json({ message: 'Movie not found' })

    // return res.json(movies[movieIndex])
    res.json(updateMovie)
  }

  delete = async (req, res) => {
    const { id } = req.params
    const movieIndex = await this.movieModel.delete({ id })
    console.log('Returned from model movies.delete', movieIndex)
    if (movieIndex === false) return res.status(404).json({ message: 'Movie not found' })

    res.json({ message: 'Movie deleted' })
  }
}
