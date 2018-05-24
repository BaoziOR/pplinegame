//moregame.js
var consts = require('./../../utils/consts.js').consts;//const数据
var utilLog = require('./../../utils/util.js').log;//log

var app = getApp();
var linkGames = null;
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gameLinks: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    that = this;
    if (linkGames == null) {
      var datas = app.globalData.gameCollections.games;
      for (var i = 0; i < datas.length; i++) {
        if (datas[i].gameid === consts.GAMEID) {
          datas.splice(i, 1);//for循环使用splice注意下标点
          break;
        }
      }
      linkGames = datas;
      if (linkGames != null) {
        that.setData({
          gameLinks: linkGames,
        });
      }
    }
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
    if (linkGames != null) {
      that.setData({
        gameLinks: linkGames,
      });
    }
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


  //小程序之间跳转
  clicktoGame: function (ops) {

    var id = ops.target.dataset.id;
    if (id != null) {
      if (linkGames[id].path.length < 1) {
        wx.navigateToMiniProgram({
          appId: linkGames[id].appid,
          envVersion: 'trial',
          success(res) {
            // 打开成功
            console.log("成功分享");
          }
        })
      } else {
        wx.navigateToMiniProgram({
          appId: linkGames[id].appid,
          path: linkGames[id].path,
          envVersion: 'trial',
          success(res) {
            // 打开成功
            console.log("成功分享");
          }
        })
      }
    }
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
    var tips = app.globalData.gameConfig.challengeTitle;
    var random = Math.floor(Math.random() * tips.length);
    return {
      title: tips[random],
      path: '/pages/loading/loading?openId=' + app.globalData.openId + '&gameId=' + consts.GAMEID + '&imgId=更多好玩',

      success(res) {
        utilLog("转发成功.....");
      },
      fail(res) {
      }
    }
  }
})