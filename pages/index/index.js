//index.js
//获取应用实例
const util = require('../../utils/util.js')
const app = getApp()
var openid;
var box_mac;
var is_view_wifi = 0;
var wifi_password;
var intranet_ip;
var wifi_name;
var wifi_mac;
var use_wifi_password;
var forscreen_type;
var qrcode_url;
var type = 6;
var common_appid = app.globalData.common_appid;
var rest_appid   = app.globalData.rest_appid;
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
    is_view_rest:1,
    
    showRetryModal: true, //连接WIFI重试弹窗
    wifiCloseModal:false,
  },
  onLoad: function (e) {
    //this.setData({ showRetryModal: true});

    wx.hideShareMenu();
    var that = this;
    
    
    that.setData({
      common_appid: common_appid,
      rest_appid: rest_appid,
    })
    if ( typeof(e.scene) != 'undefined' ){//扫小程序码过来 
      var scene = decodeURIComponent(e.scene);
      var scene_arr = scene.split('_');
      box_mac = scene_arr[0];
      type    = scene_arr[1];  
      if (typeof (type) =='undefined'){
        type = 6;
      }
      if (box_mac == undefined || box_mac == 'undefined' || box_mac == '') {
        that.setData({
          is_view_rest: 0,
          showModal: true
        })
      }else {
        linkHotelWif(box_mac, type);
      }
      
    } else if (typeof (e.q) !='undefined'){//扫二维码过来
      var q = decodeURIComponent(e.q);
      var selemite = q.indexOf("?");
      var scene = q.substring(selemite + 3, q.length);
      wx.request({
        url: 'https://mobile.littlehotspot.com/smallappsimple/index/getQrcontent',
        header: {
          'content-type': 'application/json'
        },
        data:{
          content:scene
        },
        success:function(res){
          if(res.data.code==10000){
            var content = res.data.result.content;
            var content_arr = content.split('_');
            box_mac = content_arr[0];
            type = content_arr[1];
            linkHotelWif(box_mac, type);
          }else {
            wx.showToast({
              title: '二维码异常',
              icon: 'none',
              duration: 2000
            });
            that.setData({
              is_view_rest: 0,
              showModal: true
            })
          }
        },
        fail:function(res){
          wx.showToast({
            title: '二维码异常',
            icon: 'none',
            duration: 2000
          });
          that.setData({
            is_view_rest: 0,
            showModal: true
          })
        }

      })
 

    }else {//小程序跳转过来
      
      box_mac = e.box_mac
      //box_mac ='00226D584279' //演示1
      //box_mac ='00226D583D92';
      //box_mac = '00226D655202'//bicao
      // box_mac = '00226D5846EA'//A1
      //box_mac ='00226D65522A'
      //box_mac = '00226D655662'
      if (box_mac == undefined || box_mac == 'undefined' || box_mac == '') {
        that.setData({
          is_view_rest: 0,
          showModal: true
        })
      }else {
        linkHotelWif(box_mac, type);
      }
      
    }
    /*if (box_mac == undefined || box_mac =='undefined' || box_mac=='' ){
      that.setData({
        is_view_rest:0,
        showModal:true
      })
    }else {
      
      
    }*/
    
    function linkHotelWif(box_mac,type){
      that.setData({
        box_mac: box_mac,
        hiddens: false,
      })

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
            "type": type,
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
        getHotelInfo(box_mac, app.globalData.openid);

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
                "type": type,
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
          getHotelInfo(box_mac, openid);
        }
      }
    }
    function getHotelInfo(box_mac, openid) {//获取链接的酒楼信息
      
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
            intranet_ip = res.data.result.intranet_ip;
            wifi_name = res.data.result.wifi_name;
            wifi_password = res.data.result.wifi_password;
            use_wifi_password = wifi_password

            if (wifi_name == '' || wifi_mac == '') {
              that.setData({
                is_view_rest: 0,
                hiddens: true,
                showRetryModal: true
              })
            } else {
              that.setData({
                is_link: 1,
              })


              if (wifi_password == '') {
                wifi_password = "未设置wifi密码";
              }
              wifi_mac = res.data.result.wifi_mac;

              if (wifi_mac == '') {//如果后台未填写wifi_mac  获取wifi列表自动链接
                that.setData({
                  hotel_name: res.data.result.hotel_name,
                  room_name: res.data.result.room_name,
                  wifi_name: wifi_name,
                  wifi_password: wifi_password,
                  use_wifi_password: use_wifi_password,
                  intranet_ip: intranet_ip,
                  openid: openid,
                })
              } else {//如果后台填写了wifi_mac直接链接
                that.setData({
                  hotel_name: res.data.result.hotel_name,
                  room_name: res.data.result.room_name,
                  wifi_name: wifi_name,
                  wifi_password: wifi_password,
                  use_wifi_password: use_wifi_password,
                  intranet_ip: intranet_ip,
                  openid: openid
                })
                var user_info = wx.getStorageSync("savor_user_info");

                if (user_info.is_wx_auth != 3) {
                  that.setData({
                    hiddens: true,
                    wifi_mac: res.data.result.wifi_mac,
                    showWXAuthLogin: true
                  })
                } else {
                  that.setData({
                    hiddens: false,
                  })
                  wx.getSystemInfo({
                    success: function (res) {
                      if (res.system.indexOf("Android") > -1) {//安卓手机
                        if (res.wifiEnabled == false) {
                          wx.showToast({
                            title: '请打开您的wifi',
                            icon: 'none',
                            duration: 2000
                          });
                          that.setData({
                            wifiCloseModal: true,
                            hiddens: true,
                          })
                          wx.request({
                            url: 'https://mobile.littlehotspot.com/Smallappsimple/Index/recordWifiErr',
                            headers: {
                              'Content-Type': 'application/json'
                            },

                            method: "POST",
                            data: {
                              err_info: '{"errMs":"请打开您的wifi"}',
                              box_mac: box_mac
                            }
                          })
                        } else {
                          for (var j = 0; j < 1; j++) {
                            var rt = app.linkHotelWifi(box_mac, wifi_mac, wifi_name, use_wifi_password, that, 1);
                          }
                        }
                      } else if (res.system.indexOf("iOS") > -1) {//ios手机

                        for (var j = 0; j < 1; j++) {
                          var rt = app.linkHotelWifi(box_mac, wifi_mac, wifi_name, use_wifi_password, that, 2);

                        }
                      }
                    }
                  })
                }
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
  chooseImage: function (res) {//点击事件
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    
    if (user_info.is_wx_auth != 3) {
      that.setData({
        showWXAuthLogin: true
      })
    }else {
      that.setData({
        img_disable:true,
        
      })
      var box_mac = res.currentTarget.dataset.boxmac;
      var openid = res.currentTarget.dataset.openid;
      
      wx.startWifi({
        success: function () {
          
          wx.getConnectedWifi({
            success: function (res) {
              
              var errCode = res.errCode;
              var ssid = res.wifi.SSID;
              var jump_url = '/pages/launch/pic/index?box_mac=' + box_mac + '&openid=' + openid + '&intranet_ip=' + intranet_ip;
              if (errCode == 0 && wifi_name == ssid) {
                
                wx.navigateTo({
                  url: jump_url,
                })
                that.setData({
                  img_disable: false,
                  video_disable: false,
                  birthday_disable: false,
                })
              } else {
                //连接当前wifi
                //连接成功后跳转
                
                app.connectHotelwifi(openid, wifi_mac, wifi_name, use_wifi_password, intranet_ip, that, jump_url, forscreen_type= 1);


              }
            },
            fail:function(res){
              console.log('getConnectedWifi erro');
            }
          })
        },
        fail: function (res) {
          console.log('not open wifi');
        }
      })
      
        
    }
  }, 

  //选择视频投屏
  chooseVideo: util.throttle(function (res) {//点击事件
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    if (user_info.is_wx_auth != 3) {
      that.setData({
        showWXAuthLogin: true
      })
    }else {
      that.setData({
        video_disable: true,

      })
      var box_mac = res.currentTarget.dataset.boxmac;
      var openid = res.currentTarget.dataset.openid;

      wx.startWifi({
        success: function () {

          wx.getConnectedWifi({
            success: function (res) {

              var errCode = res.errCode;
              var ssid = res.wifi.SSID;
              var jump_url = '/pages/launch/video/index?box_mac=' + box_mac + '&openid=' + openid + '&intranet_ip=' + intranet_ip;
              if (errCode == 0 && wifi_name == ssid) {

                wx.navigateTo({
                  url: jump_url,
                })
                that.setData({
                  img_disable: false,
                  video_disable: false,
                  birthday_disable: false,
                })
              } else {
                //连接当前wifi
                //连接成功后跳转
                
                app.connectHotelwifi(openid, wifi_mac, wifi_name, use_wifi_password, intranet_ip, that, jump_url,forscreen_type = 2);


              }
            },
            fail: function (res) {
              console.log('getConnectedWifi erro');
            }
          })
        },
        fail: function (res) {
          console.log('not open wifi');
        }
      })
      //判断是否连接当前包间wifi

      /*that.setData({
        hiddens: false,
      })
      var box_mac = res.currentTarget.dataset.boxmac;
      var openid = res.currentTarget.dataset.openid;
      wx.navigateTo({
        url: '/pages/launch/video/index?box_mac=' + box_mac + '&openid=' + openid + '&intranet_ip=' + intranet_ip,
      })
      that.setData({
        hiddens: true,
      })*/
    }
    
  }, 1000),
  showHappy:function(res){
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");

    if (user_info.is_wx_auth != 3) {
      that.setData({
        showWXAuthLogin: true
      })
    } else {
      that.setData({
        birthday_disable: true,

      })
      var box_mac = res.currentTarget.dataset.boxmac;
      var openid = res.currentTarget.dataset.openid;

      wx.startWifi({
        success: function () {

          wx.getConnectedWifi({
            success: function (res) {

              var errCode = res.errCode;
              var ssid = res.wifi.SSID;
              var jump_url = '/pages/launch/birthday/index?box_mac=' + box_mac + '&openid=' + openid + '&intranet_ip=' + intranet_ip;
              if (errCode == 0 && wifi_name == ssid) {

                wx.navigateTo({
                  url: jump_url,
                })
                that.setData({
                  img_disable:false,
                  video_disable:false,
                  birthday_disable: false,
                  
                })
              } else {
                //连接当前wifi
                //连接成功后跳转

                app.connectHotelwifi(openid, wifi_mac, wifi_name, use_wifi_password, intranet_ip, that, jump_url, forscreen_type = 3);


              }
            },
            fail: function (res) {
              console.log('getConnectedWifi erro');
            }
          })
        },
        fail: function (res) {
          console.log('not open wifi');
        }
      })
    }
  },
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
    var openid  = res.currentTarget.dataset.openid;
    var intranet_ip = res.currentTarget.dataset.intranet_ip;

    
    var that = this;
    var user_info = wx.getStorageSync("savor_user_info");
    openid = user_info.openid;
    if (res.detail.errMsg == 'getUserInfo:ok') {
      /*wx.request({
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
            hiddens:false,
          })
          app.connectHotelwifi(openid, wifi_mac, wifi_name, use_wifi_password, intranet_ip,that)
        }
      })*/
      wx.getUserInfo({
        success(rets) {
          wx.request({
            url: 'https://mobile.littlehotspot.com/Smallappsimple/User/registerCom',
            data: {
              'openid': openid,
              'avatarUrl': rets.userInfo.avatarUrl,
              'nickName': rets.userInfo.nickName,
              'gender': rets.userInfo.gender,
              'session_key': app.globalData.session_key,
              'iv': rets.iv,
              'encryptedData': rets.encryptedData
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (rs) {
              if(rs.data.code==10000){
                wx.setStorage({
                  key: 'savor_user_info',
                  data: rs.data.result,
                });
                that.setData({
                  showWXAuthLogin: false,
                  hiddens: false,
                })
                app.connectHotelwifi(openid, wifi_mac, wifi_name, use_wifi_password, intranet_ip, that)
              }else {
                wx.showToast({
                  title: '微信授权登陆失败，请重试',
                  icon: 'none',
                  duration: 2000,

                })
              }

            },
            fail: function (res) {
              wx.showToast({
                title: '微信登陆失败，请重试',
                icon: 'none',
                duration: 2000
              });
            }
          })
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
  netRetry:function(res){
    var that = this;
    that.setData({
      showRetryModal:false,
      hiddens:false,
    })
    if(wifi_name=='' || wifi_mac==''){
      that.setData({
        showRetryModal: true,
      })
    }else {
      app.connectHotelwifi(openid, wifi_mac, wifi_name, use_wifi_password, intranet_ip, that,'',0);
    }
    
  },
  //遥控呼大码
  callQrCode: util.throttle(function (e) {
    var user_info = wx.getStorageSync('savor_user_info');
    openid = user_info.openid;
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
    var user_info = wx.getStorageSync('savor_user_info');
    openid = user_info.openid;
    app.controlExitForscreen(intranet_ip, openid);
  },
  //遥控调整音量
  changeVolume: function (e) {
    var user_info = wx.getStorageSync('savor_user_info');
    openid = user_info.openid;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeVolume(intranet_ip, openid, change_type);

  },
  //遥控切换节目
  changeProgram: function (e) {
    var user_info = wx.getStorageSync('savor_user_info');
    openid = user_info.openid;
    var change_type = e.currentTarget.dataset.change_type;
    app.controlChangeProgram(intranet_ip, openid, change_type);
  },
})
