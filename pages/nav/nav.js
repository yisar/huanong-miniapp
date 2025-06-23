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
  toWeb() {
    my.navigateTo({
      url: '/pages/web/web'
    })
  }
});