Page({
  data: {
    show: false
  },

  onInput(e) {
    this.setData({
      inputValue: e.detail.value,
    });
  },
  onLoad() {
    const user = my.getStorageSync({
      key: 'userstring'
    })
    console.log(user.data)
    if (user.data) {
      this.setData({
        user: user.data,
        show: true
      })
    }
  },
  deleteUser() {
    my.removeStorageSync({
      key: "userstring"
    })
    my.showToast({
      content:"删除成功"
    });
    this.setData()
  },
  toNav() {
    if (this.data.inputValue != null && this.data.inputValue != '') {
      my.setStorageSync({
        key: 'userstring',
        data: this.data.inputValue || ''
      })

      this.setData({
        user: this.data.inputValue,
        show: true
      })
    }
    my.navigateTo({
      url: '/pages/nav/nav'
    })

  },
  toNew() {
    my.getOpenUserInfo({
      success: (res) => {
        console.log(res)
        // 用户授权成功
        const openid = res.response.openId;
        const userInfo = res.response.userInfo;

        // 在这里可以将 openid 和 userInfo 存储到全局数据中
        this.setData({
          openid: openid,
          userInfo: userInfo
        });

        const tests = my.getStorageSync({
          key: "tests"
        })
        console.log(tests)

        const data = tests.data || []

        data.push(openid)

        console.log(data)


        const ress = my.setStorageSync({
          key: "tests",
          data: data
        })

        if (ress.success) {
          my.alert({
            title: "新建成功"
          })
        }

        // 调用云函数或后端接口，进行用户数据存储
        this.storeUserInfo(openid, userInfo);
      },
      fail: (err) => {
        // 用户授权失败
        console.error("用户授权失败", err);
      }
    });

  },
});