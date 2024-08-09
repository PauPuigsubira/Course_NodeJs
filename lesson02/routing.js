const http = require('node:http')
const dittoJson = require('./pokemon/ditto.json')

function processRequestGET (req, res) {
  const { url } = req

  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html;charset=utf-8')

  switch (url) {
    case '/pokemon/ditto':
      res.setHeader('Content-Type', 'application/json;charset=utf-8')
      res.end(JSON.stringify(dittoJson))
      break
    default:
      res.statusCode = 404
      res.end('<H1>404 Not Found</H1>')
  }
}

function processRequestPOST (url, req, res) {
  switch (url) {
    case '/pokemon': {
      // Variable to accumulate request Chunks
      let reqBody = ''
      // Reading fragments of data
      req.on('data', chunk => {
        // Chunk is a buffer so before add to our
        // variable is required to transform to
        // String
        reqBody += chunk.toString()
      })

      req.on('end', () => {
        // Convert JSON data to a JavaScript Object using JSON.parse(data)
        const data = JSON.parse(reqBody)
        data.timestamp = Date.now()
        // Pending -> Call to a DataBase to save the new resource
        // Set Status and header using writeHeader
        res.writeHeader(201, { 'Content-Type': 'application/json; charset=utf-8' })
        // To convert a javascript object to a JSON use JSON.stringify(javaObject)
        // Navigators understand json but not javascript objects (crashed)
        res.end(JSON.stringify(data))
      })
      break
    }
    default:
      res.statusCode = 404
      res.setHeader('Content-type', 'text/plain;charset=utf-8')
      res.end('404 Not Found')
  }
}

const processRequest = (req, res) => {
  const { method, url } = req

  switch (method) {
    case 'GET':
      processRequestGET(req, res)
      break
    case 'POST':
      processRequestPOST(url, req, res)
      break
    default:
      res.statusCode = 400
      res.setHeader('Content-Type', 'text/plain;charset=utf-8')
      res.end(`Method ${method} is not accepted to this server`)
  }
}

const server = http.createServer(processRequest)

server.listen(1234, () => {
  console.log(`Server listening on port http://localhost:${server.address().port}`)
})
