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
  toPhotoExtra() {
    my.navigateTo({
      url: '/pages/photo-extra/photo'
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