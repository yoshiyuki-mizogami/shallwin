const MESSAGE_LIMIT = 30
module.exports = {
  data(){
    return {
      messages:[]
    }
  },
  methods:{
    addMessage(m){
      this.messages.unshift(m)
      if(MESSAGE_LIMIT <= this.messages.length){
        this.messages.pop()
      }
    }
  }
}