<style>
html,body{
  padding:0;
  margin:0;
  height:100%;
  width:100%;
  box-sizing:border-box;
  font-family:meiryo;
  overflow:hidden;
}
.cover{
  position:absolute;
  top:0;
  left:0;
  height:100%;
  width:100%;
  background-color:rgba(0,0,0,0.5);
}
::-webkit-scrollbar{
  width:8px;
  background:#eee;
}
::-webkit-scrollbar:horizontal{
  height:5px;
}
::-webkit-scrollbar-button{
  width:5px;
  height:5px;
  background:#CCC;
}
::-webkit-scrollbar-piece{
  background:#eee;
}
::-webkit-scrollbar-piece:start{
  background:#eee;
}
::-webkit-scrollbar-thumb{
  background:#CCC;
}
::-webkit-scrollbar-corner{
  background:#CCC;
}
#app{
  height:100%;
  width:100%;
}
.bar{
  height:20px;
  background-color:lightblue;
}
.bar .close-btn{
  -webkit-app-region:no-drag;
  cursor:pointer;
  float:right;
  width:20px;
  height:20px;
  border-radius:100%;
  background-color:rgb(255, 100,100);
}
input[type=button]{
  border-radius:2px;
  border:solid 4px rgb(200, 200, 255);
  padding:3px;
  background-color:rgb(230,230,230);
  cursor:pointer;
  transition:border .3s ease;
}
.video{
  max-height:100%;
  max-width:100%;
}
.right-bar{
  height:100%;
  width:250px;
  position:fixed;
  right:0;
  bottom:0;
  background-color:rgb(255,233,200);
}
.guest-messages{
  height:calc(100% - 50px);
  overflow-y:scroll;
}
</style>
<template>
<div id="app">
  <video class="video" ref="video" autoplay/>
  <div class="right-bar">
    <send-form/>
    <div class="guest-messages">
      <messages :mss="messages"/>
    </div>
  </div>
</div>
</template>
<script>
/*globals Vue*/
import {remote, ipcRenderer} from 'electron'
import AudioStreamer from '../js/audio-streamer'
import Messages from './messages.vue'
import SendForm from './send-form.vue'
const audioStreamer = new AudioStreamer()
const thisWindow = remote.getCurrentWindow()
export default {
  components:{
    messages:Messages,
    'send-form':SendForm
  },
  data(){
    return {
      peerId:process.env.COMPUTERNAME + '-' + process.env.USERNAME,
      cover:false,
      connected:false,
      hostUrl:'',
      hostConnection:null,
      messages:[],
      user:{
        name:'',
        icon:''
      }
    }
  },
  async created(){
    thisWindow.emit('get-account-info', acc=>{
      this.user = JSON.parse(acc)
    })
    this.audioStream = await audioStreamer.getMyStream()
    thisWindow.emit('get-data',(data)=>{
      const receiveData = JSON.parse(data)
      Object.assign(this, receiveData)
      this.startRequest()
    })
  },
  methods:{
    sendMessage(mes){
      const m = {
        name:this.user.name,
        icon:this.user.icon,
        time:Date.now(),
        body:mes
      }
      this.dataChannel.send(JSON.stringify(m))
    },
    receiveMessage(message){
      console.log(message)
    },
    async startRequest(){
      const pc = new RTCPeerConnection()
      pc.addEventListener('datachannel',ev=>{
        const {channel} = ev
        this.dataChannel = channel
        channel.addEventListener('message', ev=>{
          this.receiveMessage(JSON.parse(ev.data))
        })
      })
      if(this.audioStream){
        pc.addStream(this.audioStream)
      }
      pc.onicecandidate = async ev=>{ // no need on LAN
        if(!ev.candidate){
          return
        }
        const res = await fetch(this.hostUrl,{
          method:'POST', 
          body:JSON.stringify({peerId:this.peerId, method:'candidate', data:ev.candidate})
        })
        const candidate = await res.json()
        pc.addIceCandidate(candidate)
      }
      pc.onaddstream = ev=>{
        const v = this.$refs.video
        v.srcObject = ev.stream
      }
      const res = await fetch(this.hostUrl,{
        method:'POST', 
        body:JSON.stringify({peerId:this.peerId,method:'init'})
      })
      const offer = await res.json()
      await pc.setRemoteDescription(offer)
      const answer = await pc.createAnswer()
      pc.setLocalDescription(answer)
      await fetch(this.hostUrl,{
        method:'POST',
        body:JSON.stringify({peerId:this.peerId, method:'answer', data:answer})
      })
      
    },
    closeMe(){
      window.close();
    }
  }
}
</script>
