Page({
  data: {
    lat: 0,
    lon: 0,
  },
  onLoad() {
    this.webViewContext = my.createWebViewContext('web-view-1');
    this.getCurrentLocation()
  },
  onMessage(e) {
    const points = e.detail.points
    const pages = getCurrentPages()
    
    console.log(e.detail.points)
    if (pages.length > 1) {
      const prevPage = pages[pages.length - 2]

      console.log(points)

      // 直接修改上一页的数据
      prevPage.setData({
        points
      }, () => {
        setTimeout(() => {
          my.navigateBack()
        }, 1000)
      });

      // 手动调用上一页的更新方法（如果有）
      if (typeof prevPage.refreshData === 'function') {
        prevPage.refreshData(); // 触发上一页的刷新逻辑
      }
    }
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