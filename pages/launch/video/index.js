// pages/launch/video/index.js
const app = getApp()
var openid;
var box_mac;
var intranet_ip;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_upload:0,
    intranet_ip,
    openid:'',
    box_mac:'',
    video_url:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (res) {
    var that = this;
    box_mac = res.box_mac;
    openid = res.openid;
    
    that.setData({
      box_mac: box_mac,
      openid: openid
    })
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallappsimple/index/getInnerIp',
      header: {
        'content-type': 'application/json'
      },
      data: {
        box_mac: box_mac
      },
      success: function (res) {
        
        if (res.data.code = 10000 && res.data.result.intranet_ip != '') {
          var intranet_ip = res.data.result.intranet_ip;
          var forscreen_id = (new Date()).valueOf();
          var filename = (new Date()).valueOf();


          wx.chooseVideo({
            sourceType: ['album', 'camera'],
            maxDuration: 60,
            camera: 'back',
            success: function (res) {
              console.log(res);
              var video_url = res.tempFilePath
              that.setData({
                video_url: video_url,
                intranet_ip: intranet_ip,
                openid: openid,
                box_mac: box_mac,
                duration: res.duration,
                video_size: res.size,
              })
              

              
            }
          })
        }
      }
    })
  },
  forscreen_video:function(res){
    var that = this;
    openid = res.currentTarget.dataset.openid;
    box_mac = res.currentTarget.dataset.boxmac;
    intranet_ip = res.currentTarget.dataset.intranet_ip;
    var video_url = res.currentTarget.dataset.video_url;
    var mobile_brand = app.globalData.mobile_brand;
    var mobile_model = app.globalData.mobile_model;
    var resouce_size = res.currentTarget.dataset.video_size;
    var duration = res.currentTarget.dataset.duration;
    var forscreen_id = (new Date()).valueOf();
    var filename = (new Date()).valueOf();
    
    console.log(res);
    wx.uploadFile({
      url: 'http://' + intranet_ip + ':8080/videoH5?deviceId=' + openid + '&deviceName=' + mobile_brand + '&web=true&forscreen_id=' + forscreen_id + '&filename=' + filename + '&device_model=' + mobile_model + '&resource_size=' + resouce_size + '&duration=' + duration + '&action=2&resource_type=2',
      filePath: video_url,
      name: 'fileUpload',
      success: function (res) {
        that.setData({
          is_upload: 1,
          vedio_url: video_url,
          intranet_ip: intranet_ip
        })
      },
      complete: function (es) {
        console.log(es)
      },
      fial: function ({ errMsg }) {
        console.log('uploadImage fial,errMsg is', errMsg)
      },
    })
  },
  exitForscreen:function(res){
    var that = this;
    openid = res.currentTarget.dataset.openid;
    box_mac = res.currentTarget.dataset.boxmac;
    intranet_ip = res.currentTarget.dataset.intranet_ip;

    wx.request({
      url: "http://" + intranet_ip + ":8080/h5/stop?deviceId=" + openid + "&web=true",
      success: function (res) {
        console.log(res);
        wx.navigateBack({
          delta: 1
        })
        wx.showToast({
          title: '退出成功',
          icon: 'none',
          duration: 2000
        });
      },
      fial: function ({ errMsg }) {

        wx.showToast({
          title: '退出失败',
          icon: 'none',
          duration: 2000
        });
      },
    })
  },
  chooseVedio:function(res){
    var that = this;
    console.log(res);
    box_mac = res.currentTarget.dataset.box_mac;
    openid = res.currentTarget.dataset.openid;
    that.setData({
      box_mac: box_mac,
      openid: openid
    })
    var intranet_ip = res.currentTarget.dataset.intranet_ip;
    var forscreen_id = (new Date()).valueOf();
    var filename = (new Date()).valueOf();
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: function (res) {
        var video_url = res.tempFilePath
        that.setData({
          is_upload:0,
          video_url: video_url,
          intranet_ip: intranet_ip,
          openid: openid,
          box_mac: box_mac,
          duration: res.duration,
          video_size: res.size,
        })
        /*wx.uploadFile({
          url: 'http://' + intranet_ip + ':8080/videoH5?deviceId=' + openid + '&deviceName=MI5&web=true&forscreen_id=' + forscreen_id + '&filename=' + filename,
          filePath: video_url,
          name: 'fileUpload',
          success: function (res) {
            that.setData({
              is_upload: 1,
              vedio_url: video_url,
            })
          },
          complete: function (es) {
            console.log(es)
          },
          fial: function ({ errMsg }) {
            console.log('uploadImage fial,errMsg is', errMsg)
          },
        })*/
      }
    })
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
  onUnload: function (res) {
    
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