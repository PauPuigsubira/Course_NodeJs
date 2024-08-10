const http = require('node:http')
const fs = require('node:fs')
const desiredPort = process.env.port ?? 1234

const processRequest = (req, res) => {
// this charset is mandatory on content-type to put the spanish accents correctly
  res.setHeader('Content-type', 'text/html;charset=utf-8')

  if (req.url === '/') {
    res.statusCode = 200
    // this charset is mandatory on content-type to put the spanish accents correctly
    res.setHeader('Content-type', 'text/plain;charset=utf-8')
    res.end('Bienvenido a mi página de inicio')
  } else if (req.url === '/contacto') {
    res.statusCode = 200
    // this charset is mandatory on content-type to put the spanish accents correctly
    res.end('<h1>Contacto</h1>')
  } else if (req.url === '/sailie') {
    fs.readFile('assets/ImitacionSailie.jpeg', (err, data) => {
      if (err) {
        res.statusCode = 500
        res.end('<h1>500 Internal Server Error</h1>')
      } else {
        res.setHeader('Content-type', 'image/jpeg')
        res.end(data)
      }
    })
  } else {
    res.statusCode = 404 // Not Found
    res.end('<h1>404</h1>')
  }
}
const server = http.createServer(processRequest)

server.listen(desiredPort, () => {
  console.log(`Server is listening on http://localhost:${server.address().port}`)
})
