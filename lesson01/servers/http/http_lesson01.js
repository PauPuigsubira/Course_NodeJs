const http = require('node:http')
const { findAvailablePort } = require('../net/net.js')

const server = http.createServer((req, res) => {
  console.log('request received')
  res.end('Server Up')
})

findAvailablePort(3000).then(port => {
  // port 0 means: use the first available port
  server.listen(port, () => {
    // console.log(`Server is listening on http://localhost:${server.address().port}`)
    console.log(`Server is listening on http://localhost:${port}`)
  })
})
