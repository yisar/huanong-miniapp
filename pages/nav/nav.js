Page({
  data: {
    title: "",
    clickCount: 0,
    show: false
  },
  onLoad() {},

  add() {
    const { clickCount, show } = this.data;
    const newCount = clickCount + 1;
    this.setData({
      clickCount: newCount
    });
    if (newCount >= 5 &&!show) {
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
    my.navigateTo({
      url: '/pages/note/note'
    })
  },
  toWebGeo() {
    my.navigateTo({
      url: '/pages/geo/web'
    })
  },
  toWeb() {
    my.navigateTo({
      url: '/pages/web/web'
    })
  }
});