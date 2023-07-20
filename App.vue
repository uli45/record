<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			this.init()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			init() {
				wx.getSetting({
					success(res) {
						if (res.authSetting['scope.userInfo']) {
							// 已经授权，可以直接调用 getUserInfo 获取头像昵称
							wx.getUserInfo({
								success: function(res) {
									console.log('用户信息', res.userInfo)

									uni.setStorageSync('nickName', res.userInfo.nickName)


								}
							})
						} else {
							// 未授权，结果返回null

							console.log('未授权');
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import "@/uni_modules/uview-ui/index.scss";
</style>