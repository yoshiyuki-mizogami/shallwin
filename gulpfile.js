const g = require('gulp')
const {join} = require('path')
const {spawn} = require('child_process')
g.task('boot', ()=>{
  const el = require('electron')
  const booter = join(__dirname, 'src', 'booter')
  const boot = ()=>{
    const ps = spawn(el, [booter], {stdio:'inherit'})
    ps.on('close', boot);
  }
  boot()
})

g.task('compile', ()=>{
  const wp = require('webpack')
  const wpconfig = require('./webpack.config.js')
  const comp = wp(wpconfig)
  comp.watch({},(er, st)=>{
    console.log(st.toString({colors:true}))
  })
})

g.task('default', ['boot'])