Page({
  data: {
    lat: 0,
    lon: 0,
  },
  onLoad() {
    this.webViewContext = my.createWebViewContext('web-view-1');
    this.getCurrentLocation()
  },
  getCurrentLocation() {
    const that = this
    const user = my.getStorageSync({
      key: 'userstring'
    })

    this.timer = setInterval(() => {
      my.getLocation({
        cacheTimeout: 0,
        success: (res) => {
          console.log(res)
          that.webViewContext.postMessage({
            lat: res.latitude,
            lon: res.longitude,
            user: user.data
          });
          that.setData({
            lat: res.latitude,
            lon: res.longitude
          })
        },
        fail: (error) => {
          console.error('定位失败: ', JSON.stringify(error));
        },
      });
    }, 1000);
  },
});