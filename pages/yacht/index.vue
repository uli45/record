<template>
	<view>
		<!-- 背景 -->
		<image class="gameBg" src="../../static/rollDice/gamebg.png" mode=""></image>
		<view style="height: 60rpx;"></view>
		<!-- 骰子 --> 
		<view class="diceCountent" :class="{'rollDiceAnimation':gameType == 1}">
			<image src="../../static/rollDice/dicebg.png" class="bgimg" mode=""></image>
			<view class="dicebox">
				<view class="diceitem" v-for="(item,index) in diceList" :key="index" :style="{width:diceWidth+'rpx',height:diceWidth+'rpx',top:item.top+'rpx',left:item.left+'rpx',
		transform:`rotate(${item.rotate}deg)`}">
					<image :src="diceAll[item.dice].img" class="diceimg" mode=""></image>
				</view>
			</view>

			<image class="maskbox" v-show="gameType != 3" :style="{'transform':'translate3d(0px,-'+yMove+'px,0)'}"
				@touchstart="maskTouchStart" @touchmove.prevent="maskTouchMove" @touchend="maskTouchEnd"
				src="../../static/rollDice/dice.png" mode=""></image>
			<view v-show="gameType == 0" class="diceSumBox">
				{{diceCount}}
			</view>
			<view v-show="gameType == 2" class="diceSumBox">

			</view>
		</view>
		<!-- 总合计 -->
		<view style="height: 800rpx;"></view>
		<!-- 按钮-->
		<view class="btnBox">
			<view v-show="gameType == 0" @click="playGame()" class="startBtn">
				摇一摇
			</view>
			<view v-show="gameType == 2" @click="openDice()" class="openBtn">
				开
			</view>
		</view>
		<!-- v-show="gameType == 3" -->
		<view :style="{'opacity':opacityShow}"  class="totalbox">
			<text class="totalboxTitle">总点数：{{point}}</text>
			<view class="totaldicebox">
				<view class="totaldiceItem">
					<image src="../../static/rollDice/01.png" class="smallDiceimg" mode=""></image>
					<text>X {{one}}</text>
				</view>
				<view class="totaldiceItem">
					<image src="../../static/rollDice/03.png" class="smallDiceimg" mode=""></image>
					<text>X {{thr}}</text>
				</view>
				<view class="totaldiceItem">
					<image src="../../static/rollDice/05.png" class="smallDiceimg" mode=""></image>
					<text>X {{fiv}}</text>
				</view>
			</view>
			<view class="totaldicebox">
				<view class="totaldiceItem">
					<image src="../../static/rollDice/02.png" class="smallDiceimg" mode=""></image>
					<text>X {{two}}</text>
				</view>
				<view class="totaldiceItem">
					<image src="../../static/rollDice/04.png" class="smallDiceimg" mode=""></image>
					<text>X {{fou}}</text>
				</view>
				<view class="totaldiceItem">
					<image src="../../static/rollDice/06.png" class="smallDiceimg" mode=""></image>
					<text>X {{six}}</text>
				</view>
			</view>
		</view>
		
		<view class="smallTipBox">
			<text v-show="gameType == 2">上划骰盅可提前查看结果</text>
			<text v-show="gameType == 3">点击右下角可重新开始</text>
		</view>
		
		<!-- 记录 -->
		<view class="footBox">
			<image @click="setRecord()" src="../../static/rollDice/record.png" class="recordImg" mode=""></image>
			<view v-show="gameType == 2" @click="playGame()" class="againBtn">
				重
			</view>
			<view v-show="gameType == 3" @click="reface()" class="againBtn">
				复
			</view>
		</view>
		<view v-show="recordShow" class="recordBox">
			<view @click="recordShow = false" class="closeBox">
				X
			</view>
			<view class="title">
				历史开骰记录
			</view>
			<view class="headTitle">
				<view class="whead">总和</view>
				<image src="../../static/rollDice/01.png" class="diceRecordimg" mode=""></image>
				<image src="../../static/rollDice/02.png" class="diceRecordimg" mode=""></image>
				<image src="../../static/rollDice/03.png" class="diceRecordimg" mode=""></image>
				<image src="../../static/rollDice/04.png" class="diceRecordimg" mode=""></image>
				<image src="../../static/rollDice/05.png" class="diceRecordimg" mode=""></image>
				<image src="../../static/rollDice/06.png" class="diceRecordimg" mode=""></image>
			</view>
			<scroll-view scroll-y="true" class="diceContentBox">
				<view v-for="(item,index) in recordList" :key="index" class="diceContent">
					<text class="whead">{{item.point}}点</text>
					<text>{{item.one}}个</text>
					<text>{{item.two}}个</text>
					<text>{{item.thr}}个</text>
					<text>{{item.fou}}个</text>
					<text>{{item.fiv}}个</text>
					<text>{{item.six}}个</text>
				</view>
			</scroll-view>

		</view>
		<!-- 设置 -->
		<!-- 左上角设置，可设置音乐，震动，筛子个数，自动开 -->
		<view @click="setBoxShow = true" class="setBtn">
			<image src="../../static/rollDice/set.png" mode=""></image>
		</view>
		<view v-show="setBoxShow" class="setBox">
			<view @click="setBoxShow = false" class="closeBox">
				X
			</view>
			<view class="title">
				设置
			</view>
			<view @click="automated = !automated" class="handleBtn">
				自动开骰：{{automated?'开启':'关闭'}}
			</view>
			<view @click="musicshow = !musicshow" class="handleBtn">
				声音：{{musicshow?'开启':'关闭'}}
			</view>
			<view @click="shakeShow = !shakeShow" class="handleBtn">
				震动：{{shakeShow?'开启':'关闭'}}
			</view>
			<view class="handleBtn setCountBox">
				<text>骰子：</text>
				<image @click="setcount()" src="../../static/rollDice/reduce.png" mode=""></image>
				<text style="width: 100rpx;">{{diceCount}}</text>
				<image @click="setcount('add')" src="../../static/rollDice/add.png" mode=""></image>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				shakeState:false, // 摇一摇
				opacityShow:0, // 统计透明度
				YStart:'', // 开始位置
				yMove: 0,
				setBoxShow: false, // 设置
				musicshow: true, // 音乐
				shakeShow:true, // 震动
				automated: false, // 自动开
				recordShow: false, // 记录
				gameType: 0, // 0:游戏准备，1摇骰子中，2等待开筛子，3已经开过筛子
				point: 0,
				one: 0,
				two: 0,
				thr: 0,
				fou: 0,
				fiv: 0,
				six: 0,
				diceCount: 6,
				diceWidth: 70,
				diceList: [],
				diceAll: [{
					img: '../../static/rollDice/01.png',
					dicesum: 1
				}, {
					img: '../../static/rollDice/02.png',
					dicesum: 2
				}, {
					img: '../../static/rollDice/03.png',
					dicesum: 3
				}, {
					img: '../../static/rollDice/04.png',
					dicesum: 4
				}, {
					img: '../../static/rollDice/05.png',
					dicesum: 5
				}, {
					img: '../../static/rollDice/06.png',
					dicesum: 6
				}],
				recordList: [],
			}
		},
		onShow() {
			// this.playGame()
			this.start()
		},
		methods: {
			// 开始触摸屏幕
			maskTouchStart(ev) {
				this.YStart = ev.changedTouches[0].pageY
			},
			// 触摸移动
			maskTouchMove(ev) {
				var result =0
				if(this.gameType == 2){
					result =  parseInt(this.YStart - ev.changedTouches[0].pageY)
				}
				if(result > 0){
					this.yMove = result
					this.opacityShow = result/100
				}
			},
			// 触摸结束
			maskTouchEnd(ev) {
				this.yMove = 0
				this.opacityShow = 0
			},
			//监听陀螺仪
			start() {
				uni.onGyroscopeChange((res) => {
					var nowRange = Math.abs(res.x) + Math.abs(res.x) + Math.abs(res.x);
					if (nowRange > 10) {
						this.shakeState = true
					}
					
					if(this.shakeState){
						this.stop()
						this.shakeState = false
						this.playGame()
					}
				});
				uni.startGyroscope({
					interval: "normal"
				})
			},
			//停止监听陀螺仪
			stop() {
				uni.stopGyroscope({})
			},
			setcount(txt) {
				if (txt == 'add') {
					if (this.diceCount < 100) {
						this.diceCount++
					}
				} else {
					if (this.diceCount > 1) {
						this.diceCount--
					}
				}
			},
			// 查看记录
			setRecord() {
				this.recordShow = true
			},
			// 开起骰子
			openDice() {
				this.opacityShow = 1
				this.gameType = 3
				this.stop()
			},
			// 重置游戏
			reface() {
				this.opacityShow = 0
				this.gameType = 0
				this.diceList = []
				this.recordList[this.recordList.length] = {
					'point': this.point,
					'one': this.one,
					'two': this.two,
					'thr': this.thr,
					'fou': this.fou,
					'fiv': this.fiv,
					'six': this.six,
				}
				this.start()
			},
			// 开始游戏
			playGame() {
				this.diceList = []
				// 震动
				if(this.shakeShow){
					uni.vibrateLong();
				}
				
				if(this.musicshow){
					const innerAudioContext = uni.createInnerAudioContext();
					innerAudioContext.autoplay = true;
					innerAudioContext.src = '/static/rollDice/dice.mp3';
					innerAudioContext.onPlay(() => {});
				}
				
				this.setDice()
				this.diceCountDice()
				

				this.gameType = 1

				// 自动开骰
				if (this.automated) {
					setTimeout(() => {
						this.gameType = 3
						this.opacityShow = 1
					}, 2000)
				} else {
					setTimeout(() => {
						this.gameType = 2
						this.start()
					}, 2000)
				}
			},
			// 设置骰子位置前
			setDice() {
				var arr = [] // 深拷贝
				// 生成坐标数组
				if (this.diceCount > 9) {
					let pointSum = Math.floor(Math.sqrt(this.diceCount)) + 1
					this.diceWidth = parseInt(240 / pointSum)
					for (let i = 0; i < pointSum; i++) {
						for (let k = 0; k < pointSum; k++) {
							arr[arr.length] = {
								top: i * this.diceWidth,
								left: k * this.diceWidth
							}
						}
					}
				} else {
					for (let i = 0; i < 3; i++) {
						for (let k = 0; k < 3; k++) {
							arr[arr.length] = {
								top: i * 80,
								left: k * 80
							}
						}
					}
				}

				var dice, angle, temp, tempList
				for (var i = 0; i < this.diceCount; i++) {
					dice = (Math.random() * 6) >> 0
					angle = (Math.random() * 6) >> 0
					temp = (Math.random() * arr.length) >> 0;
					// 让数组不重复
					tempList = arr[temp];
					arr.splice(temp, 1)
					this.addDiceList(dice, angle, tempList)
					 console.log('dice, angle, tempList', dice, angle, tempList);
				}
			},
			// 设置骰子
			addDiceList(dice, angle, tempList) {
				this.diceList.push({
					"rotate": 30 * angle,
					"dice": dice,
					"top": tempList.top,
					"left": tempList.left
				})
			},
			// 统计数量
			diceCountDice() {
				this.one = 0
				this.two = 0
				this.thr = 0
				this.fou = 0
				this.fiv = 0
				this.six = 0
				let sum = 0
				this.diceList.forEach((item) => {
					sum = sum + item.dice + 1
					switch (item.dice) {
						case 0:
							this.one++;
							break;
						case 1:
							this.two++;
							break;
						case 2:
							this.thr++;
							break;
						case 3:
							this.fou++;
							break;
						case 4:
							this.fiv++;
							break;
						case 5:
							this.six++;
							break;
					}
				})
				this.point = sum
			}


		}
	}
