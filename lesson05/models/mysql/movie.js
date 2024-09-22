import mysql from 'mysql2/promise.js'
import fs from 'node:fs'

const DEFAULT_CONFIG = {
  host: 'localhost',
  user: 'zilon',
  port: 3306,
  password: 'E00kapo0_76',
  database: 'moviesdb'
}

const sslCertificate = fs.readFileSync('config' + '/singlestore_bundle.pem')
let connectionString = JSON.parse(process.env.SINGLE_STORE_CONFIG) ?? DEFAULT_CONFIG

console.log('1 connectionString', connectionString)

/*
const connection = await mysql.createConnection(
  {
    host: 'svc-3482219c-a389-4079-b18b-d50662524e8a-shared-dml.aws-virginia-6.svc.singlestore.com',
    port: 3333,
    user: 'moviesdb-user',
    password: 'E00kapo0',
    database: 'db_pau_62cb1',
    ssl: {
      ca: sslCertificate
    }
  }
)
*/
connectionString = { ...connectionString, ssl: { ca: sslCertificate } }
console.log('2 connectionString', connectionString)

const connection = await mysql.createConnection(connectionString)

// For imports without /promise.js
// connection.query('SELECT ...', (err, results) => {})

export class MovieModel {
  static getAll = async ({ genre }) => {
    if (genre) {
      const lowerCaseGenre = genre.toLowerCase()
      // get genre ids from database table using genre names
      const [genres] = await connection.query(
        'SELECT id, name FROM genre WHERE lower(name) = ?;', [lowerCaseGenre]
      )
      // No genres found
      if (genres.length === 0) return []
      // get the id formm the first genre result
      const [{ id }] = genres
      let movieGenreQry = 'SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate ' +
                            'FROM movie m ' +
                            'JOIN movie_genres mg ON mg.movie_id = m.id ' +
                            'WHERE mg.genre_id in (?);'

      if (process.env.SINGLE_STORE_CONFIG) {
        movieGenreQry = 'SELECT HEX(id) id, title, year, director, duration, poster, rate ' +
                            'FROM movie m ' +
                            'JOIN movie_genres mg ON mg.movie_id = m.id ' +
                            'WHERE mg.genre_id in (?);'
      }
      const result = await connection.query(
        movieGenreQry, id
      )

      const [movies, ...tableInfo] = result

      console.log(tableInfo)

      return movies
    }

    let movieQuery = 'SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate from movie;'

    if (process.env.SINGLE_STORE_CONFIG) {
      movieQuery = 'SELECT HEX(id) id, title, year, director, duration, poster, rate from movie;'
    }

    const result = await connection.query(
      movieQuery
    )
    const [movies, ...tableInfo] = result
    console.log(tableInfo)

    return movies
  }

  /*
  async checkUUID({ id }, callback) {
    const [isUuid] = await connection.query(
      'SELECT IS_UUID(?);',
      [id]
    )

    if (isUuid === 0) return []
    if (isUuid === 1) callback({ id })
  }
  */

  static async getById ({ id }) {
    console.log('Received id', id, { id }, [id])
    let qrySelect = ''

    if (process.env.SINGLE_STORE_CONFIG) {
      const reUUID = /^\w{8}-\w{4}-\w{4}-\w{4}-\w+$/
      console.log('reg exp matches? ', id.toString().match(reUUID))
      if (id.toString().match(reUUID) === null) {
        return []
      }

      qrySelect = `SELECT HEX(id) id, title, year, director, duration, poster, rate 
       FROM movie WHERE id = unhex(replace(?, "-",""));`

      const sqlLog = connection.format(qrySelect, [id])
      console.log('sqllog', sqlLog)
    } else {
      const qryIsUUID = 'SELECT IS_UUID(?) isUuid;'
      const [isUuidQuery] = await connection.query(
        qryIsUUID,
        [id]
      )
      const [{ isUuid }] = isUuidQuery
      console.log('isUuid', isUuid)

      if (isUuid === 0) return []

      qrySelect = `SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate 
       FROM movie WHERE id = UUID_TO_BIN(?);`
    }

    console.log('qry select', qrySelect)
    const result = await connection.query(
      qrySelect,
      [id]
    )
    console.log('qry result', result)
    const [movies] = result

    if (movies.length === 0) return []

    return movies[0]
  }

