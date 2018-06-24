import Vue from 'vue'
import Root from '../vue/guest-root.vue'
import {remote} from 'electron'
const thisWindow = remote.getCurrentWindow()
new Vue({
  el:'#app',
  render(createElement){
    return createElement(Root)
  }
})