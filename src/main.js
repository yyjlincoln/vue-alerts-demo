import Vue from 'vue'
import App from './App.vue'

import vueAlerts from "vue-alerts"
Vue.config.productionTip = false

Vue.use(vueAlerts, {
  developerMode: true,
  presentBlockTime: 100,
  dismissBlockTime: 100,
})

new Vue({
  render: h => h(App),
}).$mount('#app')
