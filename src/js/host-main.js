import Vue from 'vue'
import Root from '../vue/host-root.vue'
import {remote, screen} from 'electron'

setRightCorner()
new Vue({
  el:'#app',
  render(createElement){
    return createElement(Root)
  }
})


function setRightCorner(){
  const thisWindow = remote.getCurrentWindow()
  const [width, height] = thisWindow.getSize()
  const {workArea:wa} = screen.getPrimaryDisplay()
  const resultX = wa.x + wa.width - width
  thisWindow.setSize(width, wa.height / 2)
  thisWindow.setPosition(resultX, wa.y)
}