Page({
  data: {
    title: ""
  },
  onLoad() {},

  toPhoto() {
    my.navigateTo({
      url: '/pages/photo/photo'
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