</script>

<style lang="scss">
	.gameBg {
		position: fixed;
		width: 750rpx;
		height: 100vh;
	}

	/* 骰子 */
	.diceCountent {
		position: absolute;
		left: 130rpx;
		padding-top: 60rpx;

		.bgimg {
			position: absolute;
			top: 270rpx;
			width: 500rpx;
			height: 520rpx;
		}

		.dicebox {
			position: relative;
			top: 330rpx;
			margin-left: 110rpx;
			z-index: 10;
		}

		.diceitem {
			position: absolute;
		}

		.diceimg {
			width: 100%;
			height: 100%;
		}

		.maskbox {
			position: absolute;
			margin-left: 40rpx;
			width: 430rpx;
			height: 600rpx;
			z-index: 10;
		}

		.diceSumBox {
			position: absolute;
			top: 340rpx;
			margin-left: 40rpx;
			font-size: 160rpx;
			font-weight: bold;
			color: #d2d1d9;
			z-index: 10;
			width: 430rpx;
			text-align: center;
		}
	}

	.rollDiceAnimation {
		animation: moveRoll 1.2s;
	}

	@keyframes moveRoll {
		0% {
			left: 130rpx;
		}

		5% {
			left: 0rpx;
		}

		15% {
			left: 260rpx;
		}

		25% {
			left: 0rpx;
		}

		35% {
			left: 260rpx;
		}

		45% {
			left: 0rpx;
		}

		55% {
			left: 260rpx;
		}

		65% {
			left: 0rpx;
		}

		75% {
			left: 260rpx;
		}

		85% {
			left: 0rpx;
		}

		95% {
			left: 260rpx;
		}

		100% {
			left: 130rpx;
		}
	}

	// 结果统计
	.totalbox {
		color: #FFFFFF;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 640rpx;
		border-radius: 30rpx;
		margin: 10rpx auto 0;
		padding: 0 20rpx 10rpx;
		border: 6rpx #7b422e solid;
		// background: linear-gradient(#FFFFFF, #0ba952);
		position: relative;

		.totalboxTitle {
			font-size: 50rpx;
			line-height: 100rpx;
		}

		.smallDiceimg {
			width: 80rpx;
			height: 80rpx;
		}

		.totaldicebox {
			display: flex;
			width: 100%;
			padding: 10rpx 0;
		}

		.totaldiceItem {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.totaldiceItem text {
			margin-left: 10rpx;
			font-size: 42rpx;
		}

	}

	.btnBox {
		display: flex;
		justify-content: center;
		position: relative;
		text-align: center;
		z-index: 10;
		font-size: 46rpx;

		.startBtn {
			width: 200rpx;
			border: 2rpx #f6f6f7 solid;
			color: #FFFFFF;
			padding: 0 60rpx;
			line-height: 80rpx;
			border-radius: 40rpx;
			background: #303038;
		}

		.openBtn {
			font-size: 54rpx;
			line-height: 160rpx;
			text-align: center;
			width: 160rpx;
			height: 160rpx;
			border-radius: 100rpx;
			border: 2rpx #f6f6f7 solid;
			color: #FFFFFF;
			background: #303038;
		}
	}

	// 历史记录
	.recordBox {
		position: fixed;
		bottom: 0;
		width: 670rpx;
		height: 60vh;
		z-index: 10;
		background: #faf5ec;
		border: 10rpx #755345 solid;
		padding: 20rpx 30rpx;
		border-radius: 50rpx 50rpx 0 0;

		.title {
			width: 100%;
			font-weight: bold;
			line-height: 120rpx;
			font-size: 40rpx;
			text-align: center;
		}

		.closeBox {
			position: absolute;
			right: 0;
			top: 0;
			font-size: 40rpx;
			font-weight: bold;
			padding: 20rpx 30rpx;
		}

		.headTitle {
			display: flex;
			align-items: center;
			justify-content: space-around;

			.whead {
				font-weight: bold;
				text-align: center;
				width: 110rpx;
			}

			.diceRecordimg {
				width: 54rpx;
				height: 54rpx;
			}
		}

		.diceContentBox {
			height: 40vh;
			margin-top: 20rpx;
			overflow: hidden;
			border: 2rpx #c1c1c1 solid;
		}

		.diceContent {
			display: flex;
			align-items: center;
			color: #333333;
			justify-content: space-around;
			line-height: 70rpx;
			border-bottom: 2rpx #999 solid;

			.whead {
				text-align: center;
				width: 110rpx;
			}

			text {
				width: 54rpx;
				text-align: center;
			}
		}
	}

	.footBox {
		position: fixed;
		width: 650rpx;
		display: flex;
		justify-content: space-between;
		bottom: 50rpx;
		left: 50rpx;

		.recordImg {
			width: 90rpx;
			height: 90rpx;
		}

		.againBtn {
			color: #FFFFFF;
			font-size: 40rpx;
			text-align: center;
			font-weight: bold;
			width: 90rpx;
			line-height: 90rpx;
			height: 90rpx;
			border-radius: 100rpx;
			border: 6rpx #FFFFFF solid;
		}
	}

	// 设置
	.setBtn {
		position: fixed;
		top: 80rpx;
		left: 40rpx;

		image {
			width: 80rpx;
			height: 80rpx;
		}
	}

	.setBox {
		z-index: 10;
		position: fixed;
		top: 26vh;
		left: 110rpx;
		color: #442e27;
		border: 10rpx #755345 solid;
		border-radius: 30rpx;
		padding: 0 50rpx 50rpx 50rpx;
		background: #faf5ec;

		.title {
			width: 100%;
			font-weight: bold;
			line-height: 140rpx;
			font-size: 40rpx;
			text-align: center;
		}

		.handleBtn {
			border-radius: 30rpx;
			font-size: 34rpx;
			font-weight: bold;
			line-height: 70rpx;
			text-align: center;
			width: 400rpx;
			background: #f7d16a;
			border: 6rpx #6c5447 solid;
			margin-bottom: 20rpx;
		}

		.closeBox {
			position: absolute;
			right: 0;
			font-size: 40rpx;
			font-weight: bold;
			padding: 10rpx 20rpx;
		}

		.setCountBox {
			display: flex;
			align-items: center;
			justify-content: center;

			image {
				width: 40rpx;
				height: 40rpx;
				padding: 0 10rpx;
			}
		}
	}
	
	.smallTipBox{
		position: relative;
		color: #FFFFFF;
		font-size: 36rpx;
		line-height: 120rpx;
		width: 100%;
		text-align: center;
	}
</style>
