<template>
	<view>
		<!-- <u-notice-bar
			:text="text"
			color="#aeb5c3"
			bg-color="#e5efff"
		></u-notice-bar> -->
		<u-notice-bar :text="contentList"></u-notice-bar>
		<wn-calendar
			ref="calendar"
			:data="date"
			:isBorder="true"
			:isLess="false"
			:colors="['#8f939c', '#18bc37', '#e43d33']"
			:isEn="false"
			@choose="choose"
		></wn-calendar>
		<view class="recBox">
			<view class="rec" @click="open">打卡</view>
			<u-popup
				:show="show"
				@close="close"
				@open="show = true"
				:round="10"
				closeable
				:closeOnClickOverlay="false"
			>
				<view class="title">今天有奖励自己吗？</view>
				<view class="popBox">
					<u--form
						labelPosition="left"
						:model="model"
						:rules="rules"
						ref="uForm"
					>
						<u-form-item
							label="日期"
							prop="date"
							borderBottom
							ref="item1"
						>
							<u--input
								v-model="model.date"
								border="none"
								readonly
							></u--input>
						</u-form-item>

						<u-form-item
							required
							labelWidth="120"
							label="是否有奖励自己"
							prop="type"
							borderBottom
							ref="item1"
						>
							<u-radio-group v-model="model.type">
								<u-radio
									:customStyle="{ marginRight: '8px' }"
									label="是"
									:name="2"
								></u-radio>
								<u-radio label="否" :name="1"></u-radio>
							</u-radio-group>
						</u-form-item>
						<u-form-item
							required
							labelWidth="60"
							:label="model.type === 1 ? '心得' : '忏悔词'"
							prop="text"
							borderBottom
							ref="item1"
						>
							<u--input
								v-model="model.text"
								border="none"
								maxlength="10"
							></u--input>
						</u-form-item>
					</u--form>
					<view class="btn" style="width: 40%; margin: 100rpx auto 0">
						<u-button type="primary" @click="submit">提交</u-button>
					</view>
				</view>
			</u-popup>
		</view>
		<u-modal
			@cancel="cancel"
			:show="showModal"
			:title="title"
			@confirm="confirm"
			showCancelButton
		>
			<view class="slot-content">
				<rich-text :nodes="content"></rich-text>
			</view>
		</u-modal>
	</view>
</template>

