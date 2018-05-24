//app.js
var consts = require('./utils/consts.js').consts;//const数据
var utilLog = require('./utils/util.js').log;//log
var util = require('./utils/util.js');
var compVer = require('./utils/util.js').compVersion;//比较版本号
var util = require('./utils/util.js');
var tdweapp = require('./utils/tdweapp.js');
var levelConfigOverCall;
var app;
var CryptoJS = require('utils/rc4.js');
var key = CryptoJS.enc.Utf8.parse("SYDS@ac2018y0uxi");

App({
  onLaunch: function (ops) {
    app = this;
    app.globalData.haventPlayLvs = true;

    var recordData = wx.getStorageSync(consts.RECORD_RECORDS);
    if (recordData && recordData.length > 3) {
      app.globalData.recordDatas = JSON.parse(recordData);
    } else {
      app.globalData.recordDatas = new Object();
    }
    if (ops.scene == "1007" || ops.scene == "1008") {
      utilLog("onLaunch with share");
    }
    else if (ops.scene == "1035") {
      // app.globalData.isPublicIn = true;//暂时先屏蔽
    }
    console.log("game scene", ops.scene);//记录当前玩家是从哪个入口进入游戏的,方便做后期的新包解锁

    wx.getSystemInfo({
      success: function (res) {
        utilLog("手机参数:", res);
        app.globalData.sdkV = res.SDKVersion;
        // 初始化声音
        app.initAudio(app.globalData.sdkV);
        // 初始化屏幕设置
        app.initScreen(res);
        // 获取用户信息
        app.getSetting();
      }
    });
  },

  onShow: function () {
    app.getAds();
  },

  // 初始化声音
  initAudio: function (sdkV){
    if (compVer(sdkV, "1.6.0") >= 0) {
      app.globalData.clickAudio = wx.createInnerAudioContext();
      app.globalData.clickAudio.autoplay = false;
      app.globalData.clickAudio.obeyMuteSwitch = false;
      app.globalData.clickAudio.onPlay(() => {
      });
      app.globalData.clickAudio.onError((res) => {
        utilLog(res.errMsg);
        utilLog(res.errCode);
      });

      if (!app.globalData.clickAudio.src) {
        app.globalData.clickAudio.src = app.getCommonResourceUrl() + 'sound/click.mp3?ran=' + Math.ceil(Math.random() * 100000);
      }
      app.globalData.clickAudio.seek(0);
      app.globalData.clickAudio.pause();
      app.globalData.clickAudio.obeyMuteSwitch = false;
    }
  },

  // 初始化屏幕配置
  initScreen:function(res){
    app.globalData.screenScale = (res.windowWidth) / app.globalData.screenWidth;
    var bgWidth = res.windowWidth * 2;
    var bgHeight = (res.windowHeight) * 2 / app.globalData.screenScale;
    if (bgWidth < 750) {
      bgWidth = 750;
    }
    app.globalData.screenWidth = bgWidth;
    app.globalData.screenHeight = bgHeight;
    // console.log("高度", bgHeight, "scale:", app.globalData.screenScale,bgWidth,bgHeight);
  },

  //  获取广告时间
  getAds: function () {
    var ad;
    wx.request({
      url: app.getResourceUrl() + 'config/ad.json?ran=' + Math.ceil(Math.random() * 10000000),
      success: function (res) {
        ad = res.data;
        // console.log(ad)
        app.globalData.clickTimeStart = new Date(ad.data.ad1.clickTimeStart).getTime();
        app.globalData.clickTimeEnd = new Date(ad.data.ad1.clickTimeEnd).getTime();
        app.globalData.showTimeStart = new Date(ad.data.ad1.showTimeStart).getTime();
        app.globalData.showTimeEnd = new Date(ad.data.ad1.showTimeEnd).getTime();
        app.globalData.countShow = ad.data.ad1.countShow;
        app.globalData.countClick = ad.data.ad1.countClick;
        // console.log("广告结束");
        // console.log( app.globalData.clickTimeStart)

      },
      fail: function () {
      }
    });
  },

  //广告位显示次数提交
  setShowData: function (keyId, adId, count, func) {
    wx.request({
      url: app.getBaseUrl() + 'incrby?key=' + keyId + '&gameId=' + consts.GAMEID + '&incrKey=' + adId + '&increment=' + count + '&session=' + app.globalData.session,
      fail: function () {
      },
      success: function (res) {
        console.log(res);
        if (func != null) {
          func(res);
        }
        app.getServerCheck(res.data, function () {
          app.getIncrbyData(keyId, adId, adincr, func);
          console.log("incrby")
        });
      },
    });
  },

  //广告位显示次数获取
  getShowAd: function (keyId, adId, func) {
    wx.request({
      url: app.getBaseUrl() + 'get?key=' + keyId + '&gameId=' + consts.GAMEID + '&incrKey=' + adId + '&session=' + app.globalData.session,
      fail: function () {

      },
      success: function (res) {
        //广告展示次数
       console.log(res, " 获取次数")
        var countShow = res.data;
        utilLog("获取全部存档数据:");
        utilLog(res);
        utilLog("hgetall", res.data);
        if (app.getServerCheck(res.data, function () {
          app.getShowAd(keyId, adId);
        })) {
          return;
        }
        if (wx.getStorageSync('localCountShow') == 1) {
          app.globalData.IsCountClick = true;
          return
        }
        if (countShow == "") {
          app.globalData.IsCountClick = false;
        }
        if (countShow <= app.globalData.countShow || countShow == "") {
          app.globalData.IsCountClick = false;
        } else {
          app.globalData.IsCountClick = true;
        }
        if (func != null) {
          func(res);
        }
      },
    });
  },

  //广告位点击次数提交
  setIncrbyData: function (keyId, adId, count, func) {
    wx.request({
      url: app.getBaseUrl() + 'incrby?key=' + keyId + '&gameId=' + consts.GAMEID + '&incrKey=' + adId + '&increment=' + count + '&session=' + app.globalData.session,
      fail: function () {
      },
      success: function (res) {
        if (func != null) {
          func(res);
        }
        app.getServerCheck(res.data, function () {
          app.getIncrbyData(keyId, adId, adincr, func);
          console.log("incrby")
        });
      },
    });
  },

  //广告位点击次数获取
  getIncrbyClick: function (keyId, adId, func) {
    wx.request({
      url: app.getBaseUrl() + 'get?key=' + keyId + '&gameId=' + consts.GAMEID + '&incrKey=' + adId + '&session=' + app.globalData.session,
      fail: function () {

      },
      success: function (res) {
        //广告展示次数

        console.log(res.data, "获取次数")
        var countClick = res.data;
       
        utilLog("获取全部存档数据:");
        utilLog(res);
        utilLog("hgetall", res.data);
        if (app.getServerCheck(res.data, function () {
          app.getIncrby(keyId, adId);
        })) {
          return;
        }
        if (wx.getStorageSync('localCountClick') == 1) {
          app.globalData.IsCountClick = true;
          return
        }
        if (countClick == "") {
          app.globalData.IsCountClick = false;
        }
        else if (countClick <= app.globalData.countClick) {
          app.globalData.IsCountClick = false;
        } else if (countClick > app.globalData.countClick) {
          app.globalData.IsCountClick = true;
        }
        if (func != null) {
          func(res);
        }

      },
    });
  },

  // 获取用户信息
  getSetting: function () {
    wx.getSetting({
      success: res => {
        console.log("是否授权 " + res.authSetting['scope.userInfo']);
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              app.globalData.userInfo = res.userInfo;
              // console.log("微信实时头像数据", app.globalData.userInfo);
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (app.userInfoReadyCallback) {
                app.userInfoReadyCallback(res)
                utilLog('userInfoReadyCallbackxxxxxxxxxxxxxxxx')
              }
            }
          })
        }
        else {
          console.log("wx authorize");
          wx.authorize({
            scope: 'scope.userInfo',
            success: () => {
              console.log("success");
              app.getSetting();
            }
          })
        }
      }
    });
  },

  //播放音效
  playClickSound: function () {
    if (compVer(app.globalData.sdkV, "1.6.0") < 0) {
      return;
    }
    if (!app.globalData.musicOn){
      return;
    }
    if (!app.globalData.clickAudio.src){
      app.globalData.clickAudio.src = app.getCommonResourceUrl() + 'sound/click.mp3?ran=' + Math.ceil(Math.random() * 100000);
    }
    app.globalData.clickAudio.seek(0);
    app.globalData.clickAudio.pause();
    app.globalData.clickAudio.obeyMuteSwitch = false;
    app.globalData.clickAudio.play();
  },

  //获取所有好友的排行列表数据
  getAllFriendsRankList: function () {
    //当好友人数很多时,采取分批拉取数据
    var ranklist = (app.globalData.friendOpenId.slice(0, app.globalData.friendOpenId.length));
    ranklist.unshift(app.globalData.openId);
    var batchlength = ranklist.length / 20;
    if (batchlength < 1) {
      batchlength = 1;
    }

    for (var j = 0; j < batchlength; j++) {
      var openids = null;
      if (j == batchlength - 1) {
        openids = ranklist.slice(j * 20, ranklist.length - (j * 20));
      } else {
        openids = ranklist.slice(j * 20, 20);
      }
      for (var i = 0; i < openids.length; i++) {
        openids[i] = openids[i] + "_1";
      }
      // utilLog(JSON.stringify(openids));
      var fields = new Array();
      fields[0] = consts.TYPE_BASE;
      fields[1] = consts.TYPE_WX;
      fields[2] = consts.TYPE_TIMECOST;
      app.getArrayUserData(JSON.stringify(openids).toString(), JSON.stringify(fields).toString(), app.friendsListCallback);
    }
  },

  friendsListCallback: function (keyId, fieldId, datass) {
    // console.log("好友得分数据更新",datass);
    if (app.globalData.friendRankList == null) {
      app.globalData.friendRankList = [];
    }
    var json = datass;//.data;
    var length = (app.globalData.friendOpenId.length + 1);
    if (app.globalData.friendRankList.length < length) {
      for (var i = 0; i < json.length; i++) {
        app.globalData.friendRankList.push(json[i]);
      }
      // if (app.globalData.friendRankList.length >= length) {
      // }
    }
  },

  //基础的链接地址ip
  getBaseUrl: function () {
    if (this.globalData.innerNet) {
      return "http://192.168.19.43:3000/";//
    }
    return "https://littlegame.server.ac.yxd17.com/";
    // return "http://47.100.247.40:3000/";//
  },

  //资源服务器地址
  getResourceUrl: function () {
    // if (this.globalData.innerNet) {
    //   return "http://106.14.153.203/";//
    // }
    return "https://littlegame.resource.ac.yxd17.com/ac/wx/ppline/resources/";//
  },

  //小游戏通用的资源服务器地址
  getCommonResourceUrl: function () {
    // if (this.globalData.innerNet) {
    //   return "http://106.14.153.203/";//
    // }
    return "https://littlegame.resource.ac.yxd17.com/ac/wx/common/";//
  },

  // 设置为原始数据
  globalDataToZero: function () {
    app.globalData.levelId = 1;
    app.globalData.biglevel = 0;
    app.globalData.baseInfo = new Object();
    app.globalData.baseInfo.coinNum = app.globalData.gameConfig.reginalCoin;
    // app.globalData.baseInfo.diam = 0;
    app.globalData.baseInfo.levelId = app.globalData.levelId;
    app.globalData.baseInfo.biglevel = app.globalData.biglevel;
    if (app.globalData.baseInfo.levelProgress == null || typeof (app.globalData.baseInfo.levelProgress) == 'undefined') {
      app.globalData.baseInfo.levelProgress = [];
    }
    if (app.globalData.baseInfo.levelProgress[app.globalData.levelType] == null ||
      (typeof (app.globalData.baseInfo.levelProgress[app.globalData.levelType])) == 'undefined') {
      app.globalData.baseInfo.levelProgress[app.globalData.levelType] = [];
      app.globalData.baseInfo.levelProgress[app.globalData.levelType][0] = 1;
    }
    var strss = JSON.stringify(app.globalData.baseInfo).toString();
    // utilog.log(strss);
    app.globalData.sessCheckMax = 0;
    app.globalData.otherInfo = { "curSkin": 0, "skinState": { "0": [3, 0], "1": [2, 0] }, "adContent": app.globalData.adConfig }
    app.globalData.otherInfo.colorWeak = false;     
    app.globalData.otherInfo.createTime = (new Date()).toUTCString();
    app.setUserData(app.globalData.openIdKey, consts.TYPE_OTHER, JSON.stringify(app.globalData.otherInfo).toString());
    app.setUserData(app.globalData.openIdKey, consts.TYPE_BASE, strss);
  },

  //获取用户的存档数据通用接口
  setUserData: function (keyId, fieldId, valu) {
    //上报数据
    wx.reportAnalytics('set_user_data', {
      state: 1,
    });
    wx.request({
      url: app.getBaseUrl() + 'hset?key=' + keyId + '&gameId=' + consts.GAMEID + '&field=' + fieldId + '&value=' + valu + '&session=' + app.globalData.session,
      fail: function () {
        //上报数据
        wx.reportAnalytics('set_user_data', {
          state: 0,
        });
      },
      success: function (res) {
        utilLog("设置数据");
        utilLog("hset", res.data);
        app.getServerCheck(res.data, function () {
          app.setUserData(keyId, fieldId, valu);
        });//, app.setUserData(keyIdId, fieldIdId, valuId))
      },
    });
  },

  //向后台传递formid
  saveFormId: function (formid) {
    //上报数据
    wx.reportAnalytics('send_form_id', {
      state: 1,
    });
    wx.request({
      url: app.getBaseUrl() + 'saveFormId?openid=' + app.globalData.openId + '&gameId=' + consts.GAMEID + '&formId=' + formid,//+ '&session=' + app.globalData.session,
      fail: function () {
        //上报数据
        wx.reportAnalytics('send_form_id', {
          state: 0,
        });
      },
      success: function (res) {
        utilLog("表单id成功");
        utilLog("saveFormId", res.data);
        app.getServerCheck(res.data, null);
      },
    });
  },

  //获取用户的存档数据通用接口
  getUserAllData: function (keyId, callBack) {
    //上报数据
    wx.reportAnalytics('get_all_datas', {
      state: 1,
    });
    wx.request({
      //登陆
      url: app.getBaseUrl() + 'HGETALL?key=' + keyId + '&gameId=' + consts.GAMEID + '&session=' + app.globalData.session,
      //code传给后台拿到openid
      success: function (res) {
        utilLog("获取全部存档数据:");
        utilLog(res);
        utilLog("hgetall", res.data);
        if (app.getServerCheck(res.data, function () {
          app.getUserAllData(keyId, callBack);
        })) {
          return;
        }
        if (res.statusCode == 200) {
          //成功
          if (callBack != null) {
            callBack(keyId, res.data);
          }
        }
      },
      fail: function () {
        //上报数据
        wx.reportAnalytics('get_all_datas', {
          state: 0,
        });
        // console.log("fail");
      },
    });
  },

  getUserData: function (keyId, fieldId, callBack) {
    //上报数据
    wx.reportAnalytics('get_data', {
      state: 1,
    });
    wx.request({
      //登陆
      url: app.getBaseUrl() + 'HGET?key=' + keyId + '&gameId=' + consts.GAMEID + '&field=' + fieldId + '&session=' + app.globalData.session,
      fail: function () {
        //上报数据
        wx.reportAnalytics('get_data', {
          state: 0,
        });
      },
      success: function (res) {
        // console.log("获取存档数据:");
        // console.log(res.data);
        utilLog("hget", res.data);
        app.getServerCheck(res.data, function () {
          app.getUserData(keyId, fieldId, callBack);
        });
        if (res.statusCode == 200) {
          //成功
          if (callBack != null) {
            callBack(keyId, fieldId, res.data);
          }
        }
      },
    });
  },

  //获取数组keys的数据
  getArrayUserData: function (keyId, fieldIds, callBack) {
    //上报数据
    wx.reportAnalytics('get_array_keys', {
      state: 1,
    });
    wx.request({
      //登陆
      url: app.getBaseUrl() + 'HMGET?keys=' + keyId + '&key=' + (app.globalData.openId + "_1") + '&gameId=' + consts.GAMEID + '&fields=' + fieldIds + '&session=' + app.globalData.session,
      //code传给后台拿到openid
      success: function (res) {
        utilLog("获取数组存档信息:");
        // utilLog(res.data);
        utilLog("hmget", res.data);
        app.getServerCheck(res.data, function () {
          app.getArrayUserData(keyId, fieldIds, callBack);
        });
        if (res.statusCode == 200) {
          //成功
          if (callBack != null) {
            callBack(keyId, fieldIds, (res.data));
          }
        }
      },
      fail: function () {
        //上报数据
        wx.reportAnalytics('get_array_keys', {
          state: 0,
        });
      }
    });
  },

  //将新数据添加到服务器
  addUserData: function (openid, field, value, isgetResult) {
    //上报数据
    wx.reportAnalytics('add_part_data', {
      state: 1,
    });
    wx.request({
      url: app.getBaseUrl() + 'addStringArray?key=' + openid + '&gameId=' + consts.GAMEID + '&field=' + field + '&value=' + value + '&ret=' + isgetResult + '&session=' + app.globalData.session,
      fail: function () {
        //上报数据
        wx.reportAnalytics('add_part_data', {
          state: 0,
        });
      },
      success: function (data) {
        utilLog("添加数据到数组");
        utilLog(data);
        // console.log("addStringArray", data.data);
        app.getServerCheck(data.data, function () {
          app.addUserData(openid, field, value, isgetResult);
        });
      },
    })
  },

  //删除服务器的存档
  delUserData: function (keyId, fieldId) {
    wx.request({
      url: app.getBaseUrl() + 'HDEL?key=' + keyId + '&gameId=' + consts.GAMEID + '&field=' + fieldId + '&session=' + app.globalData.session,
      success: function (res) {
        utilLog("删除成功!");
        utilLog(res);
      }
    })
  },

  getServerCheck: function (resData, callBack) {
    if (resData.hasOwnProperty("ret") && resData.hasOwnProperty("code") && resData.ret == 1 && resData.code == 1) {//当前用户的session和服务器不匹配,需要跟服务器重新请求
      utilLog("获取服务器校验信息 ", resData);
      app.globalData.sessCheckMax++;
      if (app.globalData.sessCheckMax > consts.SERVER_CHECK_MAX) {
        wx.showToast({
          title: '请求过于频繁',
          icon: 'none',
        })
        return;
      }
      wx.login({
        success: res => {
          // console.log(res);
          //调用接口
          wx.reportAnalytics('user_openid', {
            state: 1,
          });
          wx.request({//登陆
            url: app.getBaseUrl() + 'openid?code=' + res.code + '&gameId=' + consts.GAMEID,
            //code传给后台拿到openid
            success: function (resss) {
              utilLog("重新注册openid", resss);
              app.globalData.openId = resss.data.openid;//拿到自己的openid    
              app.globalData.sessionKey = resss.data.session_key;
              app.globalData.session = resss.data.session;
              utilLog(app.globalData.openId);
              //test 
              // app.globalData.openId = 'obtdnGkglAiT0LxjoTps8vrWvF4';
              app.globalData.openIdKey = app.globalData.openId + "_1";//做为玩家存储数据的key                     
              if (callBack != null) {
                callBack();
              }
            },
            fail: function () {
              //调用接口
              wx.reportAnalytics('user_openid', {
                state: 0,
              });
            }
          });
        }
      });
      return true;
    }
    return false;
  },

  // 获取服务器时间
  getServerTime: function (callBack) {
    //上报数据
    wx.reportAnalytics('get_server_time', {
      state: 1,
    });
    wx.request({
      url: app.getBaseUrl() + 'getTime' + '?gameId=' + consts.GAMEID,
      fail: function () {
        //上报数据
        wx.reportAnalytics('get_server_time', {
          state: 0,
        });
      },
      success: function (res) {
        if (callBack) {
          callBack(res.data.now);
        }
      },
    });
  },
  
  //判断当前关卡解锁or Not
  shareOKChargeOpenOrNot: function (levelId, addOne, levelType) {//从0开始   
    var needUpdate = false;
    var openCondition = app.globalData.levelOpenConfig[levelType][levelId].openType;
    //openCondition:0 已经开启的关卡, 1需要打通某个关卡才能解锁,2 需要分享才能解锁
    var openCnts = app.globalData.baseInfo.openedLvArr;//关卡的开启标记数组
    if (typeof (openCnts) == 'undefined') {
      openCnts = [];
    }
    if (typeof (openCnts[levelType]) == 'undefined') {
      openCnts[levelType] = [];
    }
    var condition = [false, false];
    switch (openCondition) {
      case 0://:0 已经开启的关卡,
        condition[0] = true;
        condition[1] = true;
        break;
      case 1://需要打通某个关卡才能解锁
        openCnts[levelType][levelId] = app.levelPassOpen(levelType, levelId, openCnts, 0);
        condition[0] = openCnts[levelType][levelId];
        break;
      // return openCnts[levelType][levelId];
      case 3://需要打通关卡后再分享才能解锁
        var needOver = 0;
        var open = app.levelPassOpen(levelType, levelId, openCnts, 0);
        if (open) {
          open = app.shareCntOpen(levelType, levelId, openCnts, 2, addOne);
          openCnts[levelType][levelId] = open;
          condition[0] = true;
          condition[1] = openCnts[levelType][levelId];
        } else {
          openCnts[levelType][levelId] = open;
          condition[0] = false;
          condition[1] = openCnts[levelType][levelId];
        }
        break;
      case 2://需要分享才能解锁
        openCnts[levelType][levelId] = app.shareCntOpen(levelType, levelId, openCnts, 0, addOne);
        condition[0] = openCnts[levelType][levelId];
        condition[1] = true;
        break;
      case 4://需要分享多少次再打通关卡才能解锁
        openCnts[levelType][levelId] = app.shareCntOpen(levelType, levelId, openCnts, 0, addOne);
        if (openCnts[levelType][levelId]) {//分享条件满足后
          openCnts[levelType][levelId] = app.levelPassOpen(levelType, levelId, openCnts, 1);
          // return [true, openCnts[levelType][levelId]];
          condition[0] = true;
          condition[1] = openCnts[levelType][levelId];
        } else {
          condition[0] = false;
          condition[1] = openCnts[levelType][levelId];
        }
        break;
    }
    return condition;
  },

  // 获取签到状态(-2:将来未签到；-1：过去可补签；0：当天未签到；1：过去已签到；2：当天已签到)
  getLoginState: function (day, currentDay) {
    if (!app.globalData.baseInfo.loginNew) {
      app.globalData.baseInfo.loginNew = {};
    }
    if (app.globalData.baseInfo.loginNew[day]) {
      // 已有签到记录
      if (day == app.globalData.day) {
        return 2;
      }
      else {
        return 1;
      }
    }
    else {
      // 没有签到记录
      if (day < currentDay) {
        return -1;
      }
      if (day == currentDay) {
        if (day < 7) {
          return 0;
        }
        else {
          // console.log("check",app.globalData.baseInfo.loginNew);
          for (var i = 1; i <= 6; i++) {
            if (!app.globalData.baseInfo.loginNew[i] || app.globalData.baseInfo.loginNew[i] == -1) {
              return -2;
            }
          }
          return 0;
        }
      }
      return -2;
    }
  },

  // 增加签到时间
  addSignin: function (day, date) {
    if (!app.globalData.baseInfo.loginNew) {
      app.globalData.baseInfo.loginNew = {};
    }
    app.globalData.baseInfo.loginNew[day] = date;
    app.globalData.sessCheckMax = 0;
    app.setUserData(app.globalData.openIdKey, consts.TYPE_BASE, JSON.stringify(app.globalData.baseInfo).toString());
  },

  // 设置最近登录的时间
  setLoginTime: function (date) {
    app.globalData.baseInfo.loginTime = date;
    app.globalData.sessCheckMax = 0;
    app.setUserData(app.globalData.openIdKey, consts.TYPE_BASE, JSON.stringify(app.globalData.baseInfo).toString());
  },

  // 计算周日时间
  getSundayTime: function (dateTime, day) {
    var nowTime = dateTime.getTime();
    var oneDayLong = 24 * 60 * 60 * 1000;
    var sunday = new Date(nowTime + (7 - day) * oneDayLong);
    var sundayDate = sunday.getFullYear() + "." + (sunday.getMonth() + 1) + "." + sunday.getDate();
    return sundayDate;
  },

  // 计算周日时间
  getSundayTimeByDate: function (date) {
    var dateArr = date.split('.');
    var y = dateArr[0];
    var m = dateArr[1];
    var d = dateArr[2];
    var str = y + "/" + m + "/" + d;
    var dateTime = new Date(str + ' 00:00:00');
    var day = dateTime.getDay();
    if (day == 0) {
      day = 7;
    }
    return this.getSundayTime(dateTime, day);
  },

  // 添加bonus奖励
  getAwardLogic: function (cnt, awardTy, dontToast) {
    switch (awardTy[0]) {
      case consts.AWARD_COIN:
        if (!app.globalData.baseInfo.hasOwnProperty("coinNum")) {
          app.globalData.baseInfo.coinNum = app.globalData.gameConfig.reginalCoin;
        }
        app.globalData.baseInfo.coinNum += cnt;
        if (!dontToast)
          app.showGetItemToast("coin", "", cnt, "./../../Resources/common/jinbi.png");
        break;
      case consts.AWARD_DIAM:
        // 钻石
        if (!app.globalData.baseInfo.diam) {
          app.globalData.baseInfo.diam = 0;
        }
        app.globalData.baseInfo.diam += cnt;
        if (!dontToast)
          app.showGetItemToast("diamond", "", cnt, "./../../Resources/common/teshuhuobi.png");
        break;
      case consts.AWARD_FRAG://碎片
        if (!app.globalData.baseInfo.hasOwnProperty("frag")) {
          app.globalData.baseInfo.frag = [];
        }
        app.globalData.baseInfo.frag[awardTy[0] - 1] += cnt;
        if (!dontToast)
          app.showGetItemToast("fskin", "获得奖励", cnt, '');
        break;
    }
  },

  // 添加道具（皮肤、碎片等）
  addProp: function (propId, count) {
    //皮肤,皮肤碎片
    var isFrag = util.StartWith(propId, "fskin");
    if (util.StartWith(propId, "skin") || isFrag) {
      if (app.globalData.otherInfo == null || typeof (app.globalData.otherInfo) == 'undefined') {
        app.globalData.otherInfo = { "curSkin": 0, "skinState": { "0": [3, 0], "1": [2, 0] }, "adContent": app.globalData.adConfig }
        app.globalData.otherInfo.colorWeak = false;
      }
      if (isFrag) {
        propId = propId.substr(1, propId.length - 1);
      }
      var skinItem = app.globalData.skinConfig[propId];
      console.log('skin*******', skinItem);
      if (isFrag) {//增加皮肤碎片
        var preCnt = app.globalData.otherInfo.skinState[skinItem.id - 1][1];
        app.globalData.otherInfo.skinState[skinItem.id - 1][1] = preCnt + count;
        if (app.globalData.otherInfo.skinState[skinItem.id - 1][1] >= skinItem.fragment) {
          if (app.globalData.otherInfo.skinState[skinItem.id - 1][0] < 1) {
            app.globalData.otherInfo.skinState[skinItem.id - 1][0] = 1;
          }
        }
      }
      else if (app.globalData.otherInfo.skinState[skinItem.id - 1][0] < 2) {//添加皮肤
        app.globalData.otherInfo.skinState[skinItem.id - 1][0] = 2;
      }
      app.setUserData(app.globalData.openIdKey, consts.TYPE_OTHER, JSON.stringify(app.globalData.otherInfo).toString());
    }
  },

  // 是否为非法groupId
  isIllegalGroupId: function (groupId) {
    return groupId == "12345";
  },

  //关卡通关 startid---需求数据是从数组那个索引开始
  levelPassOpen: function (levelType, levelId, openCnts, startid) {
    var open = openCnts[levelType][levelId];
    var needOver = 0;
    var config = app.globalData.levelOpenConfig[levelType][levelId].openCondition;
    if (!open) {//已经解锁的就不再判断了
      open = app.globalData.baseInfo.levelProgress[levelType][config[startid]] > config[startid + 1];
    }
    return open;
  },

  //分享次数 startid---需求数据是从数组那个索引开始
  shareCntOpen: function (levelType, levelId, openCnts, startid, addOne) {
    var needCnt = app.globalData.levelOpenConfig[levelType][levelId].openCondition[startid];
    var sharedCnts = app.globalData.baseInfo.lvSharedCnt;
    var open = openCnts[levelType][levelId];
    var progress = app.globalData.baseInfo.levelProgress[levelType][levelId];

    if (open) {
      // console.log("关卡分享结束");
      if (((typeof (progress) == 'undefined') || progress < 1) && open) {
        progress = 1;
        app.globalData.baseInfo.levelProgress[levelType][levelId] = progress;
      }
      return openCnts[levelType][levelId];
    }
    if (progress > 1) {
      open = true;
      openCnts[levelType][levelId] = open;
      return open;
    }

    if (sharedCnts == null || (typeof (sharedCnts)) == 'undefined') {
      sharedCnts = [];
    }
    if (sharedCnts[levelType] == null || typeof (sharedCnts[levelType]) == 'undefined') {
      sharedCnts[levelType] = [];
    }
    var cnt = sharedCnts[levelType][levelId];
    if (addOne > 0) {//需要添加1
      if (typeof (cnt) == 'undefined') {
        cnt = addOne;
      } else {
        cnt += addOne;
      }
      sharedCnts[levelType][levelId] = cnt;
      app.globalData.baseInfo.lvSharedCnt = sharedCnts;
    }
    if (typeof (cnt) != 'undefined') {
      if (cnt >= needCnt) {
        open = true;
        app.globalData.baseInfo.openedLvArr = openCnts;
      }
    } else {
      open = false;
    }
    openCnts[levelType][levelId] = open;
    if (((typeof (progress) == 'undefined') || progress < 1) && open) {
      progress = 1;
      app.globalData.baseInfo.levelProgress[levelType][levelId] = progress;
    }
    // if (needUpdate) {
    //   app.setUserData(app.globalData.openIdKey, consts.TYPE_BASE, JSON.stringify(app.globalData.baseInfo).toString());
    // }
    return open;
  },

  //大关卡全部通过时的事件回调
  bigLevelPassCallBack: function (bigOne, littleone, leveltype) {
    var item = new Object();
    item.isOpen = false;
    item.levelType = 0;
    item.biglevel = 1;
    var openA = app.globalData.baseInfo.openedLvArr;
    // for (var i = 0; i < app.globalData.levelOpenConfig.length; i++) 
    {
      var configItem = app.globalData.levelOpenConfig[leveltype];
      for (var j = 0; j < configItem.length; j++) {
        var config = configItem[j];
        if (((config.openType == consts.OPEN_LEVELS || config.openType == consts.OPEN_LEVELS_SHARE) && config.openCondition[0] == bigOne && config.openCondition[1] == littleone)
          || (config.openType == consts.OPEN_SHARE_LEVELS && config.openCondition[1] == bigOne && config.openCondition[2] == littleone)
        ) {//当前关卡是需要通过某关解锁,
          if (openA == null || (typeof (openA)) == 'undefined') {
            openA = [];
          }
          if (openA[leveltype] == null || typeof (openA[leveltype]) == 'undefined') {
            openA[leveltype] = [];
          }
          if (!openA[leveltype][j]) {//只有第一次解锁的时候才有
            openA[leveltype][j] = true;
            app.globalData.baseInfo.openedLvArr = openA;
            app.globalData.sessCheckMax = 0;
            app.setUserData(app.globalData.openIdKey, consts.TYPE_BASE, JSON.stringify(app.globalData.baseInfo).toString());
            item.isOpen = true;
            item.levelType = leveltype;
            item.biglevel = j;
            return item;
          }
        }
      }
    }
    return item;
  },

  //----------------------------------群分享------------------------------------------------

  // 是否为个人
  isPerson: function (shareTickets) {
    return !shareTickets || shareTickets.length == 0;
  },

  getShareInfo: function (shareTicket, callback) {
    wx.getShareInfo({
      shareTicket: shareTicket,
      success: function (res) {
        if (callback) {
          callback(res);
        }
      },
      fail: function (res) {
        console.log("wx.getShareInfo失败");
        console.log(res);
      },
    })
  },

  requestGroupId: function (res, callback) {
    wx.request({
      url: app.getBaseUrl() + 'decrypt',
      data: {
        iv: res.iv,
        encryptedData: res.encryptedData,
        sessionKey: app.globalData.sessionKey,
        gameId: consts.GAMEID,
        littleGameId: consts.GAMEID
      },
      success: function (res) {
        if (callback) {
          callback(res.data.openGId);
        }
      },
      fail: function (res) {
        console.log("requestGroupId失败");
        console.log(res);
      }
    })
  },

  // 是否成功分享到该群，规定每个群每天只有2次分享机会
  shareGroupSuccess: function (groupId) {
    if (app.isIllegalGroupId(groupId)) {
      return true;
    }
    if (this.globalData.baseInfo.shareGroup && this.globalData.baseInfo.shareGroup[groupId] &&
      this.globalData.baseInfo.shareGroup[groupId] >= 1) {
      return false;
    }
    return true;
  },

  // 添加分享群
  addShareGroup: function (groupId) {
    if (!this.globalData.baseInfo.shareGroup) {
      this.globalData.baseInfo.shareGroup = {};
    }
    if (!this.globalData.baseInfo.shareGroup[groupId]) {
      this.globalData.baseInfo.shareGroup[groupId] = 1;
    }
    else {
      this.globalData.baseInfo.shareGroup[groupId]++;
    }
  },

  // 补签是否成功分享到群
  shareBuqianSuccess: function (groupId) {
    if (app.isIllegalGroupId(groupId)) {
      return true;
    }
    if (this.globalData.baseInfo.buqianGroup && this.globalData.baseInfo.buqianGroup[groupId] &&
      this.globalData.baseInfo.buqianGroup[groupId] >= 1) {
      return false;
    }
    return true;
  },

  // 添加补签分享群
  addBuqianGroup: function (groupId) {
    if (!this.globalData.baseInfo.buqianGroup) {
      this.globalData.baseInfo.buqianGroup = {};
    }
    if (!this.globalData.baseInfo.buqianGroup[groupId]) {
      this.globalData.baseInfo.buqianGroup[groupId] = 1;
    }
    else {
      this.globalData.baseInfo.buqianGroup[groupId]++;
    }
  },

  // 群分享限制提示
  showShareLimitToast: function () {
    if (compVer(app.globalData.sdkV, '1.9.0') >= 0) {
      wx.showToast({
        title: "该群当天分享次数已达上限，换个群试试吧！",
        icon: 'none',
        duration: 2000,
      });
    } else {
      wx.showToast({
        title: "今该群分享上限",
        image: './../../Resources/common/suo2.png',
        duration: 2000,
      });
    }
  },

  // 个人分享限制提示
  showPersonLimitToast: function () {
    wx.showToast({
      title: "请分享到群哦",
      image: './../../Resources/common/suo2.png',
      duration: 2000,
    });
  },

  //------------------------------end 群分享--------------------------------------------

  // 获取物品提示
  showGetItemToast: function (itemType, title, num, imageUrl) {
    if (itemType == "fskin") {
      wx.showToast({
        title: title + '+' + num,
        icon: 'none',
        duration: 1000,
        mask: true
      })
    }
    else {
      wx.showToast({
        title: title + '+' + num,
        image: imageUrl,
        duration: 1000,
        mask: true
      })
    }
  },

  encryptedHex: function (data) {
    // console.log(data);
    var encryptedHexStr = CryptoJS.enc.Hex.parse(data);
    var srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    // console.log(srcs);
    var decrypt = CryptoJS.RC4.decrypt(srcs, key);
    console.log(decrypt);
    var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedStr);
  },

  // 全局变量
  globalData: {
    levelType: 0,//关卡类型    
    levelsCnt: 0,//关卡总关数
    levelCntArr: null,//关卡的数量数组

    //数据统计相关
    haventPlayLvs: true,//还没有进入游戏
    musicOn: true,//
    isBonus: false,
    isPublicIn: false, 
    oldPlayerAward: null,
    colorWeak: false,//颜色辨识度低
    comeInTime: null,//进入时时间
   
    gameConfig: null,
    sdkV: "",//微信的系统版本号
    sessCheckMax: 0,

    bonusCfg: null,//奖励配置

    gameCollections: null,//游戏合集,showType:0不展示,1展示合集(点击就直接跳转到合集中),2就是正常的逻辑

    newSpecialOPen: false,//是否有新的特殊关卡开启

    levelOpenConfig: null,//关卡的解锁信息配置
    curDayCoinLeft: 200,
    curDayTipCoinLeft: 200,//今日可以点击提示分享得到的剩余金币
    curDayTiliLeft: 20,
    LeftRecords: null,//每天分享可以得到的剩余的金币和体力
    recordDatas: null,//游戏存档

    friendRankList: null,//好友排行的列表,只有每次登陆的时候更新好友的数据
    selfLevelTime: null,//当前自己的游戏关卡的消耗时间列表

    isTeach: true,//是否教学
    techId: 0,//第几个颜色的引导
    // 玩家信息相关

    screenScale: 1.0,//屏幕适配
    innerNet: false,//内外网的区分
    userInfo: null,//自己的信息

    wxloginCode: null,
    openId: null, // 自己的openId
    sessionKey: null, // 自己的sessionKey
    session: null,//
    openIdKey: null,//自己的OpenId以及对应的gameid串接在一起
    tempFriend: null,//点击分享时拿到的好友的openid
    friendOpenId: null,//好友openID-数组格式

    tiliCost: true,
    //关卡配置文件
    levelAllContent: null,//所有关卡的数据
    levelContent: null,//指定关卡的数据

    // 局内相关
    screenWidth: 375.0,
    screenHeight: 667.0,

    // levelbiglittle: 1,//折算过后的关卡id(大关卡和小关卡数叠加在一起后的)
    baseInfo: null,//自己的一些基本属性(包含以下的属性项)
    levelId: 1,//当前的玩家的关卡id
    biglevel: 0,//大关卡
    sLevelId: 0,//特殊关卡时的小关卡
    sBiglevel: 0,//特殊关卡时的大关卡
    score: 0,//分数
    tili: 30,//体力值
    clickAudio: null,//所有按钮的点击音效,
    
    skinConfig: null,
    date: "", // 当前日期 "年.月.日"
    day: 0, // 当前是星期几,
    dateTime: null, // 当前时间
    dateTimeDetail: "",
    IsCountClick: true,//是否点击，控制广告位显示什么
    adConfig: null,
    clickTimeStart: 0, // 2018-05-18 13:00:00
    clickTimeEnd: 0,// 2018-05-18 13:15:00
    showTimeStart: 0, // 2018-05-19 13:10:00
    showTimeEnd: 0,  // 2018-05-19 13:15:00
    countClick:0,
    countShow:0,
    colorfulLevelConfig: null // 每日多彩关卡配表
  }
})