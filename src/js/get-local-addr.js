function getLocalAddr(){
  let os = require('os')
  let interfaces = os.networkInterfaces()
  let localIntf = null; 
  for(let intname in interfaces){
    let intf = interfaces[intname];
    let find = intf.some(entry=>{
      if(entry.family !== 'IPv4' || entry.internal){
        return
      }
      localIntf = entry
    })
    if(find){
      break
    }
  }
  return localIntf.address
}
module.exports = getLocalAddr