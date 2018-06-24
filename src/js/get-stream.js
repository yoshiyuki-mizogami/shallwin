let el = require('electron')
/** @type {AudiotContext} */
let context = require('./get-audio-context.js')
const FRAMERATE = 10
function getDesktopStream(wid, windowIndex){
  let targetDisplay = el.screen.getAllDisplays()[windowIndex]
  let size = {
    width:targetDisplay.size.width,
    height:targetDisplay.size.height
  }
  let mandatory = {
    chromeMediaSource:'desktop',
    chromeMediaSourceId:wid,
    maxFrameRate:FRAMERATE,
    minWidth:size.width,
    minHeight:size.height,
    maxWidth:size.width,
    maxHeight:size.height
  };
  return navigator.mediaDevices.getUserMedia({
    video:{mandatory},
    audio:{
      mandatory:{
        chromeMediaSource:'desktop'
      }
    }
  }).catch(e=>{
    console.error(e)
    /*desktop audio not found*/
    return navigator.mediaDevices.getUserMedia({
      video:{mandatory}
    })
  }).then(async desktopStream=>{
    let [audioTrack] = desktopStream.getAudioTracks()
    let merger = context.createChannelMerger(1)
    if(audioTrack){
      desktopStream.removeTrack(audioTrack)
      let desktopAudioStream = context.createMediaStreamSource(new MediaStream([audioTrack]))
      desktopAudioStream.connect(merger)
    }
    let inputStream = await getInputAudioStream()
    if(inputStream){
      context.createMediaStreamSource(inputStream).connect(merger)
    }
    let dest = context.createMediaStreamDestination()
    merger.connect(dest)
    let destStream = dest.stream
    let [mergeTrack] = destStream.getAudioTracks()
    if(mergeTrack){
      desktopStream.addTrack(mergeTrack)
    }
    return {
      desktopStream,
      desktopAudioTrack:audioTrack
    }
  })
}
let audioMandatory = {
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
module.exports = {
  getDesktopStream,
  getInputAudioStream,
}