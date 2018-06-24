const http = require('http')
const os = require('os')
const events= require('events')
const PORT = 41899
function getActiveIP(){
  const interfaces = os.networkInterfaces()
  const flatIps = []
  Object.keys(interfaces).forEach(interfaceName=>flatIps.push(...interfaces[interfaceName]))
  const [active] = flatIps.filter(f=>{
    return f.family === 'IPv4' && !f.mac.startsWith('0')
  })
  return active.address
}
module.exports = class SignalServer extends events{
  constructor(){
    super()
    this.ip = getActiveIP()
    this.server = http.createServer(async (request,response)=>{
      const bodydata = []
      request.on('data', d=>bodydata.push(d))
      request.on('end', ()=>{
        const dataString = bodydata.join('')
        const body =  JSON.parse(dataString)
        this.emit(body.method, body, response)
      })
    })
  }
  boot(){
    this.server.listen(PORT)
  }
  shutdown(){

  }
  getIP(){
    return this.ip
  }
  getPort(){
    return PORT
  }
}