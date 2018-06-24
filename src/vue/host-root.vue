<style>
html,body{
  padding:0;
  margin:0;
  height:100%;
  width:100%;
  box-sizing:border-box;
  font-family:meiryo;
  overflow:hidden;
  background-color:rgb(233,255,244);
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
.main{
  position:relative;
  height:calc( 100% - 20px);
}
.bar{
  -webkit-app-region:drag;
  height:20px;
  text-align:center;
  background-color:rgb(200,255,200)
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
div,input,textarea,select, video, ul{
  box-sizing:border-box;
  font-family:"メイリオ";
  margin:0;
  padding:0;
}
.description{
  text-align:center;
  font-size:12px;
}
input[type=text]{
  width:120px;
  text-align:center;
}
.icon{
  vertical-align:bottom;
  height:100%;
  width:100%;
}
input[type=button]{
  border-radius:2px;
  border:solid 4px rgb(200, 200, 255);
  padding:3px;
  background-color:rgb(230,230,230);
  cursor:pointer;
  transition:border .3s ease;
}
.displays{
  text-align:center;
  background-color:white;
  width:100%;
  margin-top:100px;
}
.host-messages{
  height:calc( 100% - 50px);
  overflow-y:scroll;
}
.display-cover{
  z-index:100;
  position:fixed;
  bottom:0;
  left:0;
  height:calc(100% - 20px);
  width:100%;
  background-color:rgba(0,0,0,.5);
}
.disp-exp{
  background-color:rgb(233,233,255);
}
.dcov-enter-active, .dcov-leave-active{
  transition:all .3s ease;
  opacity:1;
}
.dcov-enter, .dcov-leave-to{
  opacity:0;
}
</style>
<template>
<div id="app">
  <div class="cover" v-if="cover"></div>
  <div class="bar">
    <div class="close-btn" @click="closeMe"></div>
  </div>
  <div class="main">
    <transition name="dcov">
      <div class="display-cover" v-if="!targetDisplay">
        <div class="displays" >
          <div class="disp-exp">共有ディスプレイを選択</div>
          <display v-for="d in displays" :key="d.display.id" :d="d"/>
        </div>
      </div>
    </transition>
    <send-form/>
    <div class="host-messages">
      <messages :mss="messages"/>
    </div>
  </div>
  <div class="audios" ref="audios">
    <!-- <audio v-for="a in audios"></audio> -->
  </div>
</div>
</template>
<script>
/*globals Vue*/
import {remote, ipcRenderer,desktopCapturer, screen} from 'electron'
import unknown from '../js/unknown.js'
import VideoStreamer from '../js/video-streamer'
import SignalServer from '../js/signal-server'
import Display from './display.vue'
import Messages from './messages.vue'
import SendForm from './send-form.vue'
import MessagesMixin from '../js/messages-mixin'
const THUMBNAIL_UPDATE_INTERVAL = 5000
const thisWindow = remote.getCurrentWindow()
const signalServer = new SignalServer()
const peerHash = {}

signalServer.on('init', async (initData, response)=>{
  const {peerId} = initData
  const peer = await rootVm.createNewPeer()
  peerHash[peerId] = peer
  response.end(JSON.stringify(peer.offer))
})
signalServer.on('candidate', async (data, response)=>{
  const {peerId} = data
  const candidate = data.data
  const peer = peerHash[peerId]
  peer.pc.addIceCandidate(candidate)
  response.end(JSON.stringify(peer.candidate))
})
signalServer.on('answer', async (data, response)=>{
  const {peerId} = data
  const peer = peerHash[peerId]
  peer.pc.setRemoteDescription(data.data)
})
let rootVm
let messageID = 1
export default {
  mixins:[MessagesMixin],
  data(){
    return {
      cover:false,
      displays:[],
      iconUrl:'',
      hostIP:'',
      hostPort:0,
      targetDisplay:null,
      messages:[],
      audios:[],
      user:{
        name:'',
        icon:''
      }
    }
  },
  components:{
    messages:Messages,
    display:Display,
    'send-form':SendForm
  },
  async created(){
    thisWindow.emit('get-account-info', data=>{
      const userData = JSON.parse(data)
      this.user = userData
    })
    rootVm = this
    this.displays = await this.getDisplays()
    this.updateDisplayThumbnail()
    this.bootServer()
  },
  methods:{
    receiveMessage(ev){
      const obj = JSON.parse(ev.data)
      console.log(obj)
      this.sendMessage(obj)
    },
    sendMessage(mess){
      let m
      if(mess.constructor === String){
        m = {
          id:messageID++,
          name:this.user.name,
          icon:this.user.icon,
          time: Date.now(),
          body:mess
        }
      }else{
        m = mess
      }
      Object.keys(peerHash).forEach(peerId=>{
        const peer = peerHash[peerId]
        peer.dataChannel.send(JSON.stringify(m))
      })
      this.addMessage(m)
    },
    async getDisplays(){
      const displays = screen.getAllDisplays()
      const desktops = await new Promise(resolve=>{
        desktopCapturer.getSources({types:['screen']}, (er, ws)=>{
          resolve(ws)
        })
      })
      return displays.map((d, i)=>{
        return {
          display:d,
          desktop:desktops[i]
        }
      })
    },
    updateDisplayThumbnail(){
      setTimeout(async ()=>{
        if(this.targetDisplay){
          return
        }
        const desktops = await new Promise(resolve=>{
          desktopCapturer.getSources({types:['screen']}, (er, ws)=>resolve(ws))
        })
        this.displays.forEach((d, ind)=>{
          d.desktop = desktops[ind]
        })
        this.updateDisplayThumbnail()
      }, THUMBNAIL_UPDATE_INTERVAL)
    },
    bootServer(){
      const that = this
      this.hostIP = signalServer.getIP()
      this.hostPort = signalServer.getPort()
      signalServer.boot()
    },
    async createNewPeer(){
      const pc = new RTCPeerConnection()
      const dataChannel = pc.createDataChannel('chat')
      pc.onaddstream = ev=>{
        const audioWrapper = this.$refs.audios
        const audio = document.createElement('audio')
        audioWrapper.appendChild(audio)
        audio.srcObject = ev.stream
      }
      pc.addStream(this.stream)
      dataChannel.addEventListener('message', this.receiveMessage)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      pc.onicecandidate = ev=>{ // no need on LAN
        if(!ev.candidate){
          return
        }
        peer.candidate = ev.candidate
      }
      const peer = {
        pc,
        dataChannel,
        candidate:null,
        offer
      }
      return peer
    },
    async setTarget(d){
      this.targetDisplay = d.desktop
      const vs = new VideoStreamer()
      const stream = await vs.getMyStream(d.desktop.id)
      this.stream = stream
      ipcRenderer.send('shallwin-host-booted',JSON.stringify({
        hostUrl:`http://${this.hostIP}:${this.hostPort}/`
      }))
    },
    closeMe(){
      close();
    }
  }
}
</script>
