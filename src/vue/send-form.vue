<style>
.send-form{
  height:50px;
}
.message-input{
  resize:none;
  height:100%;
  padding:3px;
  width:100%;
  outline:none;
}
</style>

<template>
  <div class="send-form">
    <textarea v-model="message" placeholder="Ctrl+Enterで送信" class="message-input" 
     @keydown.ctrl.enter="snedMessage"></textarea>
  </div>
</template>
<script>
export default {
  data(){
    return {
      message:''
    }
  },
  methods:{
    snedMessage(){
      if(!this.message){
        return
      }
      const {message} = this
      this.message = ''
      this.$parent.sendMessage(message)
    }
  }
}
</script>
