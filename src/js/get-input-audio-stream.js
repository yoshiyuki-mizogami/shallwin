const audioMandatory = {
  echoCancellation:true,
  googEchoCancellation: true,
  googAutoGainControl: false,
  googAutoGainControl2: false,
  googNoiseSuppression: true,
  googHighpassFilter: true,
  googTypingNoiseDetection: true
}
function getInputAudioStream(){
  return navigator.mediaDevices.getUserMedia({
    audio:audioMandatory
  }).catch(e=>{
    console.error(e)
    return null
  })
}
module.exports = getInputAudioStream