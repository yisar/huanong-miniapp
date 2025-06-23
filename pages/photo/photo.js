function stringToArrayBuffer(str) {
  const array = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    array[i] = str.charCodeAt(i) & 0xff; // 获取字符的 ASCII 值并取低 8 位
  }
  return array.buffer;
}

Page({
  data: {
    show: false,
    height: 0,
    photo: '',
    test: '',
    array: [],
    index: 0,
  },
  onLoad(query) {
    const user = my.getStorageSync({key:'userstring'})
    console.log(user)
    this.setData({
      user: user.data
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
    this.setData({
      deg,
      dir
    })
  },

  startLuoPan() {
    my.startCompass();
    my.onCompassChange((res) => {
      // console.log(res)
      this.getDirection(res.direction)

    });

  },
  onShow() {

    const that = this;
    my.getLocation({
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
  uploadImage() {
    const that = this
    my.uploadFile({
      filePath: that.data.photo,
      url: "https://tuchuang.deno.dev/taobao-proxy",
      name: "upload",
      hideLoading: true,
      fileType: "image",
      success(res) {
        const data = JSON.parse(res.data)
        console.log(data.path)
        const name = that.data.array[that.data.index]

        my.request({
          url: `https://huanong.beixibaobao.com/api/photo`,
          method: "POST",
          dataType: "json",
          data: {
            name,
            preload: {
              path: data.path,
              lat: that.data.lat,
              lon: that.data.lon,
              deg: that.data.deg
            }
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
        my.alert(JSON.stringify(err))
      }
    })
  },
  modifyImage() {
    const that = this
    my.getFileSystemManager().readFile({
      filePath: this.data.photo, // 图片路径
      encoding: 'binary', // 以二进制方式读取
      success(res) {
        let data = res.data;
        const customInfo = 'This is custom info'; // 自定义信息
        const aaa = stringToArrayBuffer(customInfo)
        // const customInfoBuffer = my.arrayBufferToBase64(aaa); // 将自定义信息转换为二进制

        data += aaa; // 将自定义信息追加到文件末尾

        console.log(that.data.photo)


        my.getFileSystemManager().writeFile({
          filePath: that.data.photo, // 修改后的文件路径
          data: data,
          encoding: 'binary',
          success() {
            console.log('Custom info added successfully.');
          },
          fail(err) {
            console.error('Failed to write file:', err);
          }
        });
      },
      fail(err) {
        console.error('Failed to read file:', err);
      }
    });
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

          that.modifyImage()

          setTimeout(() => {
            that.uploadImage()
          }, 1000)
          this.saveImage(tempFilePath)
        })
      }
    })
  }
});