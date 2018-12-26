//index.js
//获取应用实例
const app = getApp()
var openid;
var box_mac;
var is_view_link = 0;
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
    wifi_name:'',
    wifi_password:'',
  },
 
  onLoad: function (e) {
    var that = this;
    //box_mac = e.box_mac        *********上线打开
    box_mac = '00226D655202'     //******上线去掉*/
    that.setData({
      box_mac:box_mac,
    })
    wx.hideShareMenu();
    
    if (app.globalData.openid && app.globalData.openid != '') {
      that.setData({
        openid: app.globalData.openid
      })
      openid = app.globalData.openid;
      //判断用户是否注册
      wx.request({
        url: 'https://mobile.littlehotspot.com/smallappsimple/User/isRegister',
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
      //getHotelInfo(box_mac);
      
    } else {
      app.openidCallback = openid => {
        if (openid != '') {
          that.setData({
            openid: openid
          })
          openid = openid;
          //判断用户是否注册
          wx.request({
            url: 'https://mobile.littlehotspot.com/smallappsimple/User/isRegister',
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
          
        }
      }
      
    }
    getHotelInfo(box_mac);
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
          that.setData({
            is_link:1
          })
          if(res.data.code==10000){
            var wifi_name = res.data.result.wifi_name;
            var wifi_password = res.data.result.wifi_password;
            var use_wifi_password = wifi_password
            if(wifi_password==''){
              wifi_password="未设置wifi密码";
            }
            that.setData({
              hotel_name: res.data.result.hotel_name,
              room_name: res.data.result.room_name,
              is_link: 1,
              wifi_name: wifi_name,
              wifi_password: wifi_password
            })
            
            
            wx.startWifi({
              success: function (res) {
                
                wx.getWifiList({
                  success:function(et){
                    wx.onGetWifiList(function (ret) {
                      var wifilist = ret.wifiList;
                      console.log(wifilist);
                      for (var i = 0; i < ret.wifiList.length; i++) {
                        if(wifi_name==wifilist[i]['SSID']){
                          console.log(wifilist[i]);
                          wx.connectWifi({
                            SSID: wifilist[i]['SSID'],
                            BSSID: wifilist[i]['BSSID'],
                            password: use_wifi_password,
                            success: function (res) {
                              console.log('wifi连接成功');
                              that.setData({
                                is_link_wifi:1,
                                
                              })
                            },
                            fail: function (res) {
                              //console.log(res.errMsg);
                              that.setData({
                                is_link_wifi: 0,
                                
                              })
                            }
                          })
                          break;
                        }
                      }
                    })
                  }
              
                })
              }
            })
            
            
          }else {

          }
          
        }
      })
    }
    
  },
  viewWifi:function(res){
    var that = this;
    if(is_view_link==0){
      that.setData({
        is_link_wifi:1,
      })
      is_view_link = 1;
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
            //var use_wifi_password = wifi_password
            if (wifi_password == '') {
              wifi_password = "未设置wifi密码";
            }
            that.setData({
              wifi_name: wifi_name,
              wifi_password: wifi_password,
              is_link_wifi: 0,
            })
            is_view_link = 0;
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
    //console.log(res.target.dataset.wifi_password);
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
  }
})
