Page({
  data: {
    showDialog: false,
    show: false,
    height: 0,
    photo: '',
    test: '',
    array: [],
    points: null,
    index: 0,
  },
  onShow() {
    console.log(getApp().globalData.points)
  },
  onLoad(query) {
    // 页面加载
    const user = my.getStorageSync({
      key: 'userstring'
    })
    console.log(user)
    this.setData({
      user: user.data
    })

  },
  toMini4() {
    my.navigateTo({
      url: '/pages/mini-ditu/web'
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
    return {
      deg,
      dir
    }
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
  canvasToImage(w, h, p) {
    my.canvasToTempFilePath({
      canvasId: 'water',
      width: w,
      height: h,
      destWidth: w * p,
      destHeight: h * p,
      success: (res) => {
        this.saveImage(res.apFilePath)
      },
      fail: (err) => {
        my.alert({
          title: '生成失败',
          content: JSON.stringify(err)
        });
      }
    })
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
  uploadImage(path, value) {
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
            loc: that.data.points || [that.data.lat, that.data.lon, that.data.deg].join(','),
            text: value
          },
          success(res) {
            console.log(res)
            my.showToast({
              content: "入库成功"
            })
            that.setData({
              showDialog: false
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
        my.alert(JSON.stringify(err))
      }
    })
  },
  closeMask() {
    this.setData({
      showDialog: false
    })
  },

  onInput1(e) {
    this.setData({
      hangju: e.detail.value,
    });
  },

  onInput2(e) {
    this.setData({
      zhu: e.detail.value,
    });
  },

  onInput3(e) {
    this.setData({
      dikuan: e.detail.value,
    });
  },

  uploadResult() {
    const that = this
    setTimeout(() => {
      if (!this.data.hangju || !this.data.zhu) {
        my.alert({
          content: "行距和株数必填"
        })
        return
      }
      that.uploadImage(this.data.photo, `行距:${this.data.hangju}|株数:${this.data.zhu}|地宽:${this.data.dikuan}`)
    }, 1000)

    this.saveImage(this.data.photo)
  },
  takePhoto2() {
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
        }, () => {

          this.setData({
            showDialog: true
          })

          // my.prompt({
          //   message: "请确保拍照内容大约为一平方米",
          //   title: "请输入每平方米植株数",
          //   success(res) {
          //     console.log(res)

          //   }
          // })

          // this.drawWatermark()
        })

      }
    })
  }
});