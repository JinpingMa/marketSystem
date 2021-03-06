import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import user from './modules/user'
import permission from './modules/permission'
import errorLog from './modules/errorLog'
import bloomConfig from './modules/bloomConfig'
import codeConfig from './modules/codeConfig'
import marketData from './modules/market-data'
import upload from './modules/upload'
import getters from './getters'
import enums from './modules/enums'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    user,
    permission,
    errorLog,
    bloomConfig,
    codeConfig,
    marketData,
    enums,
    upload
  },
  getters
})

export default store
