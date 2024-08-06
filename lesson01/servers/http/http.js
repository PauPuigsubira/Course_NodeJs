const http = require('node:http')
const desiredPort = process.env.port ?? 1234

const server = http.createServer((req, res) => {
  console.log('request received')
  res.end('Server Up')
})

server.listen(desiredPort, () => {
  console.log(`Server is listening on http://localhost:${server.address().port}`)
})
