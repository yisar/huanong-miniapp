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
    hangju: null,
    zhuju: null
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
      url: '/pages/ditu4/web'
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
            loc: [that.data.lat, that.data.lon, that.data.deg].join(','),
            extra: that.data.points,
            text: value,
            cat: '密度调查'
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
      hang: e.detail.value,
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
      if (!this.data.hang || !this.data.zhu) {
        my.alert({
          content: "行距和株数必填"
        })
        return
      }
      that.uploadImage(this.data.photo, `行距:${this.data.hang}|株数:${this.data.zhu}`)
    }, 1000)

    this.saveImage(this.data.photo)
  },
  takePhoto2() {
    if (!this.data.points) {
      my.alert({
        content: "左下角先选择田块噻"
      })
      return
    }
    const that = this
    if (that.data.hangju && that.data.zhuju) {
      my.showToast({
        content: "最后上传即可"
      })
      this.setData({
        showDialog: true
      })
      return
    }
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
        if (!that.data.hangju) {
          my.showToast({
            content: "先拍一个行距"
          })
          that.setData({
            hangju: tempFilePath
          })
          return
        }

        if (!that.data.zhuju) {
          my.showToast({
            content: "再拍一个株距"
          })
          that.setData({
            zhuju: tempFilePath
          })
          return
        }

      }
    })
  }
});