  static async create ({ input }) {
    // Decompose the input object to get all elements
    const {
      title,
      year,
      director,
      duration,
      poster,
      rate,
      genre
    } = input
    console.log('genres', genre, genre.toString())
    // Get Genres
    const [genreIds, ...tableInfo] = await connection.query(
      'SELECT id FROM genre WHERE name in (?);',
      [genre]
    )
    console.log('genreIds: ', genreIds)
    console.log('tableInfo', tableInfo)
    // Generate a new UUID using SQL
    const [uuidResult] = await connection.query(
      'SELECT UUID() uuid;'
    )
    console.log('uuidResult', uuidResult)
    const [{ uuid }] = uuidResult
    console.log('uuid', uuid)

    let sqlQryMovie = `
      INSERT INTO movie (id, title, year, director, duration, poster, rate)
      VALUES(UUID_TO_BIN("${uuid}"), ?, ?, ?, ?, ?, ?);`
    let sqlQryMovieGenres = `
      INSERT INTO movie_genres (movie_id, genre_id)
      VALUES(UUID_TO_BIN("${uuid}"), ?);`
    let sqlQryMovieSelect = `
      SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate 
      FROM movie WHERE BIN_TO_UUID(id) = ?;`

    if (process.env.SINGLE_STORE_CONFIG) {
      sqlQryMovie = `
      INSERT INTO movie (id, title, year, director, duration, poster, rate)
      VALUES(UNHEX(replace("${uuid}", "-", "")), ?, ?, ?, ?, ?, ?);`
      sqlQryMovieGenres = `
      INSERT INTO movie_genres (movie_id, genre_id)
      VALUES(UNHEX(replace("${uuid}", "-", "")), ?);`
      sqlQryMovieSelect = `
      SELECT HEX(id) id, title, year, director, duration, poster, rate 
      FROM movie WHERE HEX(id) = replace(?, "-", "");`
    }
    try {
      const result = await connection.query(
        sqlQryMovie,
        [title, year, director, duration, poster, rate]
      )
      console.log('result', result)
      for (let i = 0; i < genreIds.length; i++) {
        try {
          const rel = await connection.query(
            sqlQryMovieGenres,
            [genreIds[i].id]
          )
          console.log(rel)
        } catch (e) {
          console.log(e)
          throw new Error(`Error inserting genre ${genreIds[i]} for film ${title}`)
        }
      }
    } catch (e) {
      console.log(e)
      // WARNING: Errors could send sensible information to the user
      throw new Error('Error creating movie')
      // Example of Send trace error information to a log server to review later
      // sendError(e)
    }
    // Get Movie from database to return it
    const [movies] = await connection.query(
      sqlQryMovieSelect,
      [uuid]
    )
    return movies[0]
  }

  static async delete ({ id }) {
    let affectedRows = 0
    console.log('id', id)
    try {
      let qryDeleteMovie = 'DELETE FROM movie WHERE BIN_TO_UUID(id) = ?;'

      if (process.env.SINGLE_STORE_CONFIG) {
        qryDeleteMovie = 'DELETE FROM movie WHERE id = UNHEX(replace(?, "-", ""));'
      }
      const [deleteMovie] = await connection.query(
        qryDeleteMovie,
        [id]
      )
      console.log('deleteMovie', deleteMovie)

      affectedRows = deleteMovie.affectedRows
      console.log('affectedRows (movie)', affectedRows)
      if (affectedRows === 0) return false

      try {
        let qryDeleteMovieGenres = 'DELETE FROM movie_genres WHERE BIN_TO_UUID(movie_id) = ?;'

        if (process.env.SINGLE_STORE_CONFIG) {
          qryDeleteMovieGenres = 'DELETE FROM movie_genres WHERE HEX(movie_id) = replace(?, "-", "");'
        }

        const [deleteGenre] = await connection.query(
          qryDeleteMovieGenres,
          [id]
        )

        console.log('deleteGenre', deleteGenre)
        affectedRows = deleteGenre.affectedRows
        console.log('affectedRows (genres)', affectedRows)
      } catch (e) {
        console.log('Error', e)
        throw new Error(`Error deleting gennres for movie with id: ${id}`)
      }

      return true
    } catch (e) {
      console.log('Error', e)
      throw new Error('Error deleting movie')
    }
  }

