/**
 * Created by OXOYO on 2019/4/4.
 *
 *
 */

export default {
  'background/switch': (state, data) => {
    state.background = data
  },
  'userInfo/update': (state, data) => {
    state.userInfo = data
  },
  'userInfo/reset': (state, data) => {
    state.userInfo = data
  },
  'home/resourceMap/update': (state, data) => {
    state.home.resourceMap = data
  },
  'admin/resourceMap/update': (state, data) => {
    state.admin.resourceMap = data
  }
}