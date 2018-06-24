const events = require('events')
const audioContext = require('./audio-context')
const getInputAudioStream = require('./get-input-audio-stream')
module.exports = class AudioStreamer extends events{
  constructor(){
    super()
  }
  async getMyStream(windowId){
    const audioStream = await getInputAudioStream()
    this.stream = audioStream
    return audioStream
  }
  stopStream(){
    this.stream.getTracks().forEach(t=>t.stop())
  }
  addAudio(auidoStream){

  }
}
