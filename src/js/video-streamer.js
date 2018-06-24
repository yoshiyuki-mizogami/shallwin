const events = require('events')
const audioContext = require('./audio-context')
const FRAMERATE = 10
const getInputAudioStream = require('./get-input-audio-stream')
module.exports = class VideoStreamer extends events{
  constructor(){
    super()
  }
  async getMyStream(windowId){
    const mandatory = {
      chromeMediaSource:'desktop',
      chromeMediaSourceId:windowId,
      maxFrameRate:FRAMERATE
    }
    const desktopStream = await navigator.mediaDevices.getUserMedia({
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
    })
    this.stream = desktopStream
    return desktopStream
  }
  async addDesktopAudio(){
    /* Already included mic auido if enable. Marge it and desktop auido */
    const desktopStream = this.stream
    let [audioTrack] = desktopStream.getAudioTracks()
    let merger = audioContext.createChannelMerger(1)
    if(audioTrack){
      desktopStream.removeTrack(audioTrack)
      let desktopAudioStream = audioContext.createMediaStreamSource(new MediaStream([audioTrack]))
      desktopAudioStream.connect(merger)
    }
    let inputStream = await getInputAudioStream()
    if(inputStream){
      audioContext.createMediaStreamSource(inputStream).connect(merger)
    }
    let dest = audioContext.createMediaStreamDestination()
    merger.connect(dest)
    let destStream = dest.stream
    let [margedTrack] = destStream.getAudioTracks()
    if(margedTrack){
      desktopStream.addTrack(margedTrack)
    }
  }
  stopStream(){
    this.stream.getTracks().forEach(t=>t.stop())
  }
  addAudio(auidoStream){

  }
}

