// pages/launch/birthday/index.js
const util = require('../../../utils/util.js')
const app = getApp()
var openid;
var box_mac;
var intranet_ip;
var qrcode_url;
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that  = this;
    openid  = options.openid;
    box_mac = options.box_mac;
    intranet_ip = options.intranet_ip;
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallappsimple/birthdaydemand/demandList',
      headers: {
        'Content-Type': 'application/json'
      },
      success:function(res){
        if(res.data.code==10000){
          var datalist = res.data.result.datalist;
          that.setData({
            datalist:datalist,
          })
        }else{
          wx.navigateBack({
            delta: 1,
          })
          wx.showToast({
            title: '获取生日歌列表失败，请稍后重试',
            icon: 'none',
            duration: 2000,
          })
        }
      },
      fail:function(){
        wx.navigateBack({
          delta: 1,
        })
        wx.showToast({
          title: '获取生日歌列表失败，请稍后重试',
          icon:'none',
          duration:2000,
        })
      }
    })
  },
  showHappy:function(res){
    var media_name = res.currentTarget.dataset.media_name;
    var media_url = res.currentTarget.dataset.oss_url;
    wx.request({
      url: "http://" + intranet_ip + ":8080/h5/birthday_ondemand?deviceId=" + openid + "&web=true&media_name=" + media_name +"&media_url="+media_url,
      success:function(res){
        if (res.statusCode==200){
          wx.showToast({
            title: '点播成功',
            icon: 'none',
            duration: 2000,
          })
        }else{
          wx.showToast({
            title: '点播失败，请重试',
            icon: 'none',
            duration: 2000,
          })
        }
      },
      fail:function(res){
        wx.showToast({
          title: '点播失败，请重试',
          icon: 'none',
          duration: 2000,
        })
      }
    })


  },
  //遥控呼大码
  callQrCode: util.throttle(function (e) {
    app.controlCallQrcode(intranet_ip, openid);
  }, 3000),//呼大码结束
  //打开遥控器
  openControl: function (e) {
    var that = this;

    //默认图
    qrcode_url = '/images/icon/huma.jpg';
    that.setData({
      popRemoteControlWindow: true,
      qrcode_img: qrcode_url,
      intranet_ip: intranet_ip
    })
  },
  //关闭遥控
  closeControl: function (e) {
    var that = this;
    that.setData({

      popRemoteControlWindow: false,
    })

  },
  //遥控退出投屏
  exitForscreen: function (e) {
    app.controlExitForscreen(intranet_ip, openid);
  },
  //遥控调整音量
  changeVolume: function (e) {

    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeVolume(intranet_ip, openid, change_type);

  },
  //遥控切换节目
  changeProgram: function (e) {

    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeProgram(intranet_ip, openid, change_type);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})