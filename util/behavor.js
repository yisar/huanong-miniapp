module.exports = Behavior({
  data: {
    globalUserInfo: null,
    globalToken: ''
  },
  
  methods: {
    // 更新全局用户信息
    setGlobalUserInfo(userInfo) {
      this.setData({
        globalUserInfo: userInfo
      })
      getApp().globalData.userInfo = userInfo // 同步到globalData
    },
    
    // 获取全局token
    getGlobalToken() {
      return this.data.globalToken || getApp().globalData.token
    }
  }
})
