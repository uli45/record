import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
import uView from '@/uni_modules/uview-ui'
Vue.use(uView)
Vue.config.productionTip = false
App.mpType = 'app'
if (process.env.NODE_ENV !== 'production') {
	// console.log = () => {}//开发环境去除看一下效果
}else{
	//正式环境去除
	console.log = () => {}
}
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif