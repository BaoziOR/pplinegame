var consts = require('./../../utils/consts.js').consts;//const数据
var utilLog = require('./../../utils/util.js').log;//log
var colorConflict = require("./dataStruct.js").conflictReset;
var rankStruct = require('./../rank/rankStruct.js').rankS;
var commonDraw = require('./../../utils/commonDraw.js').chessDraw;//棋盘绘制
var compVer = require('./../../utils/util.js').compVersion;//比较版本号
var chess_C;

//index.js
var app = getApp();
var audioCtx;
//记录原先的点,在touchmove时判断当前点和这个是否重复,重复的时候不做逻辑
var techStep = 0;//教学时小手指的移动步数
var techTimer = null;//循环控制器
var notShareBack = true;//不是从分享状态返回
var updatingOverData = true;//当前是否在更新结束时的关卡id,在的时候不给返回和下一关

//////////提示相关///////////
var answer = null;//游戏的提示答案===教学引导的数组数据
var answerColorList = [];//当前已经用过提示的颜色列表
var equalAnserList = [];//路线与标准答案一直的颜色列表
////////////////////////////

var prePosX = -1;
var prePosY = -1;

var timeStart;//该局开始时的时间点
var timeStandard = 10000;//标准线10s完成一局
var lastStepColor = -1;
var costStep = 0;//每局游戏胜利时消耗的步数

//获取应用实例
const LIMIT = 20;//限定的触摸移动的频率
let prev = 0;
var contextbg = null;
var context = null;
var ctxCircle = null;
var drawLineAgain = true;

var that;//this
var curColor;//当前选中块的颜色
var chessSize = 8;//当前棋盘是8*8个格子----难度越大,格子越多(都是方形棋盘)
var chessSizeH = 8;//棋盘高度
var chess = [];//整个棋盘的二维数组数据_数组有chessSize个item项

var colorQueue = [];//每种颜色的路径数组有chessSize个item项
var colorQueueGrid = [];//绘制连线的格子填充
var curColorConflict = [];//当前冲突的颜色值id
var point = [];//当前给定的几个颜色块(起点终点为一组)  
var colorRandom = 0;
var pointColor = [
  '#8b7ce6', '#95d130', '#78bff6', '#ffca3c', '#f2506e',
  '#ef7150', '#894abf', '#ff7ca4', '#65ccbb', '#69d469',
  '#2b91d9', '#d4558d',
  '#42954a', '#3a457c', '#61457a', '#ba7232', '#9b9b9b',
];
var isTouchDown = false;//绘制手指按下时的圆
var touchX;//手指触摸点X
var touchY;//手指触摸点Y
var boardSize = 336;//棋盘的总宽高
const posDeltaStartX = 33.6;
var deltaStartX = 33.6;
var deltaStartY = 4;
var startX = 33.6;
var startY = 33.6;
var offStartX = 21;//绘制线偏移位置
var offStartY = 21;
var offPointX = 5;//绘制点偏移位置
var offPointY = 5;
var offRextX = 0.2;
var offRextY = 0.2;
var imgWidth = 42;
var imgHeight = 42;
var radis = 21;
var lineWidth = 14;//线条连线的粗细-整个宽度的三分之一
var startLine = false;//当前是否开始线段的绘制
var isWin = false;//当前局是否胜利
var timer;//循环控制器
var screenScale = 1;//屏幕适配
var startRollBack = false;//判断当前交叉颜色线条不想交时是否回滚原先的线条数据
//  var startJudge=false;//是否开始判断成功与否

var colorLeftArr;//剩余格子没有被填满时的坐标数据
var leftColorTimer;//时间间隔器

var nextOpenInfo;//解锁的下一个大关的信息
var curLvSkin = 0;//当前皮肤
var localCountClick = 0;

Page({
  data: {
    screenWidth: 375.0,
    screenHeight: 667.0,
    canvasHeight: 672,
    isMusicOn: true,//音乐
    isBonus: false,
    bonusAward: null,
    bonusAwardUrl: ['./../../Resources/common/jinbi.png', './../../Resources/common/teshuhuobi.png', './../../Resources/common/suipian.png'],

    levelId: 1,
    biglevel: 0,
    biglevelName: null,
    costStep: 0,//当前走的步数
    tili: 5,
    coins: 200,
    diams: 0,//钻石数
    tipCost: 50,
    tipCostType: 1,//提示的消耗品类型1-金币, 2-体力 待定
    bottomGap: 156,//有些机型的适配问题_miller的就差很多,所以往上调一调

    lvName: "高塔模式X",
    newLvName: '常规1卡包(0/50)',//新开启的大关卡包以及他的进度
    needShareCnt: '0/5',//解锁某一个大关卡时需要分享多少次

    isGameOver: false,//游戏是否结束弹出结束框
    shareRegard: 0,//炫耀后可以得到的奖励数
    // 弹出框信息
    useTime: 30,//秒--暂时改用步数
    useTimeMinute: 0,//分
    overRide: 90,//超过了全国多少%的全家
    dialogTitle: '过关',//弹出框的标题
    isFirstPass: false,//是否第一次通过该关
    isLessStep: true,// false,
    isLevelClear: false,//是否该类型关卡通关
    isNewTypeOpen: true,//是否有新关卡开启
    specialIcon: './../../Resources/common/awardN.png',//通关时的奖章图表,或者开启新关卡时的提示图标
    nextLeveltitle: '新手2',//下一个解锁关卡的提示语
    isShare: 'unhidden',//是否出现完美成就
    noShare: 'hidden',//是否出现完美成就
    nickName: "RENOx",
    myRankId: -1,
    curRankItems: [],
    perfectCnt: 0,
    perfectMax: 5,
    perfectLevelCnt: 15,//获得了多少次的完美通关
    perfectIndex: 3,//第几个奖杯
    continueType: consts.OPEN_NULL,//解锁下一个大关卡的时候的解锁类型
    bestTxtColor: ['#2b7a72', '#5c8aa5', '#a16b1c', '#816ac6'],
    awardPic: './img/award4.png',

    tiliRecoverTime: [1, 0, 0],
    showReset: "unhidden",//显示重置游戏的按钮
    errorTip: "hidden",//当前是否弹出错误提示
    tipStr: "请将线走满空格",
    showErrorBox: false, // 是否弹出将线走满空格弹框

    showDialog: false,
    pauseCanvas: false,
    alpha: 0.4,
    prop: '体力',
    dialogId: 0,
    shareOrNot: "share",
    iconProp: "./../../Resources/common/jinbi.png",
    maxProp: 20,
    leftProp: 0,
    countClick:true,
    messageBox: null, // 提示框
    isColorfulLevel: false, // 是否为每日多彩关卡
    currentColorfulPackage: 0, // 当前完成多少包
    totalColorfulPackage: 10, // 目标多少包
    colorfulRewardCount: 0,  // 当前奖励数量
    getColorfulPackage: false // 是否领取多彩包大奖
  },

  onLoad: function (e) {
    if (wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true
      })
    }
    that = this;
    notShareBack = true;
    timeStandard = app.globalData.gameConfig.standardTime;
    if (compVer(app.globalData.sdkV, "1.6.0") >= 0) {
      that.audioCtx = wx.createInnerAudioContext();
      that.audioCtx.autoplay = true;
      that.audioCtx.obeyMuteSwitch = false;
      // that.audioCtx.onPlay(() => {
      // });
      that.audioCtx.onError((res) => {
        utilLog(res.errMsg);
        utilLog(res.errCode);
      });
    }
    wx.getSystemInfo({
      success: function (res) {
        screenScale = (res.windowWidth) / that.data.screenWidth;
        boardSize = 336 * screenScale;
        var bottom = that.data.bottomGap;
        if (res.screenHeight > 600) {
          bottom = 0;
        }
        var nick = "nemo";
        if (app.globalData.userInfo != null)
          nick = app.globalData.userInfo;
        that.setData({
          bottomGap: bottom,
          screenWidth: app.globalData.screenWidth,
          screenHeight: app.globalData.screenHeight,
          biglevel: app.globalData.biglevel + 1,
          levelId: app.globalData.levelId,
          nickName: nick,
          isMusicOn: app.globalData.musicOn,
          shareRegard: app.globalData.gameConfig.shareReward,//炫耀一次得到的金币数量
        });
        // utilLog("屏幕宽高:" + that.data.screenWidth + " " + that.data.screenHeight + "适配缩放:" + res.pixelRatio + "宽高比:" + screenScale);
        that.resetWidthHeight(boardSize);
      }
    });


    that.setData({
      tili: app.globalData.tili,
      isColorfulLevel: app.globalData.levelType == consts.LEVELTYPE_COLORFULLEVEL
    });
  },

  //更新界面中的显示数据
  updatePageData: function () {
    // utilLog("体力" + app.globalData.tili );
    that.setData({
      tili: app.globalData.tili,
    });
  },

  onShow: function (e) {
    that.checkIsCanvasNull();
    drawLineAgain = true;
    that.drawAll();
    // 广告位展
    //点击次数
    app.getAds();
    app.getServerTime(this.getServerTimeSuccess);
    // console.log(app.globalData.dateTimeDetail,"服务时间")
    // console.log(wx.getStorageSync('localCountClick'),"本地点击")
    if(wx.getStorageSync('localCountClick')!= 1){
      if (app.globalData.clickTimeStart<=app.globalData.dateTimeDetail&&app.globalData.dateTimeDetail<app.globalData.clickTimeEnd){
        app.getIncrbyClick(app.globalData.openIdKey, 'ad1',function(){
          that.setData({
            countClick: app.globalData.IsCountClick
          });
         });
      if(localCountClick==0){
        app.globalData.IsCountClick=true; 
      }
      if(wx.getStorageSync('localCountClick')==1){
        app.globalData.IsCountClick=true; 
        that.setData({
          countClick: app.globalData.IsCountClick
        });
       
      }
    } 
    }else if(wx.getStorageSync('localCountShow')!= 1){
       if (app.globalData.showTimeStart<= app.globalData.dateTimeDetail&&  app.globalData.dateTimeDetail< app.globalData.showTimeEnd){
        app.tdsdk.event({
          id: 'ppline_ad_showSelf',
          label: '游戏中微信广告位内部展示统计',
          params: {
            // type: app.globalData.levelType
          }
        });
         app.getShowAd(app.globalData.openIdKey, 'ad1');
         var localCountShow=0; 
        if(localCountShow==0){
           app.globalData.IsCountClick=false; 
           that.setData({
            countClick: app.globalData.IsCountClick
           });
           app.setShowData(app.globalData.openIdKey, 'ad1', app.globalData.otherInfo.adContent.data.ad1.countShow+1)
           console.log(app.globalData.otherInfo.adContent.data.ad1.countShow+1);
         }
         wx.setStorageSync('localCountShow',localCountShow+1);
  
      }else if(app.globalData.dateTimeDetail==app.globalData.showTimeEnd){
       // 把查看的事件次数置0;
       app.globalData.otherInfo.adContent.data.ad1.countShow=0;
      }else{
        app.globalData.IsCountClick=true; 
        that.setData({
          countClick: app.globalData.IsCountClick
        });
      }
     that.setData({
        countClick: app.globalData.IsCountClick
      });
    }else{
      app.tdsdk.event({
        id: 'ppline_ad_showWX',
        label: '游戏中微信广告位展示统计',
        params: {
          // type: app.globalData.levelType
        }
      });
      app.globalData.IsCountClick=true; 
      that.setData({
        countClick: app.globalData.IsCountClick
      });
      
    }

  },
  onHide: function () {
    if (wx.getStorageSync('localCountClick') == 1) {
      app.globalData.IsCountClick = true; 
      that.setData({
        countClick: app.globalData.IsCountClick
      });
    }
    if (wx.getStorageSync('localCountShow') == 1) {
      app.globalData.IsCountClick = true;
      that.setData({
        countClick: app.globalData.IsCountClick
      });
    }
    if (that.data.errorTip == 'unhidden') {
      that.setData({
        errorTip: 'hidden',
      });
      colorLeftArr = null;
      if (leftColorTimer != null) {
        clearInterval(leftColorTimer);
        leftColorTimer = null;
      }
    }

    //这里不销毁时再次跳转进来canvas内容不显示
    if (chess_C != null) {
      chess_C.destroy();
    }
    contextbg = null;
    context = null;
    ctxCircle = null;

    prePosX = -1;
    prePosY = -1;


    if (wx.getStorageSync('localCountClick') == 1) {
      app.globalData.IsCountClick = true;
      that.setData({
        countClick: app.globalData.IsCountClick
      })
    }
    if (wx.getStorageSync('localCountShow') == 1) {
      app.globalData.IsCountClick = true;
      that.setData({
        countClick: app.globalData.IsCountClick
      })
    }

    that.setData({
      countClick: app.globalData.IsCountClick
    })

  },

  onUnload: function () {
    notShareBack = true;
    if (app.globalData.levelType == consts.LEVELTYPE_NORMAL) {
      that.resetGameParam(app.globalData.levelId, false);
    } else {
      that.resetGameParam(app.globalData.sLevelId, false);
    }
    if (that.data.errorTip == 'unhidden') {
      that.setData({
        errorTip: 'hidden',
      });
      colorLeftArr = null;
      if (leftColorTimer != null) {
        clearInterval(leftColorTimer);
        leftColorTimer = null;
      }
    }

    if (chess_C != null) {
      chess_C.destroy();
    }
    //这里不销毁时再次跳转进来canvas内容不显示
    contextbg = null;
    context = null;
    ctxCircle = null;
  },

  //固定不动的元素
  drawFixedBG: function () {
    that.updateChessNumber();
    if (chess_C != null) {
      chess_C.draw(true, colorRandom);
    }
    // that.drawBg();
    // that.drawChessPoint();
    // contextbg.draw(true);
  },

  drawAll: function () {
    if (drawLineAgain) {
      drawLineAgain = false;
      that.drawPointLine();
    }

    that.drawCircle();
    that.drawTeach();
    if (ctxCircle != null) {
      ctxCircle.draw();
    }

    var now = new Date();
    if (now - prev > 1000 && (answer != null && answer.length >= 3) && (techStep == 0 || (techStep >= answer[app.globalData.techId].length - 1)) && techTimer == null) {
      prev = now;
      techTimer = setInterval(
        function () {

          var less = (techStep < answer[app.globalData.techId].length - 1);
          techStep = techStep + 0.1;
          if (less && techStep >= answer[app.globalData.techId].length - 1) {
            clearInterval(techTimer);
            techTimer = null;
            setTimeout(function () {
              techStep = 0;
            }, 1000);
          }

        }, 33);
    }
  },
  formatDateTime: function (inputTime) {
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
    return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
  },
  getServerTimeSuccess: function (timeLong) {
    // console.log(app.globalData.baseInfo);
    var dateTime = new Date(timeLong * 1000);
    // app.globalData.dateTimeDetails = this.formatDateTime(timeLong * 1000);
    app.globalData.dateTimeDetail = timeLong * 1000
    // console.log(app.globalData.dateTimeDetails, "loadingshijian ");
},
    
clickad:function(event){
  app.tdsdk.event({
    id: 'ppline_ad_ClickWX',
    label: '游戏中广告微信位点击统计',
    params: {
      stage: event.currentTarget.id
    }
  });
},
  clickH5: function (event) {
    return;
    app.tdsdk.event({
      id: 'ppline_ad_ClickSelf',
      label: '游戏中广告位内部点击统计',
      params: {
        stage: event.currentTarget.id
      }
    });

    wx.setStorageSync('localCountClick', localCountClick + 1);
    app.globalData.otherInfo.countClick++;
    app.setIncrbyData(app.globalData.openIdKey, 'ad1', app.globalData.otherInfo.countClick, function (res) {
      console.log(res);
      wx.navigateTo({
        url: '../h5/ad',
      })
    });
  },
  //按下逻辑
  touchStart: function (e) {
    if (isWin || e.touches == null || e.touches.length < 1)
      return;
    isTouchDown = true;
    // utilLog(e.touches[0]);
    touchX = e.touches[0].x;
    touchY = e.touches[0].y;
    var posX = Math.ceil((touchX - deltaStartX) / imgWidth) - 1;
    var posY = Math.ceil((touchY - deltaStartY) / imgHeight) - 1;
    var isStart = false;
    var isLineIn = false;//当前位置是否可以开始画线或者继续画线
    if (posX < 0 || posY < 0 || posX > chessSize - 1 || posY > chessSizeH - 1)
      return;

    var curColorReginalPoint = null;//获取当前的原始点颜色的列表
    for (var i = 0; i < point.length; i++) {
      var item = point[i];
      var points = null;
      if (item.f != null) {
        points = item.f;
        if (posX == (points[1]) && posY == (points[0])) {
          if (app.globalData.isTeach) {//教学时如果当前点不是按教学的步骤来,不给点击逻辑处理
            if ((app.globalData.techId + 1) != item.c) {
              return;
            }
          } else {
            if (answerColorList.indexOf(item.c) >= 0) {
              return;//当前已经被提示的线路不可被撤销或者修改
            }
          }
          curColorReginalPoint = item;
          isStart = true;
          isLineIn = true;
          chess[posY][posX] = item.c;//同步棋盘中的点数据
          curColor = item.c;
          break;
        }
      }
      if (item.s != null) {
        points = item.s;
        if (posX == (points[1]) && posY == (points[0])) {
          if (app.globalData.isTeach) {//教学时如果当前点不是按教学的步骤来,不给点击逻辑处理
            if ((app.globalData.techId + 1) != item.c) {
              return;
            }
          } else {
            if (answerColorList.indexOf(item.c) >= 0) {
              return;//当前已经被提示的线路不可被撤销或者修改
            }
          }
          curColorReginalPoint = item;
          isStart = true;
          isLineIn = true;
          curColor = item.c;
          chess[posY][posX] = item.c;//同步棋盘中的点数据
          break;
        }
      }
    }


    if (!isLineIn) {//如果当前不是起始点,判断下是否在某条线上
      var thisColor = chess[posY][posX];
      if (thisColor != 0) {
        if (app.globalData.isTeach) {//教学时如果当前点不是按教学的步骤来,不给点击逻辑处理
          if ((app.globalData.techId + 1) != thisColor) {
            return;
          }
        } else {
          if (answerColorList.indexOf(thisColor) >= 0) {
            return;//当前已经被提示的线路不可被撤销或者修改
          }
        }
        curColor = thisColor;
        isLineIn = true;//开始从这个点开始(把后面的线条删除),继续画线
        that.clearPoint(posY, posX, curColor, false, false, false);
        that.updateChessNumber();
        var point_;
        for (var i = 0; i < point.length; i++) {
          if (point[i].c == curColor) {
            point_ = point[i];
            break;
          }
        }
      }
    }

    if (isLineIn) {
      if (that.data.errorTip == 'unhidden') {
        that.setData({
          errorTip: 'hidden',
        });
        colorLeftArr = null;
        if (leftColorTimer != null) {
          clearInterval(leftColorTimer);
          leftColorTimer = null;
        }
      }

      startLine = true;
      var add = [posY, posX];
      if (colorQueue != null) {
        var key = curColor.toString();
        var curQue = colorQueue[key];
        if (isStart) {
          //按到颜色块起始点或者终点时,数据需要初始化清空
          var firstP = curColorReginalPoint.f;
          var secondP = curColorReginalPoint.s;
          for (var i = 0; i < curQue.length; i++) {
            if ((curQue[i][0] == firstP[0] && curQue[i][1] == firstP[1])
              || (curQue[i][0] == secondP[0] && curQue[i][1] == secondP[1])) {
              chess[curQue[i][0]][curQue[i][1]] = curColor;
            }
            else {
              chess[curQue[i][0]][curQue[i][1]] = 0;
            }
          }
          colorQueue[key].splice(0, colorQueue[key].length);
          that.updateChessNumber();
          drawLineAgain = true;
        }
        colorQueue[key].push(add);
      }
    }
    //
    // that.resetAllConflict();
    // utilLog((new Date())+"按下时数据:" + colorQueueGrid.toString());
  },


  //按下移动逻辑
  touchMove: function (e) {
    if (isWin || e.touches == null || e.touches.length < 1)
      return;
    touchX = e.touches[0].x;
    touchY = e.touches[0].y;
    if (startLine && curColor > 0) {
      var posX = Math.ceil((touchX - deltaStartX) / imgWidth) - 1;
      var posY = Math.ceil((touchY - deltaStartY) / imgHeight) - 1;
      if (posY < 0 || posY > (chess.length - 1) || posX < 0 || posX > (chess[posY].length - 1)) {
        //超出棋盘位置的不添加逻辑
        return;
      }
      if (prePosX == posX && prePosY == posY) {
        return;
      }
      prePosX = posX;
      prePosY = posY;

      var nvalue = chess[posY][posX];
      var lastPosint = colorQueue[curColor.toString()][colorQueue[curColor.toString()].length - 1];
      if (Math.abs(lastPosint[1] - posX) + Math.abs(lastPosint[0] - posY) > 1)
        return;//只有相邻点才可以添加进去
      if (nvalue == 0) {//棋盘当前位置没有被占领
        that.joinPoint(posY, posX, curColor);
      }
      else if (nvalue != curColor) {//当前位置被其他颜色占领
        var precolor = chess[posY][posX];
        var other;
        for (var i = 0; i < point.length; i++) {
          if (point[i].c == precolor) {
            other = point[i];
            break;
          }
        }
        //如果该点不是其他颜色的起始点或者终点,否则返回
        if (other != null && ((posY == (other.f[0]) && posX == (other.f[1]))
          || (posY == (other.s[0]) && posX == (other.s[1])))) {
          return;
        }

        if (app.globalData.isTeach) {//当前是教学时,不可以把原先的连好的颜色点占领
          if (precolor > 0 && precolor <= (app.globalData.techId)) {
            return;
          }
        } else if (answerColorList.indexOf(nvalue) >= 0) {
          return;//当前已经被提示的线路不可被撤销或者修改
        }
        var conflict = new colorConflict();
        conflict.setConflictData(precolor, curColor, posX, posY);
        // if (curColorConflict != null) {
        // utilLog(" 冲突队列");
        // utilLog(curColorConflict);
        // }
        // utilLog(curColor + " 加入冲突队列" + "_" + posY + "_" + posX);
        curColorConflict[curColor + "_" + posX + "_" + posY] = (conflict);//把前一个销毁的颜色值和位置添加进入
        // utilLog(curColorConflict);
        //获取前一个颜色的最后一个点,判断是否是该颜色的point点,如果是咋不能清除他的数据
        var lastPoint = colorQueue[precolor.toString()][colorQueue[precolor.toString()].length - 1];
        var isLast = false;
        // utilLog("最后一个点:" + lastPoint[0] + "_" + lastPoint[1]);
        // utilLog("该颜色的point起点:" + other.f[0] + "_" + other.f[1] + "终点:" + other.s[0] + "_" + other.s[1]);
        if (((lastPoint[0] == (other.f[0]) && lastPoint[1] == (other.f[1]))
          || (lastPoint[0] == (other.s[0]) && lastPoint[1] == (other.s[1])))) {
          isLast = true;
        }
        that.clearPoint(posY, posX, precolor, false, true, false);
        if (isLast) {
          chess[lastPoint[0]][lastPoint[1]] = precolor;
        }
        that.joinPoint(posY, posX, curColor);
        that.updateChessNumber();
      }
      else {//当前位置已经在自己颜色队列中.则将当前队列中该位置后面的点都取消掉
        var key = curColor.toString();
        var first = colorQueue[key][0];//获得绘制路径的第一个点
        var last = colorQueue[key][colorQueue[key].length - 1];//获得绘制路径的当前最后一个点
        if (posX == (last[0]) && posY == (last[1])) {
          return;
        }
        var twoPoint; //获取当前颜色的第一个点的坐标,比较下,当前如果已经连接到最后一个点时结束绘制
        for (var i = 0; i < point.length; i++) {
          if (point[i].c == curColor) {
            twoPoint = point[i];
            break;
          }
        }
        var endPoint = ((first[0] == twoPoint.f[0]) && (first[1] == twoPoint.f[1])) ? twoPoint.s : twoPoint.f;//判断那个是终点
        if (posX == (endPoint[1]) && posY == (endPoint[0])) {

          that.joinPoint(posY, posX, curColor);
          if (app.globalData.musicOn && compVer(app.globalData.sdkV, "1.6.0") >= 0) {
            if (that.audioCtx.src) { }
            else {
              that.audioCtx.src = app.getCommonResourceUrl() + 'sound/connect.mp3?ran=' + Math.ceil(Math.random()
                * 100000);
            }
            that.audioCtx.seek(0);
            that.audioCtx.pause();
            that.audioCtx.obeyMuteSwitch = false;
            that.audioCtx.play();
          }
          startLine = false;//最后一个点的结束绘制
          if (app.globalData.isTeach) {
            that.checkIsTechRight();
          } else {
            var isEqual = that.checkIsArrayEqual(colorQueue[curColor.toString()], answer[curColor - 1]);
            if (isEqual) {
              equalAnserList.push(curColor);
            }
          }

          that.recoverAllConflict(curColor + "_" + posX + "_" + posY, true, curColor.toString());
          that.resetAllConflict();

          setTimeout(function () {
            that.chargeAllRightFill();
          }, 40);
        }
        else if (posX == (first[1]) && posY == (first[0])) {
          //回到起点时,清空
          var conf = colorQueue[curColor.toString()][colorQueue[curColor.toString()].length - 1];
          if (conf != null) {
            var confColor = curColorConflict[curColor + "_" + conf[1] + "_" + conf[0]];
            if (confColor != null) {
              that.recoverAllConflict(curColor + "_" + conf[1] + "_" + conf[0], false, confColor.getConflictColor().toString());
            }
          }
          that.clearPoint(posY, posX, curColor, true, false, false);
          that.joinPoint(posY, posX, curColor);
          that.updateChessNumber();
        }
        else {
          //从该点在数组位置开始一直到队尾全部删除
          that.clearPoint(posY, posX, curColor, false, false, true);
          that.joinPoint(posY, posX, curColor);
          that.updateChessNumber();
        }
      }
    }
  },
  //手指抬起逻辑
  touchEnd: function (e) {
    var posX = Math.ceil((touchX - deltaStartX) / imgWidth) - 1;
    var posY = Math.ceil((touchY - deltaStartY) / imgHeight) - 1;
    if (startLine) {//如果结束了绘制点的话就不需要再设置
      that.recoverAllConflict(curColor + "_" + posX + "_" + posY, true, curColor.toString());
      that.resetAllConflict();
    }
    if (lastStepColor != curColor) {
      lastStepColor = curColor;
      if (!isWin) {//胜利时已经在判断里面加过了
        costStep++;
        that.setData({
          costStep: costStep,
        });
        // utilLog("步数:"+costStep);
      }
    }
    touchX = 0;
    touchY = 0;
    isTouchDown = false;
    startLine = false;
    curColor = -1;
    that.chargeIsLineTooMuch();
  },

  //判断当前线的操作步数是否超界了,超了就重置改关卡
  chargeIsLineTooMuch: function () {
    if (costStep > 9999) {
      costStep = 0;
      that.setData({
        costStep: costStep,
      });
      that.clickResetGame();//重置关卡
    }
  },

  resetAllConflict: function () {
    for (var i = 1; i <= colorQueue.length; i++) {
      var color = i.toString();
      var tep = colorQueue[color];
      if (tep == null) {
        continue;
      }
      if (colorQueueGrid[color] == null) {
        colorQueueGrid[color] = [];
      }
      var length = tep.length;
      for (var j = 0; j < length; j++) {
        if (colorQueueGrid[color][j] == null) {
          colorQueueGrid[color][j] = [];
        }
        colorQueueGrid[color][j][0] = tep[j][0];
        colorQueueGrid[color][j][1] = tep[j][1];
      }
      var gridLength = colorQueueGrid[color].length;
      if (gridLength > length) {
        for (var j = length; j < gridLength; j++) {
          colorQueueGrid[color][j] = [];
        }
        colorQueueGrid[color] = colorQueueGrid[color].slice(0, length);
      }
    }
  },

  //isupdate代表是回退数据还是更新数据
  recoverAllConflict: function (colorKey, isUpdate, color) {
    // if(isUpdate){
    //   // utilLog("开始颜色的update");
    //   var allkeys = curColorConflict.keys;
    //   var isconflict = false;
    //   var curdrawColor = colorKey.split('_')[0];
    //   for (var key in curColorConflict){
    //     var keys = key.split('_');
    //     if (keys[0] == curdrawColor){//更新时把所有的表格填充数据更新为线条数据,并清除所有的相关的颜色冲突
    //       curColorConflict[key] = null;
    //       isconflict = true;
    //     }
    //   }
    //   if (!isconflict)//没有冲突的就不需要更新了
    //     return;
    //   // var colorkey = curColorConflict[colorKey];
    //   var updatetmp = colorQueue[color];
    //   for (var i = 1; i <= colorQueueGrid.length; i++) {        
    //     var other = colorQueueGrid[i.toString()];
    //     if (other==null)
    //       continue;
    //     for (var i = 0; i < other.length; i++) {   
    //       if (colorQueueGrid[color][i]==null){
    //         colorQueueGrid[color][i]= [];
    //       }
    //       if (updatetmp[i] != null) {
    //         colorQueueGrid[color][i][0] = updatetmp[i][0];
    //         colorQueueGrid[color][i][1] = updatetmp[i][1];          
    //       }
    //     }
    //   }
    //   colorQueueGrid[color] = colorQueueGrid[color].slice(0, updatetmp.length);
    //  return; 
    // }
    // if (curColorConflict != null && curColorConflict[colorKey]!=null){
    //   var preColorInt = curColorConflict[colorKey].getConflictColor();
    //   var preColor = preColorInt.toString();
    //   var preColorQueue = colorQueue[preColor];
    //   if (preColorQueue!=null) {
    //     var temp = colorQueueGrid[preColor];
    //     var other = preColorQueue;
    //     for (var i = 0; i < temp.length; i++) {
    //       if (other[i] == null) {
    //         other[i] = [];
    //       }
    //       other[i][0] = temp[i][0];
    //       other[i][1] = temp[i][1];
    //       chess[temp[i][0]][temp[i][1]] = preColorInt;
    //     }
    //   }
    //   curColorConflict[colorKey] = null;
    // }
  },
  //颜色队列中加入数据
  joinPoint: function (posX, posY, color) {
    var add = [posX, posY];
    if (colorQueue != null) {
      var que = colorQueue[color.toString()];
      var lastSame = true;
      if (que.length < 1) {
        lastSame = false;
      } else {
        var point = que[que.length - 1];
        if (point == null || point[0] != posX || point[1] != posY) {
          lastSame = false;
        }
      }
      if (!lastSame && app.globalData.tiliCost) {//相同的点不添加到队列
        colorQueue[color.toString()].push(add);
      }
    }
    chess[posX][posY] = curColor;
    drawLineAgain = true;
  },

  //颜色队列中删除索引从clearStartId开始的数据 ,isPointPre是否从当前点的前一个开始点开始清除
  clearPoint: function (posX, posY, color, isAll, isPointPre, rollBack) {
    var queue = colorQueue[color.toString()];//chess数组中保留的id是从1开始计算的
    var clearInd = 0;
    var max = queue.length;
    var startclear = false;
    if (isAll) {//isall_是否从头开始清除(保留第一个)
      startclear = true;
      clearInd = 1;
    }
    for (var i = 0; i < max; i++) {
      if (startclear) {
        chess[queue[i][0]][queue[i][1]] = 0;    //chess数组中保留的id是从1开始计算的   
      }
      else if (queue[i][0] == posX && queue[i][1] == posY
        // && i != max - 1
      ) {
        clearInd = i;
        startclear = true;
        if (isPointPre) {
          chess[queue[i][0]][queue[i][1]] = 0;
        }
      }
    }
    drawLineAgain = true;
    if (startclear) {
      if (colorQueue != null && app.globalData.tiliCost) {
        var clipData = colorQueue[color.toString()][clearInd + 1];
        colorQueue[color.toString()].splice(clearInd, colorQueue[color.toString()].length - clearInd);
      }
    }

  },


  //绘制棋盘中的每个格子的数据
  updateChessNumber: function () {
    for (var i = 0; i < point.length; i++) {
      var color = point[i].c;
      // if (!app.globalData.tiliCost && app.globalData.levelId > 1 && (Math.floor(app.globalData.levelId%2)==1)) {
      //   color = Math.random() > 0.5 ? point[(i + 1) > (point.length - 1) ? point.length - 1 : (i + 1)].c : point[(i - 1) < 0 ? 0 : (i - 1)].c;
      // }
      chess[point[i].f[0]][point[i].f[1]] = color;
      chess[point[i].s[0]][point[i].s[1]] = color;

    }
  },
  drawChessNumber: function (isShowNum) {
    if (context == null)
      return;
    if (isShowNum) {
      context.beginPath();
      context.setFillStyle('green');
      context.setFontSize(20);
      context.setTextAlign('center');
      for (var i = 0; i < chess.length; i++) {
        for (var j = 0; j < chess[i].length; j++) {
          context.fillText('' + chess[i][j],
            deltaStartX + offStartX + imgWidth * j,
            deltaStartY + (offPointY + offStartY) + imgHeight * i)
        }

      }
      context.closePath();
    }
  },

  //绘制连线
  drawPointLine: function () {
    // return;
    var offX = deltaStartX + offStartX;
    var offY = deltaStartY + offStartY;
    if (context == null) {
      return;
    }
    context.setGlobalAlpha(0.3);
    context.setLineJoin('miter');
    for (var i = 0; i < point.length; i++) {
      if (colorQueueGrid == null) {
        break;
      }
      if (startLine && point[i].c == curColor) {//当前颜色的底色在拖动过程中不绘制
        continue;
      }
      var que = colorQueueGrid[point[i].c.toString()];
      if (que == null) {
        continue;
      }
      if (que.length < 2)
        continue;
      context.beginPath();
      context.setStrokeStyle(pointColor[point[i].c + colorRandom - 1]);
      context.setFillStyle(pointColor[point[i].c + colorRandom - 1]);
      context.rect(offX + (que[0][1] * imgWidth), offY + (que[0][0] * imgHeight), offRextX, offRextY);
      context.setLineWidth(imgWidth);//imgWidth线宽和方格粗细一样
      context.moveTo(offX + (que[0][1] * imgWidth), offY + (que[0][0] * imgHeight));
      var len = que.length;
      var lastX;
      var lastY;
      for (var j = 1; j < len; j++) {
        if (que[j] == null || que[j].length < 2) {
          continue;
        }
        lastX = offX + (que[j][1]) * imgWidth;
        lastY = offY + imgHeight * (que[j][0]);
        context.lineTo(lastX, lastY);
      }
      context.moveTo(lastX, lastY);
      context.rect(lastX, lastY, offRextX, offRextY);
      context.closePath();
      context.stroke();
    }
    context.setGlobalAlpha(1);
    context.setLineCap('round');
    context.setLineJoin('round');
    for (var i = 0; i < point.length; i++) {
      var que = colorQueue[point[i].c.toString()];
      if (que.length < 2)
        continue;
      context.beginPath();
      context.setStrokeStyle(pointColor[point[i].c + colorRandom - 1]);
      context.setLineWidth(lineWidth);
      context.moveTo(offX + (que[0][1] * imgWidth), offY + (que[0][0] * imgHeight));
      for (var j = 1; j < que.length; j++) {
        context.lineTo(offX + ((que[j][1]) * imgWidth), offY + imgHeight * (que[j][0]));
      }
      context.moveTo(offX + (que[que.length - 1][1] * imgWidth), offY + (que[que.length - 1][0] * imgHeight));
      context.closePath();
      context.stroke();
    }
    that.drawAllSkin();
    that.drawAllTipsIcon();
    that.drawChessNumber(false);
    that.drawLeftColorChess(colorLeftArr);
    context.draw();
  },

  drawAllSkin: function () {
    if (context == null)
      return;
    if (curLvSkin < 1 && !app.globalData.colorWeak) {
      return;
    }

    if (app.globalData.colorWeak) {
      context.beginPath();
      context.setFillStyle('white');
      context.setFontSize(20);
      context.setTextAlign('center');
      for (var i = 0; i < point.length; i++) {
        context.fillText('' + point[i].c,
          deltaStartX + offStartX + imgWidth * point[i].s[1],
          deltaStartY + (offPointY + offStartY) + imgHeight * point[i].s[0])
        context.fillText('' + point[i].c,
          deltaStartX + offStartX + imgWidth * point[i].f[1],
          deltaStartY + (offPointY + offStartY) + imgHeight * point[i].f[0])
      }
      context.closePath();
      return;
    }
    var skinUrl = "../../Resources/skin/" + app.globalData.skinConfig["skin" + (curLvSkin + 1)].url;
    for (var i = 0; i < point.length; i++) {
      var w = imgWidth;
      var h = w;
      var xxx = (imgWidth - w) / 2;
      var yyy = (imgHeight - h) / 2;
      context.beginPath();
      context.drawImage(skinUrl,
        deltaStartX + (point[i].s[1]) * imgWidth + xxx,
        deltaStartY + (point[i].s[0]) * imgHeight + yyy,
        w, h);
      context.drawImage(skinUrl,
        deltaStartX + (point[i].f[1]) * imgWidth + xxx,
        deltaStartY + (point[i].f[0]) * imgHeight + yyy,
        w, h);
      context.closePath();
    }
  },
  //绘制已经被点击了提示后出来的小点点
  drawAllTipsIcon: function () {
    if (context == null)
      return;
    if (answerColorList.length <= 0) {
      return;
    }
    var circleradis = radis - 5;
    var radisOffY = radis * imgWidth / imgHeight;
    for (var i = 0; i < answerColorList.length; i++) {
      var tipcolor = answerColorList[i] - 1;
      var w = 23;
      var h = 21;
      var xxx = (imgWidth - w) / 2;
      var yyy = (imgHeight - h) / 2;
      context.beginPath();
      context.drawImage("./img/tips.png",
        deltaStartX + (point[tipcolor].s[1]) * imgWidth + xxx,
        deltaStartY + (point[tipcolor].s[0]) * imgHeight + yyy,
        w, h);
      context.drawImage("./img/tips.png",
        deltaStartX + (point[tipcolor].f[1]) * imgWidth + xxx,
        deltaStartY + (point[tipcolor].f[0]) * imgHeight + yyy,
        w, h);
      context.closePath();
      context.fill();
    }
  },

  drawCircle: function () {
    if (isWin || ctxCircle == null) {
      return;
    }
    if (isTouchDown && curColor > 0 && ctxCircle != null) {
      ctxCircle.beginPath();
      ctxCircle.setGlobalAlpha(0.4);
      ctxCircle.setFillStyle(pointColor[curColor + colorRandom - 1]);
      ctxCircle.arc(touchX, touchY, 70, 0, 2 * Math.PI, true);//设置一个原点(100,50)，半径为为50的圆的路径到当前路径  
      ctxCircle.closePath();//关闭当前路径  
      ctxCircle.fill();//对当前路径进行描边  
    }
  },
  //绘制教学引导的小手指
  drawTeach: function () {
    if (ctxCircle == null || isWin || !app.globalData.isTeach || answer == null || answer.length < 3 || answer
    [app.globalData.techId] == null || typeof (answer
    [app.globalData.techId]) == 'undefined' || ctxCircle == null) {
      return;
    }
    var floor = Math.floor(techStep);
    var ceil = Math.ceil(techStep);

    ceil = Math.min(answer
    [app.globalData.techId].length - 1, ceil);
    floor = Math.min(answer
    [app.globalData.techId].length - 1, floor);

    var over = techStep - floor;

    var xDelta = 0;
    var yDelta = 0;
    if (ceil > floor) {
      xDelta = (answer[app.globalData.techId][ceil][1] - answer[app.globalData.techId][floor][1]) * imgHeight;
      yDelta = (answer[app.globalData.techId][ceil][0] - answer[app.globalData.techId][floor][0]) * imgWidth;

    }

    var offX = deltaStartX + (0.4 + answer
    [app.globalData.techId][floor][1]) * imgHeight +
      xDelta * over;
    var offY = deltaStartY + (0.5 + answer
    [app.globalData.techId][floor][0]) * imgWidth +
      yDelta * over;
    ctxCircle.setGlobalAlpha(1);
    ctxCircle.drawImage("./img/x3.png", offX, offY, 58, 77);
  },


  //判断当前是否已经按照正常的教学步骤在走
  checkIsTechRight: function () {

    if (app.globalData.isTeach && answer != null) {
      var curColor = colorQueue[(app.globalData.techId + 1).toString()];
      var length = answer[app.globalData.techId].length;
      utilLog(curColor);
      if (curColor.length != length) {
        return;
      }
      var isAllRight = that.checkIsArrayEqual(curColor, answer[app.globalData.techId]);

      if (isAllRight) {
        isAllRight = false;
        app.globalData.techId++;
        if (app.globalData.techId >= answer.length) {
          app.globalData.techId = 0;
          app.globalData.isTeach = false;
        }
        techStep = 0;
        if (techTimer != null) {
          clearInterval(techTimer);
          techTimer = null;
          prev = new Date();
        }
      }
    }
  },
  //判断两个数组的数据是否相等(正的/反的相等都可以)
  checkIsArrayEqual: function (arr1, arrStandard) {
    var length = arrStandard.length;
    if (arr1.length != length) {
      return false;
    }
    for (var i = 0; i < length; i++) {
      var techPos = arrStandard[i];
      var cur = arr1[i];
      var opposite = arr1[length - 1 - i];
      if ((techPos[0] != cur[0] || techPos[1] != cur[1])
        && (techPos[0] != opposite[0] || techPos[1] != opposite[1])) {
        return false;
      }
    }
    return true;
  },
  //判断当前是否棋盘中所有的点都被正确填充
  chargeAllRightFill: function () {
    var temp = true;
    if (!isWin) {
      for (var i = 0; i < point.length; i++) {
        //判断是否颜色块队列中一头一尾已经在列表中
        var first = point[i].f;
        var second = point[i].s;
        var que = colorQueue[point[i].c.toString()];
        if (que == null || que[0] == null || que[1] == null ||
          !(((que[0][0]) == first[0] && (que[0][1]) == first[1]) || ((que[0][0]) == second[0] && (que[0][1]) == second[1]))
        ) {
          temp = false;
          return;
        }
        if (!(((que[que.length - 1][0]) == second[0] && (que[que.length - 1][1]) == second[1])
          || ((que[que.length - 1][0]) == first[0] && (que[que.length - 1][1]) == first[1]))) {
          temp = false;
          return;
        }
      }
      var getLeft = false;
      var leftArr;
      for (var i = 0; i < chess.length; i++) {
        for (var j = 0; j < chess[i].length; j++) {
          //判断当前是否棋盘中所有格子都被填满
          if (chess[i][j] == 0) {
            getLeft = true;
            if (leftArr == null) {
              leftArr = [];
            }
            var suiji = Math.floor(Math.random() * pointColor.length);
            suiji = Math.min(suiji, pointColor.length - 1);
            suiji = Math.max(suiji, 0);
            var pos = [i + '', j + '', pointColor[suiji]];
            leftArr.push(pos);
          }
        }
      }
      if (getLeft) {
        temp = false;
        // if (wx.getStorageSync(consts.RECORD_ERRORBOX) == 1) {
        that.setData({
          errorTip: 'unhidden',
        });
        colorLeftArr = null;
        colorLeftArr = leftArr;
        if (leftColorTimer == null) {
          leftColorTimer = setInterval(function () {
            for (var i = 0; i < colorLeftArr.length; i++) {
              var suiji = Math.floor(Math.random() * pointColor.length);
              suiji = Math.min(suiji, pointColor.length - 1);
              suiji = Math.max(suiji, 0);
              colorLeftArr[i][2] = pointColor[suiji];
            }
          }, 500);
        }
        //把剩余没有连上的格子随机给一些颜色块的动画提示
        that.drawLeftColorChess(leftArr);
        // }
        // else {
        this.setData({
          showErrorBox: true
        });
        // }
      }
    }
    isWin = temp;
    if (isWin) {
      clearInterval(timer);
      that.drawFixedBG();
      that.drawPointLine();


      //游戏结束
      const cur = new Date();
      const duration = (cur - timeStart).toFixed(2);
      var overover = (90 - ((duration - timeStandard)) / 1000.0).toFixed(2);

      overover = Math.min(overover, 100);
      overover = Math.max(0, overover);
      var isLessStep = false;
      var curstep = 0;
      var maxsteps = 5;
      var allCollects = 5;
      //此时手指已经抬起,步数已经累加过了
      if (!app.globalData.isBonus && ((isTouchDown && costStep < point.length) || (!isTouchDown && costStep == point.length))) {
        isLessStep = true;
        costStep = point.length;//最低步数是颜色块的个数
        that.setData({
          costStep: costStep,
        });
        var isFirstPass = true;
        if (typeof (app.globalData.baseInfo.bestStep) == 'undefined') {
          app.globalData.baseInfo.bestStep = 1;
          app.globalData.baseInfo.bestIndex = 1;
        } else {
          if (app.globalData.baseInfo.levelProgress[app.globalData.levelType][app.globalData.biglevel] <= app.globalData.levelId) {
            app.globalData.baseInfo.bestStep++;//只有没玩过的关卡会累积最少通关次数
          } else {
            isFirstPass = false;
          }

          if (typeof (app.globalData.baseInfo.bestIndex) == 'undefined') {
            app.globalData.baseInfo.bestIndex = 1;
          }
        }
        allCollects = app.globalData.baseInfo.bestIndex * 5;//  (5 + app.globalData.baseInfo.bestIndex * 5) * app.globalData.baseInfo.bestIndex/2;
        var bestAllStep = 5;// app.globalData.baseInfo.bestIndex * 5;//每一个阶段的完美关数的公式

        // 每日多彩包不统计步数进度条
        if (!this.data.isColorfulLevel) {
          if (app.globalData.baseInfo.bestStep >= bestAllStep) {
            curstep = bestAllStep;
            maxsteps = bestAllStep;
            app.globalData.baseInfo.bestIndex++;
            app.globalData.baseInfo.bestStep = 0;
          } else {
            curstep = app.globalData.baseInfo.bestStep;
            maxsteps = bestAllStep;
          }
          app.globalData.sessCheckMax = 0;
          app.setUserData(app.globalData.openIdKey, consts.TYPE_BASE, JSON.stringify(app.globalData.baseInfo).toString());
        }
        var best = Math.ceil(app.globalData.baseInfo.bestIndex / 4);
        best = Math.min(best, 4);
        that.setData({
          isFirstPass: isFirstPass,
          perfectLevelCnt: allCollects,
          perfectIndex: best - 1,
          awardPic: './img/award' + best + '.png',
        });

        if (!this.data.isColorfulLevel) {
          that.setData({
            perfectCnt: curstep,
            perfectMax: maxsteps,
          });
        }
      }
      else {
        if (!app.globalData.isBonus && !this.data.isColorfulLevel) {
          costStep++;
          if (typeof (app.globalData.baseInfo.bestStep) == 'undefined') {
            app.globalData.baseInfo.bestStep = 0;
          }
          that.setData({
            costStep: costStep,
            perfectCnt: app.globalData.baseInfo.bestStep,
            perfectMax: 5,
          });
        }
      }
      timeStart = cur;

      if (!app.globalData.isBonus) {
        if (app.globalData.selfLevelTime == null) {
          app.globalData.selfLevelTime = new Object();
        }
        var key;
        if (app.globalData.levelType != consts.LEVELTYPE_NORMAL) {
          key = app.globalData.levelType + "_" + app.globalData.biglevel + "_" + app.globalData.levelId;
        } else {
          key = app.globalData.biglevel + "_" + app.globalData.levelId;
        }
        var exTime = app.globalData.selfLevelTime[key];
        var costStepCnt = app.globalData.selfLevelTime[key + "_step"];
        if (typeof (costStepCnt) == 'undefined') {
          costStepCnt = costStep;
        }
        if (exTime == null || typeof (exTime) == "undefined" || exTime > duration || costStep < costStepCnt) {
          app.globalData.selfLevelTime[key] = duration;
          app.globalData.selfLevelTime[key + "_step"] = costStepCnt;
          app.globalData.sessCheckMax = 0;
          app.setUserData(app.globalData.openIdKey, consts.TYPE_TIMECOST, JSON.stringify(app.globalData.selfLevelTime).toString());
        }
        that.updateRankList(duration);
      }

      setTimeout(function () {
        if (app.globalData.isBonus) {
          var bonusItem = app.globalData.bonusCfg[(app.globalData.levelType + "_" + (app.globalData.biglevel) + "_" + app.globalData.levelId)];
          that.setData({
            newLvName: "",
            continueType: consts.OPEN_LEVELS,
            useTimeMinute: (duration / 1000.0).toFixed(1),
            useTime: costStep,
            overRide: 0,
            isLessStep: false,
            lvName: "奖励关卡",
            // app.globalData.levelOpenConfig[app.globalData.levelType][app.globalData.biglevel].name,
            needShareCnt: '',//需要解锁后分享几次
            isNewTypeOpen: false,
            nextLeveltitle: "",
            isLevelClear: false,
            isGameOver: true,
            isBonus: app.globalData.isBonus,
            bonusAward: bonusItem,
            dialogTitle: "过关",
          });
        } else {

          var shareDta = app.globalData.recordDatas[app.globalData.biglevel + "_" + app.globalData.levelId + "_share"];
          var shareCnt = app.globalData.gameConfig.shareReward;
          if (!(typeof (shareDta) == "undefined" || shareDta < 1) || app.globalData.curDayCoinLeft <= 0) {
            shareCnt = 0;
          }
          //是否有新大关卡解锁
          nextOpenInfo = null;
          //是否是通关
          var isLast = false;
          if (app.globalData.levelType == consts.LEVELTYPE_NORMAL) {
            isLast = (app.globalData.levelId >= app.globalData.levelContent[app.globalData.biglevel].levelnum);
          } else {
            var sAll = 0;
            var tmp = 0;
            while (tmp < app.globalData.levelContent[app.globalData.biglevel].c.length) {
              sAll += app.globalData.levelContent[app.globalData.biglevel].c[tmp].levelnum;
              tmp++;
            }
            isLast = (app.globalData.levelId >= sAll);
          }

          if (!isLast) { //最后一关开启某个大关卡时 先显示通关奖励,否则就显示通关或者开启下一关
            //是否有新大关卡解锁
            nextOpenInfo = app.bigLevelPassCallBack(app.globalData.biglevel, app.globalData.levelId, app.globalData.levelType);
          }
          //弹出框标题
          var title = (nextOpenInfo != null && nextOpenInfo.isOpen) ? '开启新关卡' :
            (isLast ? '终结所有关卡' : (
              (that.data.perfectCnt >= that.data.perfectMax || isLessStep) ? '最少步数过关' : '过关'));
          //通关或者解锁下一个大关卡时出现的图标
          var specialIcon = './../../Resources/common/awardN.png';
          var nextLeveltitle = '';
          var continueType = consts.OPEN_LEVELS;
          var sharePro = '';//分享次数进度
          var newLvName = "";//新关卡开启之后的展示(包含进度)
          if (isLast) {
            if (app.globalData.levelType == consts.LEVELTYPE_COLORFULLEVEL) {
              specialIcon = './../../Resources/common/zuanshi_big.png';
              var targetPackageCount = app.globalData.colorfulLevelConfig.targetPackageCount;
              var currentRewardCount = app.globalData.colorfulLevelConfig.levelList[app.globalData.biglevel].rewardCount;
              if (isFirstPass) {
                app.globalData.otherInfo.colorfulLevel.finishPackage = Math.min(
                  app.globalData.otherInfo.colorfulLevel.finishPackage + 1, targetPackageCount);
                app.globalData.sessCheckMax = 0;
                app.setUserData(app.globalData.openIdKey, consts.TYPE_OTHER, JSON.stringify(app.globalData.otherInfo).toString());

                if (!app.globalData.baseInfo.diam) {
                  app.globalData.baseInfo.diam = 0;
                }
                app.globalData.baseInfo.diam += currentRewardCount;
                app.globalData.sessCheckMax = 0;
                app.setUserData(app.globalData.openIdKey, consts.TYPE_BASE, JSON.stringify(app.globalData.baseInfo).toString());
                console.log("多彩包奖励！！！！");
              }
              that.setData({
                currentColorfulPackage: app.globalData.otherInfo.colorfulLevel.finishPackage,
                totalColorfulPackage: targetPackageCount,
                awardPic: "../../Resources/common/diamondbox.png",
                colorfulRewardCount: currentRewardCount,
                diams: app.globalData.baseInfo.diam
              });
            }
            else if (app.globalData.levelType != consts.LEVELTYPE_NORMAL) {
              specialIcon = './../../Resources/common/awardS.png';
            }
          } else if (nextOpenInfo.isOpen) {
            specialIcon = './img/newN.png';
            if (app.globalData.levelType == consts.LEVELTYPE_TOWER) {// 高塔模式
              specialIcon = './img/new1.png';
            } else if (app.globalData.levelType == consts.LEVELTYPE_BEECOMB) {//蜂窝模式
              specialIcon = './img/new2.png';
            }
            var typeL = nextOpenInfo.levelType;
            var openConfig = app.globalData.levelOpenConfig[typeL][nextOpenInfo.biglevel];
            nextLeveltitle = openConfig.name + '关卡包';

            var levelCnts = 0;

            if (app.globalData.levelType == consts.LEVELTYPE_NORMAL) {
              levelCnts = app.globalData.levelContent[nextOpenInfo.biglevel].levelnum;
            } else {
              var mm = 0;
              while (mm < app.globalData.levelContent[nextOpenInfo.biglevel].c.length) {
                levelCnts += app.globalData.levelContent[nextOpenInfo.biglevel].c[mm].levelnum;
                mm++;
              }
            }
            newLvName = nextLeveltitle + "(0/" + levelCnts + ")";

            continueType = openConfig.openType;
            if (continueType == consts.OPEN_LEVELS_SHARE) {
              var levelShared = app.globalData.baseInfo.lvSharedCnt;//已经分享了多少次
              if (levelShared == null || (typeof (levelShared)) == 'undefined') {
                levelShared = [];
              }
              if (levelShared[typeL] == null || (typeof (levelShared[typeL])) == 'undefined') {
                levelShared[typeL] = [];
              }
              sharePro = levelShared[typeL][nextOpenInfo.biglevel] + '/' + openConfig.openCondition[2];
            }
          }

          that.setData({
            newLvName: newLvName,
            continueType: continueType,
            useTimeMinute: (duration / 1000.0).toFixed(1),
            useTime: costStep,
            overRide: overover,
            isLessStep: isLessStep,
            lvName: app.globalData.levelOpenConfig[app.globalData.levelType][app.globalData.biglevel].name,
            needShareCnt: sharePro,//需要解锁后分享几次
            specialIcon: specialIcon,
            isNewTypeOpen: isLast ? false : nextOpenInfo.isOpen,
            nextLeveltitle: nextLeveltitle,
            isLevelClear: isLast,
            isGameOver: true,
            isBonus: app.globalData.isBonus,
            dialogTitle: title,
            shareRegard: shareCnt,
          });
        }
        updatingOverData = true;
        ////////////////////////////////关卡数累加////////////////////////////
        setTimeout(function () {
          var before = app.globalData.levelId;
          app.globalData.levelId++;//小关卡id累加
          var next = app.globalData.levelId;
          // app.globalData.levelbiglittle++;

          if (app.globalData.levelType == consts.LEVELTYPE_NORMAL) {
            if (app.globalData.levelId > app.globalData.levelContent[app.globalData.biglevel].levelnum) {
              app.globalData.biglevel++;
              app.globalData.levelId = 1;
              if (app.globalData.biglevel > app.globalData.levelContent.length - 1) {
                app.globalData.biglevel = 0;
                // app.globalData.levelbiglittle = 1;
              }
            }
          } else {
            //特殊关卡处理
            app.globalData.sLevelId++;//小关卡id累加
            if (app.globalData.sLevelId > app.globalData.levelContent[app.globalData.biglevel].c[app.globalData.sBiglevel].levelnum) {
              app.globalData.sBiglevel++;
              app.globalData.sLevelId = 1;
              if (app.globalData.sBiglevel > app.globalData.levelContent[app.globalData.biglevel].c.length - 1) {
                app.globalData.biglevel++;
                app.globalData.levelId = 1;
                app.globalData.sBiglevel = 0;
                app.globalData.sLevelId = 1;
                if (app.globalData.biglevel > app.globalData.levelContent.length - 1) {
                  app.globalData.biglevel = 0;
                  app.globalData.sBiglevel = 0;
                  app.globalData.sLevelId = 1;
                  // app.globalData.levelbiglittle = 1;
                }
              }
            }
          }

          //更新关卡存档数据
          var baseInfo = new Object();
          var isbiggest = false;
          if (app.globalData.baseInfo != null) {
            baseInfo = app.globalData.baseInfo;
          }
          if (baseInfo.levelProgress[app.globalData.levelType][that.data.biglevel] < next) {
            //数据统计____每关第一次通关时上传 1004
            var Str = app.globalData.levelType + "_" + (that.data.biglevel + 1) + "_" + before + "关";
            // console.log(Str);
            app.tdsdk.event({
              id: 'user_levelclear',
              label: '每关第一次通关',
              params: {
                userleverclear: app.globalData.baseInfo.loginTime + "," + Str
              }
            });
            //每关的游戏时长 1006
            app.tdsdk.event({
              id: 'user_level_duration',
              label: '每关的游戏时长',
              params: {
                user_level_duration: Str + "_" + that.data.useTimeMinute,
              }
            });
            // 每关的步数/线条数系数
            app.tdsdk.event({
              id: 'user_level_step',
              label: '每关的步数除以线条数',
              params: {
                step: costStep / point.length,
              }
            });
            baseInfo.levelProgress[app.globalData.levelType][baseInfo.biglevel] = next;
            isbiggest = true;
          }
          if ((baseInfo.levelProgress[app.globalData.levelType][app.globalData.biglevel] < app.globalData.levelId)) {
            baseInfo.levelId = app.globalData.levelId;
            baseInfo.biglevel = app.globalData.biglevel;
            // baseInfo.levelbiglittle = app.globalData.levelbiglittle;
            baseInfo.levelProgress[app.globalData.levelType][app.globalData.biglevel] = baseInfo.levelId;
            isbiggest = true;
          }
          var newscore = baseInfo.biglevel * 1000 + baseInfo.levelId;
          if (newscore > baseInfo.score) {
            baseInfo.score = newscore;
            isbiggest = true;
          }
          baseInfo.tili = app.globalData.tili;
          utilLog(JSON.stringify(baseInfo).toString());
          if (isbiggest) {
            app.globalData.sessCheckMax = 0;
            app.setUserData(app.globalData.openIdKey, consts.TYPE_BASE, JSON.stringify(baseInfo).toString());
          }
          updatingOverData = false;
        }, 500);
        /////////////////////////////////////////////////////////////////
      }, 400);
    }
  },

  //把剩余没有连上的格子随机给一些颜色块的动画提示
  drawLeftColorChess: function (leftChessArr) {
    //每一个点随机一个颜色
    if (leftChessArr == null || leftChessArr.length < 1) {
      return false;
    }
    for (var i = 0; i < leftChessArr.length; i++) {

      context.beginPath();
      context.setFillStyle(leftChessArr[i][2]);
      context.setFontSize(20);
      context.setLineWidth(imgHeight);
      context.setTextAlign('center');

      var x = Number(leftChessArr[i][1]);
      var y = Number(leftChessArr[i][0]);

      context.rect(
        deltaStartX + (x) * imgWidth,
        deltaStartY + (y) * imgHeight,
        imgWidth, imgHeight);
      // context.draw('?'  ,
      //   deltaStartX + offStartX + imgWidth * Number(leftChessArr[i][1]),
      //   deltaStartY + (offPointY + offStartY) + imgHeight * Number(leftChessArr[i][0]) )     
      context.closePath();
      context.fill();
    }
    return true;
  },

  updateRankList: function (duration) {
    var list = [];
    if (app.globalData.friendRankList == null) {
      app.globalData.friendRankList = [];
    }
    //好友列表排序
    //每次排序时先把自己的分数和关卡更新下

    //先过滤一遍玩过这关的好友有哪些,没有数据的不参加排名
    var curlevelRank = [];// app.globalData.friendRankList;
    var timeKey = app.globalData.biglevel + "_" + app.globalData.levelId;
    var timeStepKey = timeKey + "_step";
    for (var i = 0; i < app.globalData.friendRankList.length; i++) {
      var item = app.globalData.friendRankList[i];
      var progressC = item.values[0];
      var dataC = item.values[2];
      var compareData = null;
      var proC = null;
      if (dataC != null && dataC.data != null) {
        compareData = JSON.parse(dataC.data);
      }
      if (progressC != null && progressC.data != null) {
        proC = JSON.parse(progressC.data);
      }

      if ((item.key == app.globalData.openIdKey) && app.globalData.userInfo != null && (item.values[1].data == null || typeof (item.values[1].data) == 'undefined')) {
        item.values[1].data = app.globalData.userInfo;
      }
      if ((item.key != app.globalData.openIdKey) && (item.values.length < 3
        || item.values[1].data == null//用户的微信头像信息没有时,也不用展示了
        || typeof (item.values[1].data) == 'undefined'
        || item.values[2].data == null
        || compareData[timeStepKey] == null || typeof (compareData[timeStepKey]) == 'undefined' ||
        progressC == null || typeof (progressC) == 'undefined' ||
        proC.levelProgress == null || proC.levelProgress[app.globalData.levelType] == null ||
        proC.levelProgress[app.globalData.levelType][app.globalData.biglevel] == null ||
        typeof (proC.levelProgress[app.globalData.levelType][app.globalData.biglevel]) == 'undefined' || proC.levelProgress[app.globalData.levelType][app.globalData.biglevel] < 1
      )) {
        continue;
      }

      curlevelRank.push(item);
    }

    if (curlevelRank == null || curlevelRank.length < 2) {
      if (app.globalData.userInfo != null) {
        var arr = [];
        var item = new rankStruct();
        var minute = Math.floor(duration / 60000);
        var second = ((duration / 1000) % 60).toFixed(2);
        item.setRankData(
          (1),
          app.globalData.userInfo.avatarUrl, app.globalData.userInfo.nickName,
          app.globalData.score, 0,// app.globalData.levelbiglittle,
          minute, second, costStep
        );
        arr[0] = item;
        that.setData({
          myRankId: 1,
          curRankItems: arr,
        });
      }
    } else {

      if (curlevelRank[0].values.length >= 2 && curlevelRank[0].values[2].data != null) {
        var ata = JSON.parse(curlevelRank[0].values[0].data);
        var timeCost = JSON.parse(curlevelRank[0].values[2].data);
        if (timeCost != null)//增加了数据判断,以及排序时的存档有效性判断
        {
          ata.score = app.globalData.score;
          // ata.levelbiglittle = app.globalData.levelbiglittle;
          var timeKey;
          if (app.globalData.levelType != consts.LEVELTYPE_NORMAL) {
            timeKey = app.globalData.levelType + "_" + app.globalData.biglevel + "_" + app.globalData.levelId;
          } else {
            timeKey = app.globalData.biglevel + "_" + app.globalData.levelId;
          }

          var timeStepKey = timeKey + "_step";
          var curcost = timeCost[timeKey];
          if (typeof (curcost) == "undefined" || curcost > duration) {
            timeCost[timeKey] = duration;//更新一下时间
          }
          if (typeof (timeCost[timeStepKey]) == "undefined" || timeCost[timeStepKey] > costStep) {
            timeCost[timeStepKey] = costStep;//更新下步数
          }


          // app.globalData.friendRankList[0].values[0].data = JSON.stringify(ata);
          curlevelRank[0].values[2].data = JSON.stringify(timeCost);
          //步数相同时去时间长短
          curlevelRank.sort(function (a, b) {
            var dataA = JSON.parse(a.values[2].data);
            var dataB = JSON.parse(b.values[2].data);

            if (typeof (dataA[timeStepKey]) == "undefined" || (typeof (dataB[timeStepKey]) != "undefined" && dataA[timeStepKey] < dataB[timeStepKey])) {
              return -1;
            } else if (typeof (dataB[timeStepKey]) == "undefined" || (typeof (dataA[timeStepKey]) != "undefined" && (dataA[timeStepKey] > dataB[timeStepKey]))) {
              return 1;
            } else {
              if (typeof (dataA[timeKey]) == "undefined" || (dataB[timeKey] != "undefined" && dataA[timeKey] < dataB[timeKey])) {
                return -1;
              } else if (typeof (dataB[timeKey]) == "undefined" || (typeof (dataA[timeKey]) != "undefined" && dataA[timeKey] > dataB[timeKey])) {
                return 1;
              }
              return 0;
            }
          });
        }
      }

      var myRank = 0;
      var getCur = false;
      for (var i = 0; i < curlevelRank.length; i++) {
        var item = new rankStruct();
        var timeInfo = JSON.parse(curlevelRank[i].values[2].data);
        var wxinfo = JSON.parse(curlevelRank[i].values[1].data);
        if (wxinfo == null || typeof (wxinfo) == 'undefined') {
          continue;
        }
        var baseinfo = JSON.parse(curlevelRank[i].values[0].data);
        if (app.globalData.openIdKey == curlevelRank[i].key) {
          myRank = (i + 1);
          getCur = true;
        }
        var minute = -1;
        var second = -1;
        if (typeof (timeInfo[timeKey]) != "undefined") {
          minute = timeInfo[timeKey] / 60000;
          second = timeInfo[timeKey] % 60000;
        }
        utilLog("时间分数:" + minute + "分" + second);
        item.setRankData(
          (i + 1),
          wxinfo.avatarUrl, wxinfo.nickName,
          baseinfo.score, 0,// baseinfo.levelbiglittle,
          minute, second, timeInfo[timeStepKey]
        );
        list[i] = (item);
        if (getCur && myRank == (i - 1)) {
          break;//已经得到当前的排名的前一个和后一个就够了,结算只展示这三个
        }
      }
      var temp = null;
      if (list.length <= 3) {
        temp = list;
      } else {
        if (myRank == 1) {
          temp = list.slice(0, 3);
        } else {
          temp = list.slice(myRank - 2, (myRank + 1));
        }
      }

      if (curlevelRank.length > 0) {
        that.setData({
          myRankId: myRank,
          curRankItems: temp,
        });
      }
    }
  },


  resetWidthHeight: function (boardSize) {
    imgWidth = boardSize / chessSize;
    imgHeight = boardSize / chessSizeH;

    startX = imgWidth / 2;
    startY = startX * imgHeight / imgWidth;
    if (startX > startY) {
      radis = startY;
    } else {
      radis = startX;
    }

    lineWidth = radis / 1.5;///2.0;

    offStartX = (imgWidth + screenScale) / 2;
    offStartY = offStartX * imgHeight / imgWidth;

    // offPointX = offPointX * screenScale;
    offPointY = offPointX * imgHeight / imgWidth;
    // offRextX = offRextX * screenScale;
    offRextY = offRextX * imgHeight / imgWidth;//offRextY * screenScale;

    //如果宽高不一样的时候,按最小的来,这样每一个格子都是方形的
    if (imgWidth > imgHeight) {//高度格子数>宽度格子

      imgWidth = imgHeight;
      offStartX = (imgWidth + screenScale) / 2;
      deltaStartX = posDeltaStartX;
      deltaStartX += ((boardSize) - 64 * screenScale - imgWidth * chessSize) / 2.0;
    } else if (imgWidth < imgHeight) {//宽度格子数>高度格子      
      imgHeight = imgWidth;
      deltaStartY = 4;
      deltaStartY += (boardSize - imgHeight * chessSizeH) / 2.0;
      offStartY = offStartX * imgHeight / imgWidth;
    }
    else {
      deltaStartX = posDeltaStartX;
      deltaStartY = 4;
    }
    var hei = (imgHeight * chessSizeH / (screenScale) * 2 + 16 * screenScale);
    // utilLog("canvas 高度:", hei);
    // utilLog("屏幕高度:", that.data.screenHeight);
    that.setData({
      canvasHeight: hei,
    });

  },
  //下一局开始前数据reset
  resetGameParam: function (levelid, isShow) {
    // return;
    timeStart = new Date();
    isWin = false;
    isTouchDown = false;
    updatingOverData = false;
    touchX = 0;
    touchY = 0;
    techStep = 0;
    app.globalData.techId = 0;
    prePosX = -1;
    prePosY = -1;
    curColor = -1;
    costStep = 0;
    that.setData({
      costStep: costStep,
    });
    lastStepColor = -1;
    // drawLineAgain = true;
    //////////////////////测试新手引导///////////////////////
    if (levelid == 1 && app.globalData.biglevel == 0 && app.globalData.levelType == consts.LEVELTYPE_NORMAL) {
      app.globalData.isTeach = true;
    } else {
      app.globalData.isTeach = false;
    }
    //////////////////////////////////////////////////////

    if (isShow) {
      that.initDataParam(levelid);
      ///////////bonus关卡////////////////////////////
      // var bonusItem = app.globalData.bonusCfg[(app.globalData.levelType + "_" + (app.globalData.biglevel) + "_" + app.globalData.levelId)];
      // if (bonusItem == null || typeof(bonusItem) =='undefined'){
      //   app.globalData.isBonus = false;
      //   that.setData({
      //     isBonus: false,
      //   })
      // }else{
      //   app.globalData.isBonus = true;
      //   utilLog("开启领取界面");
      //   that.setData({
      //     isBonus: true,
      //   })
      //   if (that.data.isBonus) {
      //     setTimeout(() => {
      //       that.setData({
      //         isBonus: false,
      //       })
      //     }, 2000);
      //   }
      // }
      // console.log("isBonus**************", bonusItem)      
      /////////////////////////////////////////////////////////
      if (contextbg == null) {
        notShareBack = true;
        contextbg = wx.createCanvasContext("canvasbg");
      }
      if (chess_C != null) {
        chess_C.reset(contextbg, 1,
          imgWidth, imgWidth / 2, imgHeight / 2, 13,
          imgWidth * chessSize, imgHeight * chessSizeH,
          imgWidth, imgHeight,
          deltaStartX, deltaStartY,
          chessSizeH, chessSize,
          1.5, '#e3d5b7',
          '#f0e7d2',
          point, pointColor
        );
      }
      that.setData({
        isGameOver: false,
      });
    } else {
      if (timer != null) {
        clearInterval(timer);
      }
    }
    that.drawFixedBG();
    if (context != null) {
      context.draw();
    }
    drawLineAgain = true;
    that.drawAll();
  },
  //游戏开始数据初始化
  initDataParam: function (levelid) {
    // console.log("大关卡:" + app.globalData.biglevel + "小关卡:" + levelid);
    // //测试新关卡的数据的正确性
    var levelData = null;
    if (app.globalData.levelType == consts.LEVELTYPE_NORMAL) {
      levelData = app.globalData.levelContent[app.globalData.biglevel].levels[levelid];
    } else {
      levelData = app.globalData.levelContent[app.globalData.biglevel].c[app.globalData.sBiglevel].levels[levelid];
    }

    curLvSkin = app.globalData.otherInfo.curSkin;
    if (curLvSkin == 1) {//1表示随机,可以每关随机一个已经有的皮肤
      // console.log("皮肤", app.globalData.otherInfo.skinState);
      var alreadyhave = [];
      for (var i in app.globalData.otherInfo.skinState) {
        var _i = app.globalData.otherInfo.skinState[i];
        var keyInt = Number(i)
        if (_i[0] >= 2 && keyInt > 1) {
          alreadyhave.push(app.globalData.skinConfig["skin" + (keyInt + 1)]);
        }
      }
      if (alreadyhave.length > 0) {
        if (Math.random() > (1 / (alreadyhave.length + 1))) {
          curLvSkin = alreadyhave[Math.floor(Math.random() * alreadyhave.length)].id - 1;
        } else {
          curLvSkin = 0;
        }
      } else {
        curLvSkin = 0;
      }
    }
    // console.log(levelData);
    var coin = 100;
    var diam = 0;
    if (app.globalData.baseInfo != null && typeof (app.globalData.baseInfo.coinNum) != "undefined") {
      coin = app.globalData.baseInfo.coinNum;
    }
    if (app.globalData.baseInfo != null && typeof (app.globalData.baseInfo.diam) != "undefined") {
      diam = app.globalData.baseInfo.diam;
    }
    var bigName = '';
    if (app.globalData.levelType == consts.LEVELTYPE_NORMAL) {
      bigName = app.globalData.levelContent[app.globalData.biglevel].levelname;
    } else {
      bigName = app.globalData.levelContent[app.globalData.biglevel].c[app.globalData.sBiglevel].levelname;
    }
    that.setData({
      biglevelName: bigName,
      levelId: app.globalData.levelId,
      biglevel: app.globalData.biglevel,
      coins: coin,//当前的金币数目
      diams: diam,//钻石数
      tipCost: app.globalData.gameConfig.tipCost,//提示的时候消耗
    });

    answer = [];
    //重新解析配置levelData.a;//答案
    for (var i = 0; i < levelData.a.length; i++) {
      var item = [];
      var str_ans = levelData.a[i];
      var len = Math.ceil(str_ans.length / 2);
      for (var j = 0; j < len; j++) {
        item[j] = [];
        var strItem = str_ans.substr(j * 2, 2);
        item[j][0] = parseInt("0x" + strItem.substr(0, 1));
        item[j][1] = parseInt("0x" + strItem.substr(1, 1));
      }
      answer[i] = item;
    }

    answerColorList = [];
    equalAnserList = [];

    point = levelData.c;
    chessSize = levelData.s[0];
    chessSizeH = levelData.s[1];
    if (chessSizeH > chessSize) {
      boardSize = 390 * screenScale;
    }
    that.resetWidthHeight(boardSize);
    var colorLen = point.length;
    colorQueue = [];//初始化
    colorQueueGrid = [];
    var colorQueueLen = colorLen;
    for (var i = 0; i < colorQueueLen; i++) {
      if (colorQueue[point[i].c.toString()] == null) {
        colorQueue[point[i].c.toString()] = new Array();
      }
      colorQueue[point[i].c.toString()] = [];//.slice(0, colorQueue[i].length-1);
    }
    that.resetAllConflict();

    chess = [];//初始化
    for (var i = 0; i < chessSizeH; i++) {
      if (chess[i] == null) {
        chess[i] = new Array();
      }
      chess[i] = [];
      for (var j = 0; j < chessSize; j++) {
        chess[i][j] = 0;
      }
    }
    that.updateChessNumber();
    timer = setInterval(
      function () {
        that.drawAll();
      }, 17);
  },

  // 按钮的各个点击事件
  clickToMenu: function () {
    app.playClickSound();
    if (updatingOverData) {
      return;
    }
    notShareBack = true;
    wx.navigateBack({ // wx.navigateTo({
      url: '../biglevel/biglevel'
      // (app.globalData.gameConfig.tiliRecoverySpeed - ((new Date()) - app.globalData.comeInTime))
      ,
    })
  },
  //重新开始游戏
  clickResetGame: function () {
    app.playClickSound();
    if (app.globalData.isTeach) {
      return;
    }
    if (app.globalData.levelType == consts.LEVELTYPE_NORMAL) {
      that.resetGameParam(app.globalData.levelId, true);
    } else {
      that.resetGameParam(app.globalData.sLevelId, true);
    }
  },

  //点击音效
  clickMusic: function () {
    if (app.globalData.musicOn) {
      app.globalData.musicOn = false;
    } else {
      app.globalData.musicOn = true;
    }
    // if (!app.globalData.baseInfo.hasOwnProperty("musicByte")) {
    // }
    app.globalData.baseInfo.musicByte = app.globalData.musicOn;
    app.playClickSound();
    that.setData({
      isMusicOn: app.globalData.musicOn
    })
  },
  //求助好友,提示
  clickBtn: function (options) {
    if (app.globalData.isTeach) {
      return;
    }
    app.playClickSound();
    var clickIndex = options.currentTarget.dataset.id;
    if (that.data.errorTip == 'unhidden') {
      that.setData({
        errorTip: 'hidden',
      });
      colorLeftArr = null;
      if (leftColorTimer != null) {
        clearInterval(leftColorTimer);
        leftColorTimer = null;
      }
    }
    if (clickIndex == 1) {//求助好友
      utilLog("求助好友");
    } else if (clickIndex == 2) {//提示
      var dat = new Date();
      if (app.globalData.baseInfo.coinNum < app.globalData.gameConfig.tipCost) {

        var shareDta = app.globalData.recordDatas[app.globalData.biglevel + "_" + app.globalData.levelId + "_shareTip"];
        if (typeof (shareDta) == "undefined" || shareDta < 1 && app.globalData.curDayTipCoinLeft > 0) {
          //局内使用金币次数 1007
          app.tdsdk.event({
            id: 'use_coin_time',
            label: '局内使用金币次数',
            params: {
              use_coin_time: that.getLevelIntroduce()
            }
          });
          that.setData({
            showDialog: true,
            pauseCanvas: true,
            dialogId: 4,
            alpha: 0.7,
            maxProp: app.globalData.gameConfig.maxCoinTipPerDay,
            leftProp: (app.globalData.gameConfig.maxCoinTipPerDay - app.globalData.curDayTipCoinLeft),
            shareOrNot: "share",
            iconProp: "./../../Resources/common/jinbi.png",
            prop: '金币'
          });
        }
        else if (app.globalData.curDayTipCoinLeft <= 0) {
          that.setData({
            showDialog: true,
            pauseCanvas: true,
            dialogId: 4,
            alpha: 0.7,
            maxProp: app.globalData.gameConfig.maxCoinTipPerDay,
            leftProp: (app.globalData.gameConfig.maxCoinTipPerDay),
            shareOrNot: "unshare",
            iconProp: "./../../Resources/common/jinbi.png",
            prop: '金币'
          });
        }
        else {
          wx.showToast({
            title: '金币不足',
            image: './../../Resources/common/jinbi.png',
            mask: true
          });
        }
        return;
      } else {

        //给出提示线条_____只有给了提示之后才给扣金币
        if (that.giveTips()) {
          //局内使用金币次数 1007
          app.tdsdk.event({
            id: 'use_coin_time',
            label: '局内使用金币次数',
            params: {
              use_coin_time: that.getLevelIntroduce()
            }
          });
          app.globalData.baseInfo.coinNum -= app.globalData.gameConfig.tipCost;
          app.globalData.baseInfo.coinNum = Math.max(0, app.globalData.baseInfo.coinNum);
          that.setData({
            coins: app.globalData.baseInfo.coinNum,
          });
          app.globalData.sessCheckMax = 0;
          app.setUserData(app.globalData.openIdKey, consts.TYPE_BASE, JSON.stringify(app.globalData.baseInfo).toString());
        }
      }
    }
  },

  //给玩家一个提示线,该线条一旦出现不可被重置,也不可被改动
  giveTips: function () {

    if (isWin || answer == null)
      return false;
    var colorIndex = 0;
    var nextColor = 1;
    var anyLeft = false;
    for (var i in answer) {
      var id = Number(i);
      var indexof = answerColorList.indexOf((id + 1));
      // utilLog("查找到的id:" + indexof );
      if (indexof >= 0) {
        continue;
      }
      indexof = equalAnserList.indexOf((id + 1));//提示列表中没有不代表没有正确的路线---表示不提示已经正确的路线
      if (indexof >= 0) {
        continue;
      }
      anyLeft = true;
      colorIndex = Number(i);
      nextColor = (colorIndex + 1);
      break;//找到一个还没有添加到列表里的就行
    }

    if (!anyLeft || nextColor >= colorQueue.length) {
      // wx.showToast({   title: '结束', })
      return false;
    }
    if (!app.globalData.tiliCost) {
      nextColor = (Math.random() > 0.4) ? nextColor : nextColor + 1;
    }
    answerColorList.push(nextColor);//把下一条答案加入队列
    for (var i = 0; i < colorQueue[nextColor.toString()].length; i++) {
      var point = colorQueue[nextColor.toString()][i];
      chess[point[0]][point[1]] = 0;
    }
    colorQueue[nextColor.toString()] = [];
    for (var i = 0; i < answer[colorIndex].length; i++) {
      var pointitem = answer[colorIndex][i];

      for (var j = 1; j <= colorQueue.length; j++) {
        if (j == nextColor || colorQueue[j.toString()] == null || colorQueue[j.toString()].length < 2) {
          continue;
        }
        for (var m = 1; m < colorQueue[j.toString()].length; m++) {
          var colorItemPos = colorQueue[j.toString()][m];
          if (colorItemPos[0] == pointitem[0] && colorItemPos[1] == pointitem[1]) {
            that.clearPoint(pointitem[0], pointitem[1], j, false, true, false);
          }
        }
      }
      //加入队列前,需要把其他颜色的队列中的数据清除掉 needtoDo
      that.joinPoint(pointitem[0], pointitem[1], (nextColor));
      chess[pointitem[0]][pointitem[1]] = nextColor;
    }
    that.updateChessNumber();
    that.resetAllConflict();
    costStep++;
    that.setData({
      costStep: costStep,
    })
    setTimeout(function () {
      that.chargeAllRightFill();
    }, 40);
    return true;
  },

  //除了按钮以外的其他区域都添加,避免在出现绘制闪动提示时,性能差点的手机卡住
  clickBgs: function (ops) {
    if (that.data.errorTip == 'unhidden') {
      that.setData({
        errorTip: 'hidden',
      });
      colorLeftArr = null;
      if (leftColorTimer != null) {
        clearInterval(leftColorTimer);
        leftColorTimer = null;
      }
      drawLineAgain = true;
      that.drawAll();
    }
    // utilLog("请将线走满格!");
  },

  // 弹出框的各个按钮的点击逻辑
  //点击挑战好友
  clickChangeFriend: function () {
    app.playClickSound();
    utilLog("挑战好友");
  },

  //点击领取奖励界面的奖励 并直接进入下一关
  clickAwardNextLevel: function (ops) {
    console.log(" get all Rewards and continue!!");
    app.playClickSound();
    var bonusA_ = that.data.bonusAward;
    if (bonusA_ != null && app.globalData.isBonus &&
      (app.globalData.baseInfo.awardpro.length < bonusA_.id || typeof (app.globalData.baseInfo.awardpro[bonusA_.id - 1]) == 'undefined' || app.globalData.baseInfo.awardpro[bonusA_.id - 1] < 1)
    ) {
      console.log("奖励数据", bonusA_);
      if (ops == null && bonusA_.awardtype[0] < consts.AWARD_FRAG) {//分享领取双倍时的逻辑_只有金币或者钻石可以加双倍
        app.getAwardLogic(bonusA_.awardnum * 2, bonusA_.awardtype);
      } else {
        app.getAwardLogic(bonusA_.awardnum, bonusA_.awardtype);
      }
      app.globalData.baseInfo.awardpro[bonusA_.id - 1] = 1;
      app.globalData.bonusCfg[app.globalData.levelType + "_" + app.globalData.biglevel + "_" + app.globalData.levelId] = null;
    } else {
      console.log("error  点击领取奖励关卡数据error", bonusA_, app.globalData.bonusCfg);
    }
    that.clickNextLevel();
  },

  //点击下一关
  clickNextLevel: function () {
    utilLog("下一关");
    app.playClickSound();
    if (updatingOverData) {
      return;
    }
    if (app.globalData.levelType == consts.LEVELTYPE_NORMAL) {
      that.resetGameParam(app.globalData.levelId, true);
    } else {
      that.resetGameParam(app.globalData.sLevelId, true);
    }

    that.drawAll();
    app.globalData.isTeach = false;
    that.setData({
      shareRegard: app.globalData.gameConfig.shareReward,//炫耀一次得到的金币数量
    });
  },

  //提示界面点击取消
  clickCancle: function () {
    app.playClickSound();
    that.setData({
      showDialog: false,
      pauseCanvas: false,
    })

    if (that.data.isGameOver) {
      that.setData({
        isGameOver: false,
      })
      that.clickToMenu();//结束后体力不足,无法继续时,点击取消就直接退回首页
    } else {
      that.checkIsCanvasNull();
      drawLineAgain = true;
      that.drawFixedBG();
      that.drawAll();
    }
  },
  checkIsCanvasNull: function () {
    if (contextbg == null) {
      contextbg = wx.createCanvasContext("canvasbg");
    }
    if (context == null) {
      context = wx.createCanvasContext("canvas");
    }
    if (ctxCircle == null) {
      ctxCircle = wx.createCanvasContext("canvascircle");
    }
    if (notShareBack) {
      notShareBack = false;
      if (app.globalData.levelType == consts.LEVELTYPE_NORMAL) {
        that.resetGameParam(app.globalData.levelId, true);
      }
      else {
        that.resetGameParam(app.globalData.sLevelId, true);
      }
      if (techTimer == null) {
        prev = new Date();
      }
    }
    if (chess_C == null) {
      chess_C = new commonDraw(contextbg, 1,
        imgWidth, imgWidth / 2, imgHeight / 2, 13,
        imgWidth * chessSize, imgHeight * chessSizeH,
        imgWidth, imgHeight,
        deltaStartX, deltaStartY,
        chessSizeH, chessSize,
        1.5, '#e3d5b7',
        '#f0e7d2',
        point, pointColor
      );
      chess_C.draw(true, colorRandom);
    } else {
      chess_C.reset(contextbg, 1,
        imgWidth, imgWidth / 2, imgHeight / 2, 13,
        imgWidth * chessSize, imgHeight * chessSizeH,
        imgWidth, imgHeight,
        deltaStartX, deltaStartY,
        chessSizeH, chessSize,
        1.5, '#e3d5b7',
        '#f0e7d2',
        point, pointColor
      );
    }
  },
  //提示界面点击分享
  clickYes: function () {
    that.setData({
      showDialog: false,
      pauseCanvas: false,
    })
    app.playClickSound();
    // utilLog("点击分享");
    if (that.data.isGameOver) {
      that.setData({
        isGameOver: false,
      })
      that.clickToMenu();//结束后体力不足,无法继续时,点击取消就直接退回首页
    } else {
      that.drawFixedBG();
      drawLineAgain = true;
      that.drawAll();
    }
  },

  // 是否可以领取多彩包进度奖励
  canGetColorLevelProgressReward: function () {
    var targetPackageCount = app.globalData.colorfulLevelConfig.targetPackageCount;
    console.log("check", app.globalData.otherInfo.colorfulLevel.finishPackage, targetPackageCount);
    return app.globalData.otherInfo.colorfulLevel.finishPackage >= targetPackageCount;
  },

  //通关结束后弹出获得勋章时的 按钮
  clickContinue: function () {
    app.playClickSound();

    // 每日多彩包是否攒满进度条
    if (app.globalData.levelType == consts.LEVELTYPE_COLORFULLEVEL) {
      if (this.canGetColorLevelProgressReward()) {
        // 领取奖励
        var currentRewardCount = app.globalData.colorfulLevelConfig.rewardCount;
        app.globalData.baseInfo.diam += currentRewardCount;
        app.globalData.sessCheckMax = 0;
        app.setUserData(app.globalData.openIdKey, consts.TYPE_BASE, JSON.stringify(app.globalData.baseInfo).toString());
        console.log("多彩包大奖！！！");

        // 重置进度
        app.globalData.otherInfo.colorfulLevel.finishPackage = 0;
        app.globalData.sessCheckMax = 0;
        app.setUserData(app.globalData.openIdKey, consts.TYPE_OTHER, JSON.stringify(app.globalData.otherInfo).toString());

        that.setData({
          colorfulRewardCount: currentRewardCount,
          diams: app.globalData.baseInfo.diam,
          getColorfulPackage: true,
          isLevelClear: false,
          isGameOver: true,
          dialogTitle: "恭喜解锁",
        });
        return;
      }
    }

    if (this.data.getColorfulPackage) {
      that.setData({
        getColorfulPackage: false
      });
    }

    //是否有新大关卡解锁
    nextOpenInfo = app.bigLevelPassCallBack(that.data.biglevel, that.data.levelId, app.globalData.levelType);

    if (nextOpenInfo.isOpen) {//最后一关结束时还解锁了某一大关
      var title = '开启新关卡';
      //通关或者解锁下一个大关卡时出现的图标
      var specialIcon = './img/newN.png';
      var nextLeveltitle = '';
      if (app.globalData.levelType == consts.LEVELTYPE_TOWER) {// 高塔模式
        specialIcon = './img/new1.png';
      } else if (app.globalData.levelType == consts.LEVELTYPE_BEECOMB) {//蜂窝模式
        specialIcon = './img/new2.png';
      }
      var typeL = nextOpenInfo.levelType;
      var openConfig = app.globalData.levelOpenConfig[typeL][nextOpenInfo.biglevel];
      nextLeveltitle = openConfig.name + '关卡包';
      //最后一关开启某个大关卡时 先显示通关奖励      
      //2分享,1通关,0开放, 3通关加分享, 4 分享加通关      
      var continueType = openConfig.openType;


      var sharePro = '';
      if (continueType == consts.OPEN_LEVELS_SHARE) {
        var levelShared = app.globalData.baseInfo.lvSharedCnt;//已经分享了多少次
        if (levelShared == null || (typeof (levelShared)) == 'undefined') {
          levelShared = [];
        }
        if (levelShared[typeL] == null || (typeof (levelShared[typeL])) == 'undefined') {
          levelShared[typeL] = [];
        }
        var cur = levelShared[typeL][nextOpenInfo.biglevel];
        if (cur == null || typeof (cur) == 'undefined') {
          cur = 0;
        }
        var need = openConfig.openCondition[2];
        sharePro = cur + '/' + need;
        if (cur >= need) {
          continueType = 0;
        }
      }

      var levelCnts = 0;

      if (app.globalData.levelType == consts.LEVELTYPE_NORMAL) {
        levelCnts = app.globalData.levelContent[nextOpenInfo.biglevel].levelnum;
      } else {
        var mm = 0;
        while (mm < app.globalData.levelContent[nextOpenInfo.biglevel].c.length) {
          levelCnts += app.globalData.levelContent[nextOpenInfo.biglevel].c[mm].levelnum;
          mm++;
        }
      }
      var newLvName = nextLeveltitle + "(0/" + levelCnts + ")";

      that.setData({
        newLvName: newLvName,
        continueType: continueType,
        needShareCnt: sharePro,//需要解锁后分享几次
        specialIcon: specialIcon,
        isNewTypeOpen: nextOpenInfo.isOpen,
        nextLeveltitle: nextLeveltitle,
        isLevelClear: false,
        isGameOver: true,
        isBonus: app.globalData.isBonus,
        dialogTitle: title,
      });
    }
    else {//直接跳回选关界面
      var isAllClear = true;
      var progress = app.globalData.baseInfo.levelProgress;
      var arr = app.globalData.levelCntArr;
      if (progress == null || arr == null) {
        isAllClear = false;
      }
      else {
        for (var i = 0; i < progress.length; i++) {
          if (progress[i] == null) {
            isAllClear = false;
            break;
          }
          for (var j = 0; j < progress[i].length; j++) {
            if (!progress[i] || !progress[i][j] || !arr[i] || !arr[i][j] || progress[i][j] <= arr[i][j]) {
              isAllClear = false;
              break;
            }
          }
        }
      }
      if (isAllClear) {//全部通关时跳到更多好玩
        notShareBack = true;
        if (app.globalData.gameCollections != null && app.globalData.gameCollections.showType == 2) {
          wx.redirectTo({
            url: '../moregame/moregame',
          })
        }
        else {
          that.clickToMenu();
        }
      } else {
        that.clickToMenu();
      }
    }
  },

  //休息一下
  clickRest: function () {
    app.playClickSound();
    that.clickToMenu();
  },

  //下一关卡开启时的分享或者前往
  clickGoto: function (ops) {
    app.playClickSound();
    if (!nextOpenInfo.isOpen) {
      that.clickToMenu();
    } else {
      var config = app.globalData.levelOpenConfig[nextOpenInfo.levelType][nextOpenInfo.biglevel];
      if (config.openType == consts.OPEN_SHARE) {//需要分享解锁时,点击出现分享界面

      } else if (config.openType == consts.OPEN_LEVELS || config.openType == consts.OPEN_LEVELS_SHARE || config.openType == consts.OPEN_LEVELS_SHARE) {//打过某关,直接前往选关界面
        // that.clickToMenu();
        that.clickGotoNextNewLv(nextOpenInfo);
      }
    }
  },
  //新解锁的关卡点击前往时直接跳转到这个新解锁关卡的第一关
  clickGotoNextNewLv: function (nextOpenInfo) {
    app.globalData.biglevel = nextOpenInfo.biglevel;
    var max = 0;
    if (nextOpenInfo.levelType == consts.LEVELTYPE_TOWER) {
      max = app.globalData.levelContent[app.globalData.biglevel].c.length;
      app.globalData.levelId = app.globalData.baseInfo.levelProgress[nextOpenInfo.levelType][app.globalData.biglevel];
      if (app.globalData.levelId == -1) {
        app.globalData.levelId = 1;
      }
      //记录当前特殊关卡的id
      app.globalData.sBiglevel = 0;
      app.globalData.sLevelId = app.globalData.levelId;

      var allmax = 0;
      for (var i = 0; i < max; i++) {
        var small = allmax;
        var pre = allmax;
        allmax += app.globalData.levelContent[app.globalData.biglevel].c[i].levelnum;
        if ((i == max - 1) && (allmax < app.globalData.levelId)) {
          app.globalData.levelId = allmax;
          app.globalData.sLevelId = app.globalData.levelId;
        }
        if ((small < app.globalData.sLevelId) && (allmax >= app.globalData.sLevelId)) {
          app.globalData.sBiglevel = i;
          app.globalData.sLevelId = app.globalData.sLevelId - pre;
          if (app.globalData.sLevelId > app.globalData.levelContent[app.globalData.biglevel].c[i].length) {
            app.globalData.sLevelId = app.globalData.levelContent[app.globalData.biglevel].c[i].length;
          }
          break;
        }
      }
    } else {
      app.globalData.levelId = app.globalData.baseInfo.levelProgress[nextOpenInfo.levelType][app.globalData.biglevel];
      if (app.globalData.levelId > app.globalData.levelContent[app.globalData.biglevel].levelnum) {
        app.globalData.levelId = app.globalData.levelContent[app.globalData.biglevel].levelnum;
      }
      if (app.globalData.levelId <= 0) {
        app.globalData.levelId = 1;
        app.globalData.baseInfo.levelProgress[nextOpenInfo.levelType][app.globalData.biglevel] = 1;
      }
    }
    app.globalData.baseInfo.levelId = app.globalData.levelId;
    app.globalData.baseInfo.biglevel = app.globalData.biglevel;
    app.globalData.baseInfo.Lastplay[nextOpenInfo.levelType] = app.globalData.baseInfo.biglevel;
    that.clickNextLevel();
  },

  //点击分享解锁关卡
  clickLockShare: function () {
    app.playClickSound();
    utilLog("解锁分享");
    if (this.data.messageBox) {
      this.onCloseMessageBox();
    }
  },

  //点击炫耀成绩
  clickShare: function () {
    app.playClickSound();
    utilLog("炫耀成绩");
  },

  shareSuccessLogic: function (id, res) {

    utilLog("转发成功....." + id);
    prePosX = -1;
    prePosY = -1;
    if (id == null) {
      return;
    }

    utilLog("群分享1");
    if (id == 3 || id == 4) {//炫耀或者点击提示金币不足时点分享
      utilLog("群分享2");
      var shareKey = app.globalData.biglevel + "_" + app.globalData.levelId + "_share";
      if (id == 4) {
        shareKey = shareKey + "Tip";
      }
      var shareDta = app.globalData.recordDatas[shareKey];
      if (typeof (shareDta) == "undefined" || shareDta < 1) {

        app.globalData.recordDatas[shareKey] = 1;
        var valuesss = JSON.stringify(app.globalData.recordDatas).toString();
        try {
          wx.setStorageSync(consts.RECORD_RECORDS, valuesss);
        }
        catch (err) {
          console.log("setStorageSync", err);
        } finally {
          console.log("setStorageSync", "go");
        }

        var coinGet = app.globalData.gameConfig.shareReward;
        if (id == 3) {
          if (app.globalData.curDayCoinLeft > 0) {
            app.globalData.curDayCoinLeft -= app.globalData.gameConfig.shareReward;
            if (app.globalData.curDayCoinLeft < 0) {
              coinGet = app.globalData.curDayCoinLeft;
            }
            app.globalData.curDayCoinLeft = Math.max(0, app.globalData.curDayCoinLeft);
            var date = new Date();
            var keys = date.getFullYear() + "_" + date.getMonth() + "_" + date.getDate();
            app.globalData.LeftRecords[keys] = app.globalData.curDayCoinLeft;
            var valuesssss = JSON.stringify(app.globalData.LeftRecords)
            try {
              wx.setStorageSync(consts.RECORD_COINLEFT, valuesssss);
            }
            catch (err) {
              console.log("setStorageSync", err);
            } finally {
              console.log("setStorageSync", "go");
            }
          } else {
            coinGet = 0;
          }
        } else if (id == 4) {
          if (app.globalData.curDayTipCoinLeft > 0) {
            app.globalData.curDayTipCoinLeft -= app.globalData.gameConfig.shareReward;
            if (app.globalData.curDayTipCoinLeft < 0) {
              coinGet = app.globalData.curDayTipCoinLeft;
            }
            app.globalData.curDayTipCoinLeft = Math.max(0, app.globalData.curDayTipCoinLeft);
            var date = new Date();
            var keys = date.getFullYear() + "_" + date.getMonth() + "_" + date.getDate() + "_tips";
            app.globalData.LeftRecords[keys] = app.globalData.curDayTipCoinLeft;
            var valuesssss = JSON.stringify(app.globalData.LeftRecords)
            try {
              wx.setStorageSync(consts.RECORD_COINLEFT, valuesssss);
            }
            catch (err) {
              console.log("setStorageSync", err);
            } finally {
              console.log("setStorageSync", "go");
            }
          } else {
            coinGet = 0;
          }
          that.drawFixedBG();
          drawLineAgain = true;
          that.drawAll();
          notShareBack = false;
        }
        if (coinGet > 0) {
          app.globalData.baseInfo.coinNum += coinGet;
          // utilLog("增加后的金币:");
          // utilLog(app.globalData.baseInfo.coinNum);
          that.setData({
            coins: app.globalData.baseInfo.coinNum,
            shareRegard: 0,//分享结束后加金币的提示去除
          });
          app.globalData.sessCheckMax = 0;
          app.setUserData(app.globalData.openIdKey, consts.TYPE_BASE, JSON.stringify(app.globalData.baseInfo).toString());
          wx.showToast({
            title: '+' + coinGet,
            image: './../../Resources/common/jinbi.png',
            duration: 1000,
            mask: true
          })
        }
      }
    } else if (id == 1) {//求助好友
      utilLog("群分享3");
      var helpDta = app.globalData.recordDatas[app.globalData.biglevel + "_" + app.globalData.levelId + "_help"];
      if (typeof (helpDta) == "undefined" || helpDta < 1) {
        app.globalData.recordDatas[app.globalData.biglevel + "_" + app.globalData.levelId + "_help"] = 1;

        var valu = JSON.stringify(app.globalData.recordDatas);
        try {
          wx.setStorageSync(consts.RECORD_RECORDS, valu);
        }
        catch (err) {
          console.log("setStorageSync", err);
        } finally {
          console.log("setStorageSync", "go");
        }

        wx.showToast({
          title: '新提示',
          image: './img/tips.png',
          duration: 1000,
          mask: true
        })
        notShareBack = false;
        that.giveTips();
      } else {
        if (compVer(app.globalData.sdkV, '1.9.0') >= 0) {//icon:none 需要基础库位1.9.0以及以上的才支持
          wx.showToast({
            title: '每关只能通过分享获得一次提示',
            icon: 'none',
            duration: 2000,
            mask: true
          })
        } else {
          wx.showToast({
            title: '该功能每关一次',
            image: '../',
            duration: 2000,
            mask: true
          })
        }
      }
    } else if (id == 2) {//挑战好友
      utilLog("群分享4");
      app.tdsdk.event({
        id: 'challenge_friend',
        label: '挑战好友'
      });

    } else if (id == 6) {//解锁下一关时需要累积几个分享

      console.log("群分享5");
      //此时点击分享时只需要更新下界面中的需要分享几次的数据和按钮时前往还是分享
      if (!wx.showShareMenu) {//如果当前用户的基础库太低则无法正常拿到群分享id,就直接给一个成功的逻辑
        that.shareOverGet("12345", nextOpenInfo);
        return;
      }

      var shareTickets = res.shareTickets;
      if (!shareTickets || shareTickets.length == 0) {
        wx.showToast({
          title: "分享到群才能解锁",
          image: './../../Resources/common/suo2.png',
          duration: 2000,
        });
        return;
      }
      //延迟分享时不解锁问题
      var TimerLoading = setTimeout(function () {
        wx.showLoading({
          title: 'loading',
        })
      }, 500);
      var istimeOut = false;
      var TimerShare = setTimeout(function () {
        that.shareOverGet("12345", nextOpenInfo);
        istimeOut = true;
        clearTimeout(TimerShare);
        clearTimeout(TimerLoading);
        wx.hideLoading();
      }, 2000);
      wx.getShareInfo({
        shareTicket: shareTickets[0],
        fail: function (res) {
          console.log("群分享20", res);
        },
        complete: function (res) {
          utilLog("群分享1 ********complete", res);
        },
        success: function (res) {
          utilLog("群分享11", 11);
          clearTimeout(TimerShare);
          clearTimeout(TimerLoading);
          wx.hideLoading();
          if (istimeOut) {
            return;
          }
          //调用群分享解密
          wx.reportAnalytics('share_group', {
            state: 1,
          });
          wx.request({
            url: app.getBaseUrl() + 'decrypt' + '?gameId=' + consts.GAMEID,
            data: {
              iv: res.iv,
              encryptedData: res.encryptedData,
              sessionKey: app.globalData.sessionKey,
              gameId: consts.GAMEID,
              littleGameId: consts.GAMEID
            },
            fail: function (res) {
              utilLog("解密群失败", res);
              //调用群分享解密
              wx.reportAnalytics('share_group', {
                state: 0,
              });
            },
            complete: function (res) {
              utilLog("解密群 ********complate", res);
            },
            success: function (res) {
              utilLog("解密群成功", res);
              var groupId = res.data.openGId;
              that.shareOverGet(groupId, nextOpenInfo);
            },
          })
        }
      });
      utilLog("群分享********nothing", res);
    }
    else if (id == 8) {//bonus关卡的分享领取双倍
      that.clickAwardNextLevel(null);
    }
  },

  // 关闭走满空格提示框
  closeErrorBox: function () {
    this.setData({
      showErrorBox: false,
      errorTip: "hidden"
    });
    colorLeftArr = null;
    if (leftColorTimer != null) {
      clearInterval(leftColorTimer);
      leftColorTimer = null;
    }
    drawLineAgain = true;
    that.drawAll();
  },

  // 不再提示走满空格
  noMoreErrorBox: function () {
    this.closeErrorBox();
    try {
      wx.setStorageSync(consts.RECORD_ERRORBOX, 1);
    }
    catch (err) {
      console.log("setStorageSync", err);
    } finally {
      console.log("setStorageSync", "go");
    }
  },
  // 关闭提示框
  onCloseMessageBox: function () {
    this.setData({
      messageBox: null
    });
  },

  shareOverGet: function (groupId, nextOpenInfo) {
    if (app.shareGroupSuccess(groupId)) {
      var sharePro = '';
      var typeL = nextOpenInfo.levelType;
      var openConfig = app.globalData.levelOpenConfig[typeL][nextOpenInfo.biglevel];
      var continueType = openConfig.openType;
      if (continueType == consts.OPEN_LEVELS_SHARE) {
        var levelShared = app.globalData.baseInfo.lvSharedCnt;//已经分享了多少次
        if (levelShared == null || (typeof (levelShared)) == 'undefined') {
          levelShared = [];
        }
        if (levelShared[typeL] == null || (typeof (levelShared[typeL])) == 'undefined') {
          levelShared[typeL] = [];
        }
        var cur = levelShared[typeL][nextOpenInfo.biglevel];
        if (cur == null || typeof (cur) == 'undefined') {
          cur = 0;
        }
        cur++;
        levelShared[typeL][nextOpenInfo.biglevel] = cur;
        var need = openConfig.openCondition[2];
        sharePro = cur + '/' + need;
        if (cur >= need) {
          continueType = 0;
        }
      }
      app.globalData.baseInfo.lvSharedCnt = levelShared;
      app.globalData.sessCheckMax = 0;
      app.setUserData(app.globalData.openIdKey, consts.WX_BASE, JSON.stringify(app.globalData.baseInfo).toString());
      that.setData({
        continueType: continueType,
        needShareCnt: sharePro,//需要解锁后分享几次
      });
      if (!app.isIllegalGroupId(groupId)) {
        app.addShareGroup(groupId);
        app.globalData.sessCheckMax = 0;
        app.setUserData(app.globalData.openIdKey, consts.TYPE_BASE, JSON.stringify(app.globalData.baseInfo).toString());
      }
    } else {
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
    }
  },

  getLevelIntroduce() {
    return app.globalData.levelType + "_" + (app.globalData.biglevel + 1) + "_" + app.globalData.levelId + "关";
  },

  onShareAppMessage(ops) {
    utilLog("分享成绩");
    utilLog(ops);
    var id;
    var shareTp = 0;

    if (typeof (ops.target) == 'undefined') {// (ops.from == 'menu') {
      id = 2;
      shareTp = -1;
    } else {
      id = ops.target.dataset.id;
    }
    //1-求助好友, 2-挑战好友, 3-炫耀,4-金币不足时分享,6-结算时点击分享解锁关卡, 8bonus关卡分享领取双倍
    var that = this;

    var one = app.globalData.gameConfig.helpTitle;
    if (id == 2 || id == 3) {
      one = app.globalData.gameConfig.challengeTitle;
    }
    var random = Math.floor(Math.random() * one.length);
    if (id != null && id == 3) {
      return {
        title: one[random],
        path: '/pages/loading/loading?openId=' + app.globalData.openId + '&gameId=' + consts.GAMEID + '&imgId=炫耀',
        success(res) {
          notShareBack = false;
          //炫耀分享
          if (shareTp == -1) {//右上角
            app.tdsdk.event({
              id: 'game_original_share',
              label: '游戏界面普通分享'
            });
          } else {
            app.tdsdk.event({
              id: 'show_share',
              label: '游戏界面炫耀分享'
            });
          }
          that.shareSuccessLogic(id, res);
        },
        fail(res) {
          notShareBack = false;
          prePosX = -1;
          prePosY = -1;
        }
      }
    } else {
      var imgId = (Math.floor(Math.random() * 34) + 1);
      return {
        title: one[random],
        path: '/pages/loading/loading?openId=' + app.globalData.openId + '&gameId=' + consts.GAMEID + '&imgId=' + imgId,
        imageUrl: './../../Resources/share/' + imgId + '.jpg',
        success(res) {
          notShareBack = false;
          utilLog('群分享解锁 成功', res);
          //选关分享
          if (shareTp == -1) {//右上角
            if (id == 2) {//局内原始分享1019
              app.tdsdk.event({
                id: 'game_original_share',
                label: '游戏界面普通分享'
              });
            }
          } else {
            if (id == 1) {//局内分享提示(分享/提示)1013
              app.tdsdk.event({
                id: 'game_page_share',
                label: '局内分享提示(分享/提示)'
              });
            } else if (id == 2) {//普通结算好友分享//1016
              app.tdsdk.event({
                id: 'level_clear_share',
                label: '普通结算好友分享'
              });
            }
            else if (id == 4) {//金币不足分享提示 1014
              app.tdsdk.event({
                id: 'no_coin_share',
                label: '金币不足分享提示'
              });
            } else if (id == 6) {//关卡包解锁分享  解锁下一关时需要累积几个分享 1012
              //1表示是从选关界面中的分享,2表示从结算中点击分享解锁
              app.tdsdk.event({
                id: 'level_lock_share_game',
                label: '游戏界面解锁关卡分享'
              });
            }
          }
          that.shareSuccessLogic(id, res);
        },
        fail(res) {
          notShareBack = false;
          utilLog('群分享解锁 失败', res);
          prePosX = -1;
          prePosY = -1;
          if (id != null && (id == 4 || id == 1)) {
            that.drawFixedBG();
            drawLineAgain = true;
            that.drawAll();
          }
        }
      }
    }
  }
})

