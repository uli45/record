// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
module.exports = {
  say(val){
    console.log(val);
    return {
      errCode:0,
      data:{
        msg:'这是云服务-云对象调用'
      }
    };
  }	
};
