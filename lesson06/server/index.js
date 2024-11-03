import express from 'express'
import logger from 'morgan'
import dotenv from 'dotenv'

import { Server } from 'socket.io'
import { createServer } from 'node:http'
import { createClient } from "@libsql/client";

dotenv.config({ path: 'server/.env' })

const port = process.env.PORT ?? 3000

const app = express()
const server = createServer(app)
const io = new Server(server, {
    connectionStateRecovery: {
        // the backup duration of the sessions and the packets
        maxDisconnectionDuration: 1 * 15 * 1000,
        // whether to skip middlewares upon successful recovery
        skipMiddlewares: true,
    }
})

const db = createClient({
    url: process.env.DB_URL,
    authToken: process.env.DB_TOKEN
})

await db.execute(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,
        user TEXT
    )
`)

io.on('connection', async (socket) => {
    console.log('A user has connected')
    console.log('socket', socket)

    socket.on('disconnect', () => {
        console.log('An user has disconnected')
    })

    socket.on('chat message', async (msg) => {
        console.log('auth', socket.handshake.auth)
        let result

        try {
            result = await db.execute({
                sql: 'INSERT INTO messages (content, user) VALUES (:msg_content, :user_auth)',
                args: { msg_content: msg, user_auth: socket.handshake.auth.username }
            })
        } catch(e) {
            console.error(e)
        }

        io.emit('chat message', msg, result.lastInsertRowid.toString(), socket.handshake.auth.username)
    })

    if (!socket.recovered) {
        try {
            const results = await db.execute({
                sql: 'SELECT id, content, user FROM messages WHERE id > ?',
                args: [socket.handshake.auth.serverOffset ?? 0]
            })

            results.rows.forEach(row => {
                socket.emit('chat message', row.content, row.id.toString(), row.user)
            })
        } catch(e) {
            console.error(e)
        }
    }
})

app.use(logger('dev'))

app.get('/favicon.ico', (req, res) => {
    res.sendFile(process.cwd() + '/assets/talk.png')
})

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/client/index.html')
})

server.listen(port, () => {
    console.log(`Server is running at port ${port}`)
    console.log(`Directory is ` + process.cwd())
})