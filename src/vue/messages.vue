<style>
.messages{
  overflow-y:scrool;
  height:100%;
  width:100%;
  padding:3px;
}
</style>
<template>
  <div class="messages">
    <message v-for="m in mss" :m="m" :key="m.id"/>
  </div>
</template>

<script>
import Message from './message.vue'
export default {
  props:{
    mss:Array
  },
  components:{
    message:Message
  }
}
</script>
