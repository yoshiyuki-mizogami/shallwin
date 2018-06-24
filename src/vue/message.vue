<style>
  .m{
    padding:5px;
    border-radius:2px;
    background-color:white;
    box-shadow:1px 1px 3px gray;
    margin:3px 0;
  }
  .m-head{
    font-size:12px;
    height:20px;
  }
  .m-head>div{
    float:left;
  }
  .m-icon{
    width:20px;
    height:100%;
  }
  .m-icon>img{
    height:100%;
    width:100%;
  }
  .m-username{
    width:190px;
    margin:0px 5px;
  }
  .m-time{
    font-size:10px;
    color:gray;
  }
  .m-body{
    white-space: pre-wrap;
    word-wrap:break-word;
  }
</style>

<template>
  <div class="m">
    <div class="m-head">
      <div class="m-icon"><img :src="`data:img/png;base64,${m.icon}`"/></div>
      <div class="m-username">{{m.name}}
        <span class="m-time">{{m.time | formatTime}}</span>
      </div>
      <div sytle="clear:both"/>
    </div>
    <div class="m-body">{{m.body}}</div>
  </div>
</template>
<script>
import moment from 'moment'
const TIME_FORMAT = 'HH:mm:ss'
export default {
  filters:{
    formatTime(v){
      return moment(v).format(TIME_FORMAT)
    }
  },
  props:{
    m:Object
  }
}
</script>
