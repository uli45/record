'use strict';
const db = uniCloud.database();
const wechatloginUrl = 'https://api.weixin.qq.com/sns/jscode2session';
exports.main = async (event, context) => {
	console.log('event : ', event)
	if(event.platform == "wxmp"){
		//微信小程序登录之获取openid
		let wechatmpsettings = await db.collection('settings').where({
			'appid': event.appid,
			'key':'wxmpset',
		}).get()
		//从云端获取当前appid数据
		 if (wechatmpsettings.data.length === 0) {
		 	return {
		 		success: false,
				msg: '失败：未配置系统参数'
		}
		}
		const appid = wechatmpsettings.data[0].appid
		const secret = wechatmpsettings.data[0].secret
		//通过appid和secret请求到微信的
		let finres = await uniCloud.httpclient.request(wechatloginUrl, {
			data: {
				appid: appid,
				secret: secret,
				js_code: event.code,
				grant_type: 'authorization_code'
			},
			dataType: 'json'
		})
		//通过api获取到微信的openid
		console.log("微信用户openid："+finres.data.openid)
		let user = await db.collection('wx_user').where({
			'openid':finres.data.openid
		}).get()
		if(user.affectedDocs > 0 && user.data[0].userdata==true){
			return{
				hadlogin:true,
				openid:finres.data.openid,
				userinfo:user
			}
		}else{
			let uniid
			if(user.data[0]){
				if(user.data[0]._id){
					//以前进入过，但没授权
					uniid=user.data[0]._id
					await db.collection('wx_user').doc(user.data[0]._id).update({
						openid:finres.data.openid,
						appid:appid,
						userdata:false
					});
				}else{
					console.error("错误！")
					
				}
			}else{
				await db.collection('wx_user').add({
					openid:finres.data.openid,
					appid:appid,
					userdata:false
				});
				//一次都没进入过
				let res = await db.collection('wx_user').where({
					openid:finres.data.openid,
					appid:appid,
					userdata:false
				}).get()
				console.log(res)
			}
			return{
				hadlogin:false,
				openid:finres.data.openid
			}
		}
	}if(event.platform == "wxmp_add"){
		console.log(event)
		let cloudinfo={
				nickName:event.userinfo.nickName,
				avatarUrl:event.userinfo.avatarUrl,
				openid: event.openid
		};
		console.log("上传信息")
		if(cloudinfo.openid==undefined){
			//openid上传时丢失了
			let finres = await uniCloud.httpclient.request(wechatloginUrl, {
				data: {
					appid: appid,
					secret: secret,
					js_code: event.code,
					grant_type: 'authorization_code'
				},
				dataType: 'json'
			})
			cloudinfo.openid=finres.data.openid
		}
		console.log(cloudinfo.openid)
		console.log("通过openid查询，openid："+cloudinfo.openid)
		let user = await db.collection('wx_user').where({
			'openid':cloudinfo.openid
		}).get()
		console.log('查询结果res : ' + JSON.stringify(user));
		let result={}
		if (user.data[0].openid.length > 0) {
			cloudinfo.userdata=true
			result = await db.collection('wx_user').doc(user.data[0]._id).update(cloudinfo);
			console.log('更新数据成功');
			return {
				nickName:cloudinfo.nickName,
				avatarUrl:cloudinfo.avatarUrl,
				openid:cloudinfo.openid,
				uniid:user.data[0]._id
			}
		}else {
			cloudinfo.userdata=true
			result = await db.collection('wx_user').add(cloudinfo);
			console.log("调试bug，真实场景触发请反馈，上传数据成功👇",result)
			return {
				nickName:cloudinfo.nickName,
				avatarUrl:cloudinfo.avatarUrl,
				openid:cloudinfo.openid,
				uniid:undefined
			}
		}
	}
};
