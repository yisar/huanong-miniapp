Page({
  data: {
    show: false,
    photo: '',
    test: '',
    index: 0,
  },
  onLoad(query) {
    const user = my.getStorageSync({
      key: 'userstring'
    })
    console.log(user)
    this.setData({
      user: user.data
    })

  },
  toMini2() {
    my.navigateTo({
      url: '/pages/ditu2/web'
    })
  },
  bindPickerChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    this.setData({
      index: e.detail.value,
    });
  },
  onReady() {
    // 页面加载完成
  },
  getDirection: function (deg) {
    let dir = '未知';
    if (deg >= 340 || deg <= 20) {
      dir = '北';
    } else if (deg > 20 && deg < 70) {
      dir = '东北';
    } else if (deg >= 70 && deg <= 110) {
      dir = '东';
    } else if (deg > 110 && deg < 160) {
      dir = '东南';
    } else if (deg >= 160 && deg <= 200) {
      dir = '南';
    } else if (deg > 200 && deg < 250) {
      dir = '西南';
    } else if (deg >= 250 && deg <= 290) {
      dir = '西';
    } else if (deg > 290 && deg < 340) {
      dir = '西北';
    }
    return {dir, deg}
  },

  startLuoPan() {
    my.startCompass();
    my.onCompassChange((res) => {
      console.log(res)
      const data = this.getDirection(res.direction)
      this.setData(data)
    });

  },
  onShow() {

    const that = this;
    this.timer = my.getLocation({
      type: 0, // 获取经纬度和省市区县数据
      cacheTimeout: 0,
      success: (res) => {
        that.setData({
          lat: res.latitude,
          lon: res.longitude
        })
      },
      fail: (error) => {
        console.error('定位失败: ', JSON.stringify(error));
      },
    });

  },
  // 检查并请求定位权限

  onHide() {
    // 页面隐藏
  },
  onUnload() {
    // 页面被关闭
  },
  onTitleClick() {
    // 标题被点击
  },
  onPullDownRefresh() {
    // 页面被下拉
  },
  onReachBottom() {
    // 页面被拉到底部
  },
  showWater() {
    this.setData({
      show: false
    })
  },
  saveImage(path) {
    my.saveImageToPhotosAlbum({
      filePath: path,
      success(res) {
        console.log('saveImageToPhotosAlbum 调用成功', res);
      },
      fail(err) {
        console.log('saveImageToPhotosAlbum 调用失败', err);
        const platform = my.env.platform;
        if (err.error === 15) {
          // 提示用户开启相册权限
          if (platform === 'iOS') {
            my.showAuthGuide({
              authType: 'PHOTO',
              complete(res) {
                if (res.shown) {
                  console.log('已展示权限引导');
                } else {
                  console.error('保存图片失败: ', '请在系统设置中为支付宝并开启相册权限', JSON.stringify(err));
                }
              },
            });
          } else if (platform === 'Android') {
            console.error('保存图片失败: ', '请在系统设置找到支付宝应用并开启文件和多媒体写入权限', JSON.stringify(err));
          }
        }
      },
    });

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
    }, 1000)
  },
  uploadImage(path, value = '') {
    const that = this
    my.uploadFile({
      filePath: path,
      url: "https://upload.calibur.cn/upload",
      name: "upload",
      hideLoading: true,
      fileType: "image",
      success(res) {
        const data = JSON.parse(res.data)
        console.log(data.path)

        my.request({
          url: `https://huanong.calibur.cn/api/photo`,
          method: "POST",
          dataType: "json",
          data: {
            user: that.data.user,
            photo: data.path,
            extra:that.data.points,
            loc: [that.data.lat, that.data.lon, that.data.deg].join(','),
            text: value,
            cat:'定位拍照'
          },
          success(res) {
            console.log(222)
            my.showToast({
              content: "入库成功"
            })
          },
          fail: function (error) {
            console.log(333)
            console.error('fail: ', JSON.stringify(error));
          },
        })

      },
      fail(err) {
        console.log(err)
        my.alert({
          content: JSON.stringify(err)
        })
      }
    })
  },

  takePhoto2() {
    if(!this.data.points){
      my.alert({
        content:"左下角先选线路噻"
      })
      return
    }
    const that = this
    this.setData({
      show: true
    })
    this.startLuoPan()
    this.getCurrentLocation()

    const ctx = my.createCameraContext('camera')
    ctx.takePhoto({
      quality: 'high',
      success: async (res) => {
        const tempFilePath = res.tempImagePath
        that.setData({
          photo: tempFilePath,
        }, async () => {

          // const path = await that.modifyImage(tempFilePath)
          // console.log(path)
          const path = tempFilePath

          setTimeout(() => {
            that.uploadImage(path)
          }, 1000)
          this.saveImage(path)
        })
      }
    })
  }
});