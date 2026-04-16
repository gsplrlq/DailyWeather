<script>
export default {
  onLaunch() {
    console.log('App Launch')
    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        traceUser: true,
        env: 'cloud1-4g4pgi0p302de70d'
      })
      console.log('云开发初始化完成')
    } else {
      console.warn('小程序当前版本不支持云开发')
    }
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  }
}
</script>

<style>
page {
  background-color: #f8f8f8;
  font-size: 28rpx;
  line-height: 1.6;
}
</style>