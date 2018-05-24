//rank.js
var consts = require('./../../utils/consts.js').consts;//const数据
var rankStruct = require('./rankStruct.js').rankS;
var app = getApp();
var that;

Page({
  data: {
    screenWidth: 375.0,
    screenHeight: 667.0,
    curRank: 7,
    url: './../gameover/img/icon.png',
    nickname: "pisipisi",
    score: 200,
    lvs: 200,
    rankTop20: [],
  },

  onShow: function () {
    that.updateRankList();
    that.setData({
      screenWidth: app.globalData.screenWidth,
      screenHeight: app.globalData.screenHeight,
      url: app.globalData.userInfo.avatarUrl,
      nickname: app.globalData.userInfo.nickName,
      score: app.globalData.score,
      lvs: 0,//app.globalData.levelbiglittle,
    });
  },

  onLoad: function () {
    that = this;   
    that.updateRankList();
    that.setData({
      screenWidth: app.globalData.screenWidth,
      screenHeight: app.globalData.screenHeight,
      url: app.globalData.userInfo.avatarUrl,
      nickname: app.globalData.userInfo.nickName,
      score: app.globalData.score,
      lvs:0,// app.globalData.levelbiglittle,
    });
  },

  updateRankList: function () {
    var list =[];
    if (app.globalData.friendRankList == null) {
      app.globalData.friendRankList =[];
    }
    //好友列表排序
    //每次排序时先把自己的分数和关卡更新下
    var ata = JSON.parse(app.globalData.friendRankList[0].values[0].data);
    ata.score = app.globalData.score;
    // ata.levelbiglittle = app.globalData.levelbiglittle;
    app.globalData.friendRankList[0].values[0].data = JSON.stringify(ata);
    app.globalData.friendRankList.sort(function (a, b) {
      if (a.values[0].data.score < b.values[0].data.score) {
        return 1;
      } else if (a.values[0].data.score > b.values[0].data.score) {
        return -1;
      }
      return 0;
    });

    var myRank = 0;
    for (var i = 0; i < app.globalData.friendRankList.length; i++) {
      var item = new rankStruct();
      var wxinfo = JSON.parse( app.globalData.friendRankList[i].values[1].data);
      var baseinfo = JSON.parse(app.globalData.friendRankList[i].values[0].data);
      if (app.globalData.openIdKey == app.globalData.friendRankList[i].key){
        myRank = (i+1);
      }
      item.setRankData(
        (i+1),
        wxinfo.avatarUrl,wxinfo.nickName,
        baseinfo.score, 0//baseinfo.levelbiglittle
        );
      list[i]=(item);
    }

    if (app.globalData.friendRankList.length>0){
      that.setData({
        curRank: myRank,
        rankTop20: list,
      });
    }
  },



  clickGroupRank: function (e) {
    utilLog("群排名");
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var tips = app.globalData.gameConfig.challengeTitle;
    var random = Math.floor(Math.random() * tips.length);
    return {
      title: tips[random],
      path: '/pages/loading/loading?openId=' + app.globalData.openId + '&gameId=' + consts.GAMEID,

      success(res) {
        utilLog("转发成功.....");
      },
      fail(res) {
      }
    }
  }

})
