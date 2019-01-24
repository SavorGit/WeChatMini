//index.js
//获取应用实例
const util = require('../../utils/util.js')
const app = getApp()
var openid;
var box_mac;
var is_view_wifi = 0;
var intranet_ip;
Page({
  data: {
    
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    is_link:0,     //是否连接酒楼
    is_link_wifi:0, //是否连接wifi
    is_view_link:0,
    hotel_name:'',
    room_name:'',
    box_mac:'',
    wifi_mac:'',
    wifi_name:'',
    wifi_password:'',
    hiddens:true,
  },
  onLoad: function (e) {
    var that = this;
    var scene = decodeURIComponent(e.scene);
    
    if (scene != 'undefined' ){//扫小程序码过来 
      box_mac = scene;  
      //box_mac = '00226D655202'
    }else {//小程序跳转过来
      
      box_mac = e.box_mac
      // box_mac = '00226D655202'//bicao
      // box_mac = '00226D5846EA'//A1
    }
    if (box_mac == undefined || box_mac =='undefined' || box_mac=='' ){
      that.setData({
        showModal:true
      })
    }else {
      
      that.setData({
        box_mac: box_mac,
      })
      wx.hideShareMenu();

      if (app.globalData.openid && app.globalData.openid != '') {
        
        that.setData({
          openid: app.globalData.openid
        })
        openid = app.globalData.openid;
        
        //扫码埋点

        wx.request({
          url: 'https://mobile.littlehotspot.com/smallapp21/index/recOverQrcodeLog',
          data: {
            "openid": openid,
            "box_mac": box_mac,
            "type": 6,
            "is_overtime": 0
          },
          header: {
            'content-type': 'application/json'
          },
        })
        //判断用户是否注册
        wx.request({
          url: 'https://mobile.littlehotspot.com/smallappsimple/User/isJjRegister',
          data: {
            "openid": app.globalData.openid,
          },
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            wx.setStorage({
              key: 'savor_user_info',
              data: res.data.result.userinfo,
            })
          },
          fail: function (e) {
            wx.setStorage({
              key: 'savor_user_info',
              data: { 'openid': app.globalData.openid },
            })
          }
        });//判断用户是否注册结束
        getHotelInfo(box_mac);

      } else {
        app.openidCallback = openid => {
          if (openid != '') {
            
            that.setData({
              openid: openid
            })
            openid = openid;
            
            //扫码埋点
            
            wx.request({
              url: 'https://mobile.littlehotspot.com/smallapp21/index/recOverQrcodeLog',
              data: {
                "openid": openid,
                "box_mac": box_mac,
                "type": 6,
                "is_overtime": 0
              },
              header: {
                'content-type': 'application/json'
              },
            })
          }
            
            
            //判断用户是否注册
            wx.request({
              url: 'https://mobile.littlehotspot.com/smallappsimple/User/isJjRegister',
              data: {
                "openid": openid,
              },
              header: {
                'content-type': 'application/json'
              },
              success: function (res) {
                wx.setStorage({
                  key: 'savor_user_info',
                  data: res.data.result.userinfo,
                })
              },
              fail: function (e) {
                wx.setStorage({
                  key: 'savor_user_info',
                  data: { 'openid': openid },
                })
              }
            });//判断用户是否注册结束
            getHotelInfo(box_mac);
          }
        }
      }
      
      function getHotelInfo(box_mac) {//获取链接的酒楼信息
        wx.request({
          url: 'https://mobile.littlehotspot.com/Smallappsimple/Index/getHotelInfo',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            box_mac: box_mac,
          },
          method: "POST",
          success: function (res) {
            if (res.data.code == 10000) {
              that.setData({
                is_link: 1,
              })
              intranet_ip = res.data.result.intranet_ip;
              var wifi_name = res.data.result.wifi_name;
              var wifi_password = res.data.result.wifi_password;
              var use_wifi_password = wifi_password
              
              if (wifi_password == '') {
                wifi_password = "未设置wifi密码";
              }
              var wifi_mac = res.data.result.wifi_mac;

              if(wifi_mac==''){//如果后台未填写wifi_mac  获取wifi列表自动链接
                that.setData({
                  hotel_name: res.data.result.hotel_name,
                  room_name: res.data.result.room_name,
                  wifi_name: wifi_name,
                  wifi_password: wifi_password,
                  use_wifi_password: use_wifi_password
                })
              }else {//如果后台填写了wifi_mac直接链接
                that.setData({
                  hotel_name: res.data.result.hotel_name,
                  room_name: res.data.result.room_name,
                  wifi_name: wifi_name,
                  wifi_password: wifi_password,
                  use_wifi_password: use_wifi_password
                })
                var user_info = wx.getStorageSync("savor_user_info");
                if (user_info.is_wx_auth != 2) {
                  that.setData({
                    wifi_mac: res.data.result.wifi_mac,
                    showWXAuthLogin: true
                  })
                }else{
                  app.connectHotelwifi(wifi_mac, wifi_name, use_wifi_password,that)
                }
              }
            } else {//未获取到酒楼信息
              wx.showToast({
                title: '该电视暂不支持小程序投屏',
                icon: 'none',
                duration: 2000
              });
            }

          }
        })
      }
      
  
      
    
    
  },
  viewWifi:function(res){
    var that = this;
    
    if (is_view_wifi==0){
      that.setData({
        is_view_wifi:1
      })
      is_view_wifi = 1;
    }else {
      box_mac = res.target.dataset.box_mac;
     
      wx.request({
        url: 'https://mobile.littlehotspot.com/Smallappsimple/Index/getHotelInfo',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          box_mac: box_mac,
        },
        method: "POST",
        success: function (res) {

          if (res.data.code = 10000) {
            var wifi_name = res.data.result.wifi_name;
            var wifi_password = res.data.result.wifi_password;
            if (wifi_password == '') {
              wifi_password = "未设置wifi密码";
            }
            that.setData({
              wifi_name: wifi_name,
              wifi_password: wifi_password,
              is_view_wifi: 0,
            })
            is_view_wifi = 0;
          } else {
            wx.showToast({
              title: '该电视暂不支持小程序投屏',
              icon: 'none',
              duration: 2000
            });
          }
        }
      })
    }
    
  },
  copyPasswod:function(res){
    wx.setClipboardData({
      data: res.target.dataset.wifi_password,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功'
            })
          }
        })
      }
    })
  },
  chooseImage: util.throttle(function (res) {//点击事件
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    
    if (user_info.is_wx_auth != 2) {
      that.setData({
        showWXAuthLogin: true
      })
    }else {
      that.setData({
        hiddens: false,
      })
      var box_mac = res.currentTarget.dataset.boxmac;
      var openid = res.currentTarget.dataset.openid;
      wx.navigateTo({
        url: '/pages/launch/pic/index?box_mac=' + box_mac + '&openid=' + openid + '&intranet_ip=' + intranet_ip,
      })
      that.setData({
        hiddens: true,
      })
    }
  }, 1000),

  //选择视频投屏
  chooseVideo: util.throttle(function (res) {//点击事件
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    if (user_info.is_wx_auth != 2) {
      that.setData({
        showWXAuthLogin: true
      })
    }else {
      that.setData({
        hiddens: false,
      })
      var box_mac = res.currentTarget.dataset.boxmac;
      var openid = res.currentTarget.dataset.openid;
      wx.navigateTo({
        url: '/pages/launch/video/index?box_mac=' + box_mac + '&openid=' + openid + '&intranet_ip=' + intranet_ip,
      })
      that.setData({
        hiddens: true,
      })
    }
    
  }, 1000),
  scanCode:function(e){
    wx.showModal({
      title: '提示',
      content: "您可扫码链接热点合作餐厅电视,使用此功能",
      showCancel: true,
      confirmText: '立即扫码',
      success: function (res) {
        if (res.confirm == true) {
          wx.scanCode({
            onlyFromCamera: true,
            success: (res) => {
              //console.log(res);
              wx.navigateTo({
                url: '/' + res.path
              })
            }
          })
        }
      }
    });
  },

  onGetUserInfo: function (res) {
    var wifi_mac = res.currentTarget.dataset.wifi_mac;
    var wifi_name = res.currentTarget.dataset.wifi_name;
    var use_wifi_password = res.currentTarget.dataset.wifi_password;
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    if (res.detail.errMsg == 'getUserInfo:ok') {
      wx.request({
        url: 'https://mobile.littlehotspot.com/Smallappsimple/User/register',
        data: {
          'openid': openid,
          'avatarUrl': res.detail.userInfo.avatarUrl,
          'nickName': res.detail.userInfo.nickName,
          'gender': res.detail.userInfo.gender
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          wx.setStorage({
            key: 'savor_user_info',
            data: res.data.result,
          });
          that.setData({
            showWXAuthLogin: false,
          })
          app.connectHotelwifi(wifi_mac, wifi_name, use_wifi_password,that)
        }
      })
    }
    
    
  },
  //关闭授权弹窗
  closeAuth: function () {
    //关闭授权登陆埋点
    var that = this;
    that.setData({
      showWXAuthLogin: false,
    })
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    if (box_mac == 'undefined' || box_mac == undefined) {
      box_mac = '';
    }
    wx.request({
      url: 'https://mobile.littlehotspot.com/Smallapp21/index/closeauthLog',
      header: {
        'content-type': 'application/json'
      },
      data: {
        openid: openid,
        box_mac: box_mac,
      },

    })
  },
})
