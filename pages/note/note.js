Page({
  data: {
    title: "",
    clickCount: 0,
    show: false,
    imgs: []
  },
  onLoad() {
    const that = this
    my.getLocation({
      cacheTimeout: 0,
      success: (res) => {
        console.log(res)
        that.setData({
          lat: res.latitude,
          lon: res.longitude
        })
      },
      fail: (error) => {
        console.error('定位失败: ', JSON.stringify(error));
      },
    });
    this.getCurrentLocation()
  },

  getCurrentLocation() {
    const that = this
    setInterval(() => {
      my.getLocation({
        cacheTimeout: 0,
        success: (res) => {
          console.log(res)
          that.setData({
            lat: res.latitude,
            lon: res.longitude
          })
        },
        fail: (error) => {
          console.error('定位失败: ', JSON.stringify(error));
        },
      });
    }, 5000)
  },

  uploadSingleImage() {
    const that = this
    my.chooseImage({
      count: 1,

      sourceType: ['album'],
      success: function (res) {
        const path = res.apFilePaths[0]
        that.uploadImage(path)
      },
      fail: function (err) {
        console.log(err);
      },
    });

  },

  uploadImage(path) {
    const that = this
    my.uploadFile({
      filePath: path,
      url: "https://upload.calibur.cn/upload",
      name: "upload",
      hideLoading: false,
      fileType: "image",
      success(res) {
        const data = JSON.parse(res.data)
        console.log(data.path)

        that.setData({
          imgs: that.data.imgs.concat([data.path])
        })

      },
      fail(err) {
        console.log(err)
        my.alert(JSON.stringify(err))
      }
    })
  },

  bindFormSubmit(e) {
    const text = e.detail.value.textarea

    const user = my.getStorageSync({
      key: "userstring"
    }).data
    const loc = [this.data.lat, this.data.lon].join(',')

    console.log(user, loc, text)

    my.request({
      url: `https://huanong.calibur.cn/api/photo`,
      method: "POST",
      dataType: "json",
      data: {
        user,
        photo: imgs.join(','),
        extra: "",
        loc,
        text,
        cat: '产业调查'
      },
      success(res) {
        my.showToast({
          content: "入库成功"
        })
      },
      fail: function (error) {
        console.error('fail: ', JSON.stringify(error));
      },
    })
  },

  add() {
    const {
      clickCount,
      show
    } = this.data;
    const newCount = clickCount + 1;
    this.setData({
      clickCount: newCount
    });
    if (newCount >= 5 && !show) {
      this.setData({
        show: true
      });
    }
  },

  toPhoto() {
    my.navigateTo({
      url: '/pages/photo/photo'
    })
  },
  toPhotoExtra() {
    my.navigateTo({
      url: '/pages/midu/photo'
    })
  },
  toPhotoRecord() {
    my.showToast({
      content: "暂未开放，敬请期待"
    })
  },
  toWeb() {
    my.navigateTo({
      url: '/pages/web/web'
    })
  }
});