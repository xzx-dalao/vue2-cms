import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/css/global.css'


Vue.config.productionTip = false

import ElementUI from 'element-ui';
Vue.use(ElementUI);

import axios from 'axios'
axios.defaults.baseURL = 'http://119.23.53.78:8888/api/private/v1'
// axios.defaults.baseURL = 'http://www.ysqorz.top:8888/api/private/v1'
// axios.defaults.baseURL = 'http://127.0.0.1:5000'
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers.Authorization=window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
