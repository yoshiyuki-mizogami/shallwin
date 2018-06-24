<style>
.display{
  height:70px;
  cursor:pointer;
}
.display:hover{
  background-color:rgb(255, 233,200);
}
.disp-thum{
  vertical-align:top;
  height:90%;
}
.disp-name{
  vertical-align:middle;
}
</style>

<template>
<div class="display" @click="selectIt">
  <img class="disp-thum" :src="d.desktop.thumbnail.toDataURL()">
  <span class="disp-name">{{d.desktop.name}}</span>
</div>
</template>

<script>
export default {
  props:{
    d:Object,
    required:true
  },
  methods:{
    selectIt(){
      this.$parent.setTarget(this.d)
    }
  }
}
</script>