<script>
import { includes } from 'lodash';
import { jsData } from './jeluyulu.js';
export default {
	data() {
		return {
			text: '您在本小程序产生的所有打卡记录均存储于本地，即您的手机上，除了您之外没有任何人能看到您的打卡记录。 需要注意的是，请您保持使用，如果长时间不使用本小程序，您的所有打卡记录数据有可能会被微信清除，届时将无法找回！！！',
			title: '确认放弃打卡吗？',
			content: '',
			showModal: false,
			show: false,
			model: {
				date: '2023年01月01日',
				type: undefined,
				text: '',
			},
			rules: {
				date: {
					type: 'string',
					required: true,
					message: '请填写日期',
					trigger: ['blur', 'change'],
				},
				type: {
					type: 'number',
					required: true,
					message: '请选择是否有奖励自己',
					trigger: 'change',
				},
				text: [
					{
						min: 1,
						max: 10,
						message: '长度在1-10个字符之间',
						trigger: ['blur', 'change'],
					},
					{
						type: 'string',
						required: true,
						message: '请填写内容',
						trigger: ['blur', 'change'],
					},
				],
			},

			date: [],
			days: 0,
			notice: 'veshi',
			contentList: [
				'欲戒色，有次第，若依此，少费力。',
				'戒色，则身心如春起之苗，不见其增，但日有所长；思欲，则身心如磨刀之石，不见其损，但日有所亏！',
				'入戒色,当速醒,猛回首,勿放荡。',
				'戒色少之时,血气未定,戒之在色。',
				'以理戒色，知行合一！',
				'若要戒欲很简单，一念不动即过关。勿思新奇清心乱，便是逍遥自在仙。',
				'戒色，此后掘起！',
				'戒色者,非禁欲,所戒者,听我语。',
				'戒色好,须身试,身不试,怎知益。',
				'万恶淫为首，百善孝为先。青年无知患手淫，气血未定身已损，洁白之驱鬼相随，葬身欲海不自知。色是少年第一关，此关通不过，德节丧失，则有再高的才华、再好的学问，都没有',
				'我戒色,好儿郎,有抱负,有理想。',
				'戒色坦然，宽宏大度！',
				'不戒邪淫，你永远只能是那个躲在阴暗角落里的那个屌丝……',
				'戒色便是能量。',
				'戒为良药！不泄为补！',
			],
			wxopenid: '',
		};
	},
	onLoad() {
		const length = Math.round(Math.random() * jsData.length);
		uni.$u.mpShare.title = jsData[length];
		this.login();
	},
	onReady() {
		//onReady 为uni-app支持的生命周期之一
		this.model.date = uni.$u.date(new Date(), 'yyyy年mm月dd日');
		this.$refs.uForm.setRules(this.rules);
		this.contentList = jsData;
	},
	methods: {
		login() {
			const that = this;
			wx.login().then((res) => {
				uniCloud.callFunction({
					name: 'user_login',
					data: {
						platform: 'wxmp',
						code: res.code,
						appid: uni.getAccountInfoSync().miniProgram.appId,
					},
					success(res) {
						console.log('openid获取成功', res);
						uni.setStorageSync('wxopenid', res.result.openid);
						that.wxopenid = res.result.openid;
						that.getDBData();
					},
					fail() {},
				});
			});
		},
		DBUpdateDays(val) {
			const db = uniCloud.database();
			let dataOpenidList = this.date.map((v) => v.wxopenid);
			if (
				dataOpenidList.length > 0 &&
				dataOpenidList.includes(this.wxopenid)
			) {
				db.collection('date-log-total')
					.where({
						wxopenid: this.wxopenid,
					})
					.update({
						totalDay: val,
					})
					.then((res) => {
						console.log('打卡天数更新成功', res);
					})
					.catch((err) => {
						console.log('打卡天数更新失败', err);
					});
			} else {
				db.collection('date-log-total').add({
					totalDay: val,
					wxopenid: this.wxopenid,
				});
			}
		},
		/**
		 * 获取云数据库
		 * date-log表的所有数据用于页面渲染
		 * date-log-total 表的字段用于统计打卡多少天
		 *
		 */
		async getDBData() {
			const that = this;
			const wxopenid = uni.getStorageSync('wxopenid');
			const db = uniCloud.database();
			db.collection('date-log')
				.where({
					wxopenid: that.wxopenid || wxopenid,
				})
				.get()
				.then((res) => {
					console.log('数据库信息', res.result);
					that.date = res.result.data.map((v) => {
						return {
							...v,
							id: v._id,
						};
					});

					this.$refs.calendar.refresh();
				})
				.catch((err) => {
					console.log('数据库查询失败', err);
				});
			db.collection('date-log-total')
				.where({
					wxopenid: that.wxopenid || wxopenid,
				})
				.get()
				.then((res) => {
					console.log('打卡天数', res.result.data[0].totalDay);
					this.days = res.result.data[0].totalDay;
				})
				.catch((err) => {
					console.log('数据库查询失败,没有该用户', err);
				});
		},
		async addDB(data) {
			const db = uniCloud.database();
			await db.collection('date-log').add(data);
			this.getDBData();
		},

		choose(data) {
			console.log('选中的', data);
			let timestamp = new Date(data.date).getTime();
			let date = uni.$u.date(timestamp, 'yyyy年mm月dd日');
			if (data.data) {
				return uni.$u.toast(`${date}您已打卡～`);
			} else if (this.getTodyLastTime() < timestamp) {
				console.log(this.getTodyLastTime(), timestamp);
				return;
			} else {
				this.show = true;
				this.model = {
					date: date,
					type: '',
					text: '',
				};
			}
		},
		open() {
			if (
				this.date.some(
					(e) => e.date === this.dateFormatReal(this.model.date)
				)
			) {
				uni.$u.toast('今日已打卡哦');
			} else {
				this.model = {
					...this.model,
					type: '',
					text: '',
				};
				this.show = true;
			}
		},

		close() {
			this.showModal = true;
			// this.show = false
			// console.log('close');
			this.content = `您已经坚持打卡记录<span style='color:#18bc37;font-weight: 700;'>戒撸${
				this.days || 0
			}天</span>，真的要放弃打卡吗?`;
		},
		confirm() {
			this.showModal = false;
			this.show = false;
			this.model.date = uni.$u.date(new Date(), 'yyyy年mm月dd日');
			this.$refs.calendar.refresh();
		},
		cancel() {
			this.showModal = false;
			uni.$u.toast(`兄弟加油，你已经坚持了${this.days || 0}天`);
		},
		submit() {
			const length = Math.round(Math.random() * jsData.length);
			this.$refs.uForm
				.validate()
				.then((res) => {
					const data = {
						...this.model,
						date: this.dateFormatReal(this.model.date),
						id: new Date().getTime(),
					};
					this.date.push(data);

					//去重
					let map = new Map();
					for (let item of this.date) {
						map.set(item.date, item);
					}
					this.date = [...map.values()];
					//本地存储
					uni.setStorageSync('date', this.date);

					if (data.type === 2) {
						uni.setStorageSync('days', 0);
						this.days = 0;
						this.DBUpdateDays(0);
					} else {
						uni.setStorageSync('days', Number(this.days) + 1);
						this.DBUpdateDays(Number(this.days) + 1);
					}
					//云数据库保存
					this.addDB({
						date: data.date,
						type: data.type,
						text: data.text,
						wxopenid: this.wxopenid,
					});
					this.$refs.calendar.refresh();
					if (Number(this.days) === 0) {
						uni.$u.toast('兄弟请记住：' + jsData[length]);
					} else {
						uni.$u.toast('太棒了兄弟，你又坚持了一天！');
					}
					this.show = false;
				})
				.catch(() => {
					console.log(this.dateFormatReal('2023年07月20日'));
				});
		},
		dateFormatReal(inputDateStr) {
			// 从输入的日期字符串中提取年、月和日
			const year = parseInt(inputDateStr.substring(0, 4));
			const month = parseInt(inputDateStr.substring(5, 7));
			const day = parseInt(inputDateStr.substring(8, 10));
			// 使用提取的值创建一个新的 Date 对象
			const dateObj = new Date(year, month - 1, day);
			// 将日期格式化为 "YYYY/MM/DD"
			let y = dateObj.getFullYear();
			let m = dateObj.getMonth() + 1;
			let d = dateObj.getDate();
			return `${y}/${m}/${d}`;
		},
		getTodyLastTime() {
			let todayYear = new Date().getFullYear();
			let todayMonth = new Date().getMonth();
			let todayDay = new Date().getDate();
			let todayTime = new Date(
				todayYear,
				todayMonth,
				todayDay,
				'23',
				'59',
				'59'
			).getTime(); //毫秒
			return todayTime;
		},
	},
};
</script>

<style lang="scss">
.recBox {
	width: 100%;
	height: 280rpx;
	position: fixed;
	bottom: 0rpx;

	// background-color: gray;
	.rec {
		width: 240rpx;
		height: 240rpx;
		border-radius: 50%;
		// background-color: pink;
		margin: 0rpx auto;
		line-height: 240rpx;
		text-align: center;
		font-size: 52rpx;

		animation: rec-eff 3s linear infinite;

		@keyframes rec-eff {
			0% {
				box-shadow: 0 0 2px #3185fa;
				background-color: #3185fa;
				color: #b5ee87;
			}

			50% {
				box-shadow: 0 0 40px #b5ee87;
				background-color: #b5ee87;
				color: #18bc37;
			}

			100% {
				box-shadow: 0 0 2px #18bc37;
				background-color: #18bc37;
				color: #3185fa;
			}
		}
	}
}

.title {
	text-align: center;
	padding: 20rpx;
}

.popBox {
	height: 40vh;
	padding: 40rpx;
}
</style>
