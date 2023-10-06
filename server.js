const app = require('./index')
const port = 8080
const fs = require('fs')
const http = require('https')

const options = {
    key: fs.readFileSync('Keys/privatekey.pem'),
    cert: fs.readFileSync('Keys/certificate')
}

const server = http.createServer(options, app)


server.listen(port, ()=>{
    console.log('Server started on port' + port)
})




