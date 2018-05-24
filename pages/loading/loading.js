//loading.js
var util = require('./../../utils/util.js');
var utilLog = require('./../../utils/util.js').log;//log
var consts = require('./../../utils/consts.js').consts;//const数据
var jsonf = require('./../../data/levelf.js').levelf;//关卡数据
var jsons = require('./../../data/levels.js').levels;//关卡数据
var json3 = require('./../../data/level3.js').levels;//关卡数据
var jsonSp = require('./../../data/levelSpecial.js').sLevel;//关卡数据
var config = require('./../../data/config.js').config;//配置数据
var openConf = require('./../../data/config.js').openConfig;//配置解锁数据
var bonusCfg = require('./../../data/config.js').bonusConfig;//奖励关卡数据
var skinConfig = require('./../../data/config.js').skinConfig;//皮肤配置数据
var colorfulLevelConfig = require('./../../data/config.js').colorfulLevelConfig;//多彩关卡配置表

var adConfig = require('./../../data/config.js').adConfig;//广告位配置
var app = getApp();
var that;
var isFirstComplate = false;

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
    that = this;
    isFirstComplate = false;

    app.globalData.tempFriend = null;// tempFriend = "obtdn5GkglAiT0LxjoTps8vrWVF4"
    //如果入口是别人分享出来的话,就可以拿到别人的openid,加入到自己的好友列表中
    if (options.openId != null) {
      //当前的好友列表
      app.globalData.tempFriend = options.openId;
      // console.log("好友id:" + app.globalData.tempFriend);
      if (app.globalData.friendOpenId == null) {
        app.globalData.friendOpenId = [];
      }
    }
    if (options.imgId != null) {
      //什么分享图加入游戏
      app.tdsdk.event({
        id: 'which_share_join',
        label: '什么分享图加入游戏',
        params: {
          which_share_join: options.imgId
        }
      });
    }
    
    that.initConfigs();
    that.getOpenID();
  },

  // 初始化静态配置表
  initConfigs:function(){
    app.globalData.bonusCfg = JSON.parse(bonusCfg);
    app.globalData.gameConfig = JSON.parse(config); 
    app.globalData.skinConfig = JSON.parse(skinConfig);
    app.globalData.levelOpenConfig = JSON.parse(openConf);
    // app.globalData.colorfulLevelConfig = JSON.parse(colorfulLevelConfig);
  },

  // 初始化广告
  initAD:function(){
    app.globalData.adConfig = JSON.parse(adConfig);
    // app.globalData.otherInfo.adContent=null;
    if(app.globalData.otherInfo.adContent==null){
      // console.log("qqww",app.globalData.adConfig)
      app.globalData.otherInfo.adContent=app.globalData.adConfig;
      app.globalData.sessCheckMax = 0;
      app.setUserData(app.globalData.openIdKey, consts.TYPE_OTHER, JSON.stringify(app.globalData.otherInfo).toString());
      // console.log("init ad",app.globalData.otherInfo);
    }
  },
  
  // 初始化关卡列表
  initLevels:function(){
    app.globalData.levelCnt = 0;
    app.globalData.levelAllContent = [];
    var levelF = JSON.parse(jsonf);
    var levelS = JSON.parse(jsons);
    var level3 = JSON.parse(json3);
    var levelSpecial = JSON.parse(jsonSp);

    app.globalData.levelAllContent[0] = levelF;
    for (var i = 0; i < levelS.length; i++) {
      app.globalData.levelAllContent[0].push(levelS[i]);
    }
    for (var i = 0; i < level3.length; i++) {
      app.globalData.levelAllContent[0].push(level3[i]);
    }
    app.globalData.levelAllContent[1] = levelSpecial;
    // 加入每日多彩包
    //this.setColorfulLevels();
    for (var i = 0; i < app.globalData.levelAllContent.length; i++) {
      if (app.globalData.levelCntArr == null) {
        app.globalData.levelCntArr = [];
      }
      if (app.globalData.levelCntArr[i] == null || typeof (app.globalData.levelCntArr[i]) == 'undefined') {
        app.globalData.levelCntArr[i] = [];
      }
      for (var j = 0; j < app.globalData.levelAllContent[i].length; j++) {
        if (i == consts.LEVELTYPE_NORMAL) {
          app.globalData.levelCntArr[i][j] = app.globalData.levelAllContent[i][j].levelnum;
        }
        else {
          var m = 0;
          app.globalData.levelCntArr[i][j] = 0;
          while (m < app.globalData.levelAllContent[i][j].c.length) {
            app.globalData.levelCntArr[i][j] += app.globalData.levelAllContent[i][j].c[m].levelnum;
            m++;
          }
        }
        app.globalData.levelCnt += app.globalData.levelCntArr[i][j];
      }
    }
  },

  // 设置每日多彩包
  setColorfulLevels:function(){    
    // 用不到的数组全部置空
    for (var i = 2; i <= consts.LEVELTYPE_COLORFULLEVEL; i++) {
      app.globalData.levelAllContent[i] = [];
    }
    var selectedLevel = new Array();
    for(var num=0;num<app.globalData.colorfulLevelConfig.levelList.length;num++)
    {
      var level = {
        s: num,
        c: new Array()
      };
      var randomLevelConfig = app.globalData.colorfulLevelConfig.levelList[num].randomLevel;
      for (var i = 0; i < randomLevelConfig.length; i++) {
        var bigLevelArray = new Array();
        var bls = randomLevelConfig[i].split(',');
        for(var j=0;j<bls.length;j++)
        {
          if(bls[j].indexOf('-') == -1)
          {
            bigLevelArray.push(bls[j]);
          }
          else
          {
            var blsSpit = bls[j].split('-');
            var start = blsSpit[0];
            var end = blsSpit[1];
            for(var n=start;n<=end;n++)
            {
              bigLevelArray.push(n.toString());
            }
          }
        }
        var levelJson = this.getRandomColorfulLevel(selectedLevel, bigLevelArray);
        var levelItem = app.globalData.levelAllContent[0][levelJson.bigLevel].levels[levelJson.level];
        var levelName = levelItem.s[0] + "_" + levelItem.s[1];
        // console.log(levelJson);
        var findArray = false;
        for (var j = 0; j < level.c.length; j++) {
          if (level.c[j].levelname == levelName) {
            // console.log("cat", "" + Object.keys(level.c[j].levels).length,level.c[j].levels);
            level.c[j].levels["" + (Object.keys(level.c[j].levels).length+1)] = levelItem;
            level.c[j].levelnum++;
            findArray = true;
            break;
          }
        }
        if (!findArray) {
          var levelArray = {};
          levelArray["1"] = levelItem;
          level.c.push({
            biglevel: level.c.length,
            levelnum: 1,
            levelname: levelName,
            levels: levelArray
          });
        }
      }
      app.globalData.levelAllContent[10].push(level);
    }
    // console.log(app.globalData.levelAllContent);
  },

  // 选取随机关卡（不能重复）
  getRandomColorfulLevel:function(selectedLevel,bigLevelArray){
    // console.log("getRandomColorfulLevel");
    var bigLevel = bigLevelArray[Math.floor(util.SeedRandom() * bigLevelArray.length)];
    var level = Math.floor(util.SeedRandom() * app.globalData.levelAllContent[0][bigLevel].levelnum) + 1;
    var levelJson = {
      bigLevel: bigLevel,
      level: level
    };
    if (util.ArrayContainsJson(selectedLevel,levelJson))
    {
      // console.log("已包含",levelJson);
      return this.getRandomColorfulLevel(selectedLevel,bigLevelArray);
    }
    selectedLevel.push(levelJson);
    return levelJson;
  },

  // 更新本地存档
  initLocalRecords:function(){
    var left = wx.getStorageSync(consts.RECORD_COINLEFT);
    app.globalData.curDayCoinLeft = app.globalData.gameConfig.maxCoinPerDay;
    app.globalData.curDayTipCoinLeft = app.globalData.gameConfig.maxCoinTipPerDay;
    if (left != null && left.length > 2) {
      var date = new Date();
      var key = date.getFullYear() + "_" + date.getMonth() + "_" + date.getDate();
      var keyTili = key + "_tili";
      var keytip = key + "_tips";
      app.globalData.LeftRecords = JSON.parse(left);
      if (app.globalData.LeftRecords != null) {
        if (typeof (app.globalData.LeftRecords[key]) != 'undefined') {
          app.globalData.curDayCoinLeft = app.globalData.LeftRecords[key];//更新每日还能分享得到的金币数
        }
        if (typeof (app.globalData.LeftRecords[keytip]) != 'undefined') {
          app.globalData.curDayTipCoinLeft = app.globalData.LeftRecords[keytip];//更新每日还能点击提示分享得到的金币数
        }
        if (typeof (app.globalData.LeftRecords[keyTili]) != 'undefined') {
          app.globalData.curDayTiliLeft = app.globalData.LeftRecords[keyTili];//更新每日还能分享得到的体力数
        }
      }
    } else {
      app.globalData.LeftRecords = new Object();
    }
  },

  // 获取用户的OpenId
  getOpenID: function () {
    wx.login({
      success: res => {
        //调用接口
        wx.reportAnalytics('user_openid', {
          state: 1,
        });
        wx.request({//登陆
          url: app.getBaseUrl() + 'openid?code=' + res.code + '&gameId=' + consts.GAMEID ,
          //code传给后台拿到openid
          success: function (resss) {
            // console.log("注册openid",resss);
            app.globalData.openId =
            resss.data.openid;//拿到自己的openid
            //"obtdn5GuDkG_qKrBHA524BuTWsjI";//晓波老婆账号
              // "obtdn5KnXHXFuGIbu8gY7km3L9TU";
            app.globalData.sessionKey = resss.data.session_key;
            app.globalData.session = resss.data.session;
            app.globalData.openIdKey = app.globalData.openId + "_1";//做为玩家存储数据的key            
            //获取玩家的所有数据
            app.getUserAllData((app.globalData.openIdKey), that.initUserData);
          },
          fail:function(){
            //调用接口
            wx.reportAnalytics('user_openid', {
              state: 0,
            });
          }
        });
      },
    })
  },

  //初始化玩家信息
  initUserData: function (key, datas) {
    utilLog("玩家所有数据回调",datas);
    if(  datas  ){
      if (datas.wxInfo && datas.wxInfo.length > 4) {
        utilLog("wxinfo回调");
        that.wxInfocallBack(key, consts.TYPE_WX, datas.wxInfo);
      } else {
        that.wxInfocallBack(key, consts.TYPE_WX, null);
      }
      if (datas.baseInfo) {
        utilLog ("baseInfo回调", datas.baseInfo);
        that.baseInfoCallBack(key, consts.TYPE_BASE, datas.baseInfo);
        if (!app.globalData.baseInfo.hasOwnProperty("appVers")){
          app.globalData.baseInfo.appVers = 34;//这批版本的前一批版本号,          
        }
      } else {
        app.globalDataToZero();
      }
      if (datas.timeCostInfo && datas.timeCostInfo.length > 0) {
        utilLog("timeCostInfo回调");
        that.timeCostInfoCallback(key, consts.TYPE_TIMECOST, datas.timeCostInfo);
      }
      if (datas.friInfo || app.globalData.tempFriend != null) {
        utilLog("friInfo回调", datas.friInfo);
        var needUpdate = false;
        if (app.globalData.tempFriend != app.globalData.openId) {
          var info;
          if (typeof (datas.friInfo) == "undefined") {
            info = [];
            info[0] = app.globalData.tempFriend;
            datas.friInfo = JSON.stringify(info).toString();
            needUpdate = true;
          } else {
            info = JSON.parse(datas.friInfo);
            if (info.indexOf(app.globalData.tempFriend) < 0) {//该id不重复存在
              info.push(app.globalData.tempFriend);
              datas.friInfo = JSON.stringify(info).toString();
              needUpdate = true;
            }
          }
          //将我也添加到对方的好友列表中
          if (app.globalData.tempFriend != null) {
            app.addUserData(app.globalData.tempFriend + "_" + consts.GAMEID, consts.TYPE_FRIENDS, app.globalData.openId, false);
          }
        }
        that.friendInfoCallBack(key, consts.TYPE_FRIENDS, datas.friInfo, needUpdate);
      }

      // 其他数据是否 皮肤啥的都存在这里
      if (datas.otherInfo){
        app.globalData.otherInfo = JSON.parse(datas.otherInfo);
        if (app.globalData.otherInfo.hasOwnProperty("colorWeak")) {
          app.globalData.colorWeak = app.globalData.otherInfo.colorWeak;
        }
      }else{
        app.globalData.otherInfo = { "curSkin": 0, "skinState": { "0": [3, 0], "1": [2, 0] } };
        app.globalData.otherInfo.colorWeak = false;
        app.globalData.sessCheckMax = 0;
        app.setUserData(key, consts.TYPE_OTHER, JSON.stringify(app.globalData.otherInfo).toString());
      }
      app.globalData.otherInfo.adContent=null;
      if(app.globalData.otherInfo.adContent==null){
        app.globalData.otherInfo.adContent=app.globalData.adConfig;
        app.globalData.sessCheckMax = 0;
        app.setUserData(key, consts.TYPE_OTHER, JSON.stringify(app.globalData.otherInfo).toString());
      }
    }
    else {
      wx.clearStorageSync(consts.RECORD_FRIEND);
      wx.clearStorageSync(consts.RECORD_RECORDS);
      wx.clearStorageSync(consts.RECORD_COINLEFT);
      that.wxInfocallBack(key, consts.TYPE_WX, null);
      app.globalDataToZero();//没有存档时,关卡的相关数据清零
      
      ///test v33版本之后注意新用户是看不到我们新增的几个关卡的新的标志
      app.globalData.baseInfo.isBigV33 = true;//是否是大于33版本号
      app.globalData.baseInfo.appVers = consts.VERSION;//这批版本的版本号,这批新增了四个大关卡包
      app.globalData.sessCheckMax = 0;
      app.setUserData(key, consts.TYPE_BASE, JSON.stringify(app.globalData.baseInfo).toString());
    }
    app.getServerTime(this.getServerTimeSuccess);
  },

  formatDateTime:function (inputTime) {    
    var date = new Date(inputTime);  
    var y = date.getFullYear();    
    var m = date.getMonth() + 1;    
    m = m < 10 ? ('0' + m) : m;    
    var d = date.getDate();    
    d = d < 10 ? ('0' + d) : d;    
    var h = date.getHours();  
    h = h < 10 ? ('0' + h) : h;  
    var minute = date.getMinutes();  
    var second = date.getSeconds();  
    minute = minute < 10 ? ('0' + minute) : minute;    
    second = second < 10 ? ('0' + second) : second;   
    return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;    
  },

  // 得到当前服务器时间
  getServerTimeSuccess: function (timeLong) {
    // console.log(JSON.stringify(app.globalData.baseInfo));
    var dateTime = new Date(timeLong * 1000);
    // 测试
    // dateTime = new Date();
    var date = dateTime.getFullYear() + "." + (dateTime.getMonth() + 1) + "." + dateTime.getDate();
   // app.globalData.dateTimeDetail=date+"-"+dateTime.getHours()+":"+dateTime.getMinutes()+":"+dateTime.getSeconds();
   app.globalData.dateTimeDetails=this.formatDateTime(timeLong*1000);
   app.globalData.dateTimeDetail=timeLong*1000
  //  console.log(app.globalData.dateTimeDetails,"loadingshijian ");
    var day = dateTime.getDay();
    if (day == 0) {
      day = 7;
    }

    // 计算当前时间
    app.globalData.date = date;
    app.globalData.day = day;
    app.globalData.dateTime = dateTime;
    // console.log("当前日期 " + date + " 星期:" + day);

    // 计算本周日时间
    var sundayDate = app.getSundayTime(dateTime, day);
    // console.log("本周日日期 " + sundayDate);

    if (app.globalData.baseInfo.loginTime && app.globalData.baseInfo.loginTime != date) {
      // 重置每天需要重置的数据
      app.globalData.baseInfo.signinFlag = 1;
      app.globalData.baseInfo.shareGroup = {};
      app.globalData.baseInfo.buqianGroup = {};
      app.globalData.baseInfo.levelProgress[consts.LEVELTYPE_COLORFULLEVEL] = null;
      app.globalData.baseInfo.lvSharedCnt[consts.LEVELTYPE_COLORFULLEVEL] = null;
      app.globalData.baseInfo.openedLvArr[consts.LEVELTYPE_COLORFULLEVEL] = null;
      console.log("reset daily datas...");

      // 每到新的一周，清空签到数据
      if (app.getSundayTimeByDate(app.globalData.baseInfo.loginTime) != sundayDate) {
        console.log("reset week datas...");
        app.globalData.baseInfo.loginNew = {};
      }
    }
    app.setLoginTime(date);
    // 计算随机种子
    Math.seed = parseInt((dateTime.getFullYear().toString()  + (dateTime.getMonth() + 1).toString()  + dateTime.getDate().toString()).substring(2));

    this.initLevels();
    this.initLocalRecords();
    this.initAD();

    wx.redirectTo({
        url: '../../package_game/index/index',
    })
  },
  
  //微信相关数据回调
  wxInfocallBack: function (key, field, datas) {
    if (datas != null)
    {
      var datass = JSON.parse(datas);
      // console.log("用户信息before:", app.globalData.userInfo);
      if (app.globalData.userInfo ==null){
        app.globalData.userInfo = datass;
      }
      else if (app.globalData.userInfo.hasOwnProperty("avatarUrl")){
        datass.avatarUrl = app.globalData.userInfo.avatarUrl;
      }
      console.log("用户信息:", datass);
    } else {
      //玩家的信息数据长度不足时重新拉取
      {
        wx.getUserInfo({
          success: res => {
            console.log("重新获取用户信息",res);
            app.globalData.userInfo = res.userInfo;
            app.globalData.sessCheckMax = 0;
            app.setUserData(key, field, JSON.stringify(app.globalData.userInfo).toString());
          }
        });
      }
    }
  },

  //基本信息服务器上拉取更新回调
  baseInfoCallBack: function (key, field, datas) {
    utilLog ("基本信息",datas);
    utilLog(datas);  
    var datass = JSON.parse(datas);
    if (datass == null) {
      datass = new Object();
      datass.levelId = app.globalData.levelId;
      datass.biglevel = app.globalData.biglevel;
    }
    //模拟之前的用户数据,做存档兼容
    // if(datass.levelProgress!=null){
    //   datass.levelProgress = null;
    // }

    var isneedUpdate = false;
    if (typeof (datass.coinNum) == 'undefined') {
      isneedUpdate = true;
      datass.coinNum = app.globalData.gameConfig.reginalCoin;
    }
    // datass.coinNum = 1000000000000;
    // datass.coinNum = 100;
    /////////////test////////////////
    if (datass.levelProgress != null) {
      // datass.levelProgress[0][0] = 44;
      // datass.levelProgress[0][20] = 10;
      // datass.levelProgress[0][19] = 60;
      // datass.levelProgress[0][1] = 51;
      // datass.levelProgress[0][2] = 51;
      // datass.levelProgress[0][26] = -1;
      // datass.lvSharedCnt[0][26] = 0;
      // datass.openedLvArr[0][26] = false;
      // datass.levelProgress[10] = null;
    }
    /////////////////////////////////

    app.globalData.levelId = datass.levelId;
    app.globalData.biglevel = datass.biglevel;
    app.globalData.score = datass.biglevel * 100 + datass.levelId * 10;
    utilLog("更新数据");
    utilLog("levelid:" + app.globalData.levelId);
    var lls = 0;
    if (typeof (datass.levelProgress) == 'undefined' || datass.levelProgress == null) {
      datass.levelProgress = [];
      isneedUpdate = true;
    }
    if (datass.levelProgress[app.globalData.levelType] == null || (typeof (datass.levelProgress[app.globalData.levelType])) == 'undefined') {
      datass.levelProgress[app.globalData.levelType] = [];
    }
    app.globalData.baseInfo = null;
    app.globalData.baseInfo = datass;
    // console.log("关卡进度",datass.levelProgress);
    /////////////bonus奖励./////////////////下周一版本打开
    // var awardpro = datass.awardpro;
    // if (awardpro == null || typeof (awardpro) == 'undefined') {
    //   awardpro = [];
    // }
    // var cfg_ = {};
    // for (var i = app.globalData.bonusCfg.length - 1; i >= 0; i--) {
    //   var bonus = app.globalData.bonusCfg[i];
    //   if (datass.levelProgress[bonus.lvtype] == null || (typeof (datass.levelProgress[bonus.lvtype])) == 'undefined') {
    //     datass.levelProgress[bonus.lvtype] = [];
    //   }
    //   if (datass.levelProgress[bonus.lvtype][bonus.biglvid - 1] >= bonus.lvid) {
    //     if (awardpro[bonus.id - 1] == null || awardpro[bonus.id-1] < 1)  
    //       {
    //       // console.log("领取奖励 : " + bonus.lvtype + "_" + bonus.biglvid + "_" + bonus.lvid);
    //       if (app.globalData.oldPlayerAward == null) {
    //         app.globalData.oldPlayerAward = [];
    //       }
    //       app.globalData.oldPlayerAward.push(bonus);
    //       isneedUpdate = true;
    //     }
    //     app.globalData.bonusCfg.splice(i, 1);
    //   }
    //   cfg_[(bonus.lvtype + "_" + (bonus.biglvid - 1) + "_" + bonus.lvid)] = bonus;
    // }
    // app.globalData.bonusCfg =null;
    // app.globalData.bonusCfg= cfg_;
    // datass.awardpro = awardpro;
    ////////////////////////////////////////

    if (app.globalData.baseInfo.hasOwnProperty("musicByte")) {
      app.globalData.musicOn = app.globalData.baseInfo.musicByte;
    }
    if (isneedUpdate){// || !isChangedRecord) {
      //如果当前服务器上没有初始的体力和金币数的存档,那么给一个默认的初始数值,再发回服务器更新
      app.globalData.sessCheckMax = 0;
      app.setUserData(app.globalData.openIdKey, consts.TYPE_BASE, JSON.stringify(app.globalData.baseInfo).toString());
    }
  },

  //好友信息回调
  friendInfoCallBack: function (key, field, datas, needUpdate) {
    // console.log("好友信息",datas);
    if (datas) {
      var datass = JSON.parse(datas);
      var index = datass.indexOf(app.globalData.openId);
      if (index >= 0) {
        datass.splice(index, 1);
        needUpdate = true;
      }
      var arr = [];
      for (var i = 0; i < datass.length; i++) {
        if (datass[i] != null && arr.indexOf(datass[i]) < 0) {
          arr.push(datass[i]);
        }
      }
      if (arr.length != datass.length) {
        datass = arr;
        needUpdate = true;
      }
      if (needUpdate) {
        app.globalData.sessCheckMax = 0;
        app.setUserData(key, field, JSON.stringify(datass).toString());
      }
      app.globalData.friendOpenId = datass;      
      app.getAllFriendsRankList();
    }
  },

  //
  timeCostInfoCallback: function (key, field, datas) {
    utilLog("关卡时间消耗信息");
    // utilLog(datas);
    if (datas) {
      var datass = JSON.parse(datas);
      app.globalData.selfLevelTime = datass;
    }
  },

})