  static async update ({ id, input }) {
    // Decompose the input object to get all elements
    const {
      title,
      year,
      director,
      duration,
      poster,
      rate,
      genre
    } = input
    console.log('genre', genre)
    // Get movie details
    let qrySelectDetail = `SELECT 
         BIN_TO_UUID(id) uuid, 
         title movieTitle,
         year movieYear,
         director movieDirector,
         duration movieDuration,
         poster moviePoster,
         rate movieRate
       FROM movie
       WHERE BIN_TO_UUID(id) = ?;`

    if (process.env.SINGLE_STORE_CONFIG) {
      qrySelectDetail = `
        SELECT 
          HEX(id) uuid, 
          title movieTitle,
          year movieYear,
          director movieDirector,
          duration movieDuration,
          poster moviePoster,
          rate movieRate
        FROM movie
        WHERE id = unhex(replace(?, "-", ""));`
    }

    const selectQryDetail = connection.format(
      qrySelectDetail,
      [id]
    )
    console.log('selectQryDetail', selectQryDetail)
    const [movieDetail] = await connection.query(
      selectQryDetail
    )

    console.log('movieDetail', movieDetail)
    // Null Values are Get from Database
    if (movieDetail.length === 0) return false

    const [{
      uuid,
      movieTitle,
      movieYear,
      movieDirector,
      movieDuration,
      moviePoster,
      movieRate
    }] = movieDetail
    // Update movie details
    if (
      movieTitle !== (title || movieTitle) ||
      movieYear !== (year || movieYear) ||
      movieDirector !== (director || movieDirector) ||
      movieDuration !== (duration || movieDuration) ||
      moviePoster !== (poster || moviePoster) ||
      movieRate !== (rate || movieRate)
    ) {
      try {
        let qryUpdateMovie = `
          UPDATE movie
          SET title = ?, year = ?, director = ?, duration = ?, poster = ?, rate = ?
          WHERE BIN_TO_UUID(id) = '${id}';`

        if (process.env.SINGLE_STORE_CONFIG) {
          qryUpdateMovie = `
            UPDATE movie
            SET title = ?, year = ?, director = ?, duration = ?, poster = ?, rate = ?
            WHERE HEX(id) = replace('${id}', "-", "");`
        }
        console.log('qryUpdateMovie', qryUpdateMovie)
        const updateMovie = await connection.query(
          qryUpdateMovie,
          [
            (title || movieTitle),
            (year || movieYear),
            (director || movieDirector),
            (duration || movieDuration),
            (poster || moviePoster),
            (rate || movieRate)
          ]
        )
        console.log('updateMovie', updateMovie)
      } catch (e) {
        console.log('Error at update movie', e)
        throw new Error('Error updating the movie')
      }
    }

    if (genre) {
      // Get current Genres
      let qrySelectMovieGenres = `
        SELECT lower(name) genres 
        FROM genre g
        JOIN movie_genres mg ON mg.genre_id = g.id
        WHERE BIN_TO_UUID(mg.movie_id) = "${id}"
        ORDER BY name ASC;`

      if (process.env.SINGLE_STORE_CONFIG) {
        qrySelectMovieGenres = `SELECT lower(name) genres 
          FROM genre g
          JOIN movie_genres mg ON mg.genre_id = g.id
          WHERE HEX(mg.movie_id) = replace("${id}", "-", "")
          ORDER BY name ASC;`
      }
      const [movieGenres] = await connection.query(
        qrySelectMovieGenres
      )
      console.log('movieGenres', movieGenres)

      const genres = movieGenres.map(item => item.genres)
      console.log('movie genres: ', genres, genres.length)
      // Remove movie_genres items
      if (
        genres.toString() !== genre.sort().toString().toLowerCase()
      ) {
        console.log(
          'Sync genres from movie', genres.toString(),
          'vs Genres from UPDATE', genre.sort().toString().toLowerCase()
        )
        const unmatchGenresInMovie = genres.filter(x => !genre.toString().toLowerCase().includes(x))
        console.log('unmatchGenresInMovie', unmatchGenresInMovie)
        if (unmatchGenresInMovie.length > 0) {
          try {
            let qryDeleteMovieGenres = `
              DELETE FROM movie_genres
              WHERE BIN_TO_UUID(movie_id) = '${id}'
              AND genre_id IN (
                SELECT id FROM genre
                WHERE lower(name) in (?));`

            if (process.env.SINGLE_STORE_CONFIG) {
              qryDeleteMovieGenres = `DELETE FROM movie_genres
               WHERE movie_id = unhex(replace('${id}', "-", ""))
               AND genre_id IN (
                 SELECT id FROM genre
                 WHERE lower(name) in (?));`
            }
            const removeItems = await connection.query(
              qryDeleteMovieGenres,
              [unmatchGenresInMovie]
            )
            console.log('removeItems', removeItems)
          } catch (e) {
            console.log('Error removing items from movie_genre', e)
            throw new Error(`Genres for movie ${title} mismatch. Error at sincronize them`)
          }
        }
      }
      // Insert movie_genres items
      const newGenres = genre.filter(i => !genres.includes(i.toLowerCase()))
      console.log('new genres to this movie', newGenres)
      // Get Genres
      const [newGenreIds, ...tableInfo2] = await connection.query(
        'SELECT id FROM genre WHERE lower(name) in (?);',
        [newGenres]
      )
      console.log('newGenreIds: ', newGenreIds)
      console.log('tableInfo2', tableInfo2)
      for (let i = 0; i < newGenreIds.length; i++) {
        try {
          let qryInsertMovieGenres = `
            INSERT INTO movie_genres
            (movie_id, genre_id)
            VALUES(UUID_TO_BIN("${uuid}"), ?);`

          if (process.env.SINGLE_STORE_CONFIG) {
            qryInsertMovieGenres = `INSERT INTO movie_genres
            (movie_id, genre_id)
            VALUES(UNHEX(replace("${uuid}", "-", "")), ?);`
          }

          const rel = await connection.query(
            qryInsertMovieGenres,
            [newGenreIds[i].id]
          )
          console.log(rel)
        } catch (e) {
          console.log('Error inserting genres to movie_genre', e)
          throw new Error(`Error inserting genre ${newGenreIds[i]} for film ${title}`)
        }
      }
    }
    // Get Movie from database to return it
    let qrySelectMovie = `
      SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate 
      FROM movie WHERE BIN_TO_UUID(id) = ?;`

    if (process.env.SINGLE_STORE_CONFIG) {
      qrySelectMovie = `
        SELECT HEX(id) id, title, year, director, duration, poster, rate 
        FROM movie WHERE HEX(id) = replace(?, "-", "");`
    }
    const [updateMovie] = await connection.query(
      qrySelectMovie,
      [uuid]
    )
    return updateMovie[0]
  }
}
