import { randomUUID } from 'node:crypto'
import { readJSON } from '../libs/utils.js'

const movies = readJSON('../assets/movies.json')

export class MovieModel {
  static getAll = async ({ genre }) => {
    if (genre) {
      return movies.filter(
        // movie => movie.genre.includes(genre)
        movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
      )
    }

    return movies
  }

  static async getById ({ id }) {
    const movie = movies.find(movie => movie.id === id)

    return movie
  }

  static async create ({ input }) {
    const newMovie = {
      id: randomUUID(), // creates a native UUID v4
      ...input
    }
    // This won't be REST protocol because we are saving data in memory!!!
    movies.push(newMovie)

    return newMovie
  }

  static async delete ({ id }) {
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) return false

    movies.splice(movieIndex, 1)

    return true
  }

  static async update ({ id, input }) {
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) return false

    const updateMovie = {
      ...movies[movieIndex],
      ...input
    }

    movies[movieIndex] = updateMovie

    return updateMovie
  }
}
