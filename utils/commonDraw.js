//commonDraw.js
function ChessBoardDraw(
  canvas, screenScale,//画布,屏幕适配
  lineBoardS, lineOff_X, lineOff_Y, lineBigW,//画线条的偏移，粗细，间隔
  chessW, chessH,//棋盘 宽高
  i_w, i_h,//棋盘小格子的宽高,
  off_X, off_Y,//偏移,
  sizeW, sizeH,//宽高格子数目
  lineW, lineC,//棋盘线粗细,颜色
  chessBgC,//棋盘背景底色
  chessBoard,
  chessColor
) {
  this.canvas = canvas;
  this.screenScale = screenScale;//屏幕放缩
  this.chessW = chessW * screenScale;//canvas宽
  this.chessH = chessH * screenScale;//canvas高
  this.i_w = i_w * screenScale;
  this.i_h = i_h * screenScale;
  this.off_X = off_X;
  this.off_Y = off_Y;
  this.sizeW = sizeW;//格子数
  this.sizeH = sizeH;//格子数
  this.lineW = lineW;//棋盘线宽
  this.lineBigW = lineBigW;//连接线宽 
  this.lineC = lineC;//线条颜色
  this.chessBoard = chessBoard;//棋盘
  this.chessColor = chessColor;//棋盘的点颜色
  this.chessBgC = chessBgC;

  this.boardS = lineBoardS;//整个棋盘的单个格子size
  this.lineOff_X = lineOff_X;
  this.lineOff_Y = lineOff_Y;

}

ChessBoardDraw.prototype = {
  //初始化
  reset: function reset(canvas, screenScale,//画布,屏幕适配
    lineBoardS, lineOff_X, lineOff_Y, lineBigW,//画线条的偏移，粗细，间隔
    chessW, chessH,//棋盘 宽高
    i_w, i_h,//棋盘小格子的宽高,
    off_X, off_Y,//偏移,
    sizeW, sizeH,//宽高格子数目
    lineW, lineC,//棋盘线粗细,颜色
    chessBgC,//棋盘背景底色
    chessBoard,
    chessColor) {
    this.canvas = canvas;
    this.screenScale = screenScale;//屏幕放缩
    this.chessW = chessW * screenScale;//canvas宽
    this.chessH = chessH * screenScale;//canvas高
    this.i_w = i_w * screenScale;
    this.i_h = i_h * screenScale;
    this.off_X = off_X;
    this.off_Y = off_Y;
    this.sizeW = sizeW;//格子数
    this.sizeH = sizeH;//格子数
    this.lineW = lineW;//棋盘线宽
    this.lineBigW = lineBigW;//连接线宽 
    this.lineC = lineC;//线条颜色
    this.chessBoard = chessBoard;//棋盘
    this.chessColor = chessColor;//棋盘的点颜色
    this.chessBgC = chessBgC;

    this.boardS = lineBoardS;//整个棋盘的单个格子size
    this.lineOff_X = lineOff_X;
    this.lineOff_Y = lineOff_Y;
  },

  setCanvas: function setCanvas(canv) {
    this.canvas = canv;
  },

  getCanvas: function getCanvas() {
    return this.canvas;
  },

  //
  drawLineSix: function drawLineSix(colorTips, lineId, lineStep) {
    if (colorTips == null) {
      return;
    }
    //绘制线条

    var sideL = this.i_w / 1.89;
    var gapX = sideL * Math.sqrt(3);
    var gapY = 1.5 * sideL;
    var radius = this.i_w - 10;

    var x = 0;
    var y = 0;
    var i = lineId;
    var stepAll = (colorTips.length) - 1;
    this.canvas.setLineCap('round');
    this.canvas.setLineJoin('round');
    this.canvas.beginPath();
    this.canvas.setStrokeStyle(this.chessColor[i]);
    this.canvas.setLineWidth(this.lineBigW);

    var everypoint = [];
    var arr = [];
    var step = Math.min(stepAll, lineStep);
    var offX = 0;
    var offY = 0;


    var pointX = Math.floor(colorTips[0][1]);
    var pointY = Math.floor(colorTips[0][0]);
    if (pointX % 2 == 1) {
      offX = -gapX / 2;
    } else {
      offX = 0;
    }

    var pos = [(this.lineOff_X + gapY * (pointX) - this.lineBigW / 2),
    ((gapX * (pointY)) + offX + this.lineOff_Y)];
    x = pos[0];
    y = pos[1];

    this.canvas.moveTo(x, y);

    for (var j = 0; j <= step; j++) {
      if (colorTips[tmp][1] % 2 == 1) {
        offX = -gapX / 2;
      } else {
        offX = 0;
      }
      var pointX = Math.floor(colorTips[j][1]);
      var pointY = Math.floor(colorTips[j][0]);
      pos = [(this.lineOff_X + gapY * (pointX) - this.lineBigW / 2),
      (gapX * (pointY) + offX + this.lineOff_Y)];
      x = pos[0];
      y = pos[1];
      // console.log(colorTips[j][1] + "_" + colorTips[j][0]);
      this.canvas.lineTo(x, y);
    }
    this.canvas.moveTo(x, y);
    this.canvas.closePath();
    this.canvas.stroke();
    this.canvas.draw(true);
    return pos;
  },

  //绘制棋盘 棋子
  drawSix: function drawSix() {
    if (this.canvas == null)
      return;
    //绘制格子
    var sideL = this.i_w / 1.89;
    var gapX = sideL * Math.sqrt(3);
    var gapY = 1.5 * sideL;
    var radius = this.i_w - 10;
    for (var i = 0; i < this.sizeH; i++) {
      var offX = 0;
      for (var m = 0; m < this.sizeW; m++) {
        if (m % 2 == 1) {
          offX = -gapX / 2;
        } else {
          offX = 0;
        }
        var pos = [(this.off_Y + gapY * (m + 1)), (gapX * (i + 0.98) + offX + this.off_X)];
        var six = this.getSixPoint(pos, sideL);
        this.canvas.beginPath();
        this.canvas.setLineWidth(this.lineW);
        this.canvas.setStrokeStyle(this.lineC);
        this.canvas.setFillStyle("#95d130");
        this.canvas.moveTo(six[0][0], six[0][1]);
        for (var j = 1; j < six.length; j++) {
          this.canvas.lineTo(six[j][0], six[j][1]);
        }
        this.canvas.lineTo(six[0][0], six[0][1]);
        this.canvas.stroke();
        this.canvas.fillText(i + "," + m, pos[0], pos[1]);
        // this.canvas.fill();
        this.canvas.closePath();

        var boardItem = this.chessBoard[i][m];
        if (boardItem > 0) {
          this.canvas.beginPath();
          this.canvas.setFillStyle(this.chessColor[boardItem - 1]);
          this.canvas.arc(
            pos[0], pos[1],
            radius / 2,
            0, 2 * Math.PI, true
          );
          this.canvas.closePath();
          this.canvas.fill();
        }
      }
    }
    this.canvas.draw(true);
  },

  drawLine: function drawLine(colorTips, lineId, lineStep) {
    if (colorTips == null) {
      return;
    }
    //绘制线条
    var x = 0;
    var y = 0;
    var i = lineId;
    var stepAll = (colorTips.length) - 1;
    this.canvas.setLineCap('round');
    this.canvas.setLineJoin('round');
    this.canvas.beginPath();
    this.canvas.setStrokeStyle(this.chessColor[i]);
    this.canvas.setLineWidth(this.lineBigW);

    x = (this.lineOff_X + (colorTips[0][1]) * this.boardS) * this.screenScale / (2);
    y = (this.lineOff_Y + (colorTips[0][0]) * this.boardS) * this.screenScale / (2);
    this.canvas.moveTo(x, y);

    var everypoint = [];
    var arr = [];
    var step = Math.min(stepAll, lineStep);
    for (var j = 1; j <= step; j++) {
      x = (this.lineOff_X + (colorTips[j][1]) * this.boardS) * this.screenScale / (2);
      y = (this.lineOff_Y + (colorTips[j][0]) * this.boardS) * this.screenScale / (2);
      this.canvas.lineTo(x, y);
    }
    this.canvas.moveTo(x, y);
    this.canvas.closePath();
    this.canvas.stroke();
    this.canvas.draw(true);
    var pos = [x, y];
    return pos;
  },
  //绘制六边形的棋盘
  draw: function draw(isStructDraw, colorRandom) {
    if (this.canvas == null)
      return;
    if (isStructDraw) {
      this.canvas.setGlobalAlpha(1);
      this.canvas.beginPath();
      this.canvas.setFillStyle(this.chessBgC);
      this.canvas.rect(this.off_X - 4, this.off_Y - 4, this.chessW + 8, this.chessH + 16);
      this.canvas.closePath();
      this.canvas.fill();
    }

    //绘制格子
    this.canvas.beginPath();
    this.canvas.setLineWidth(this.lineW);
    this.canvas.setStrokeStyle(this.lineC);

    for (var i = 0; i <= this.sizeW; i++) {
      this.canvas.moveTo(this.off_X, this.off_Y + this.i_h * i);
      this.canvas.lineTo(this.chessW + this.off_X, this.off_Y + this.i_h * i);
    }

    for (var i = 0; i <= this.sizeH; i++) {
      this.canvas.moveTo(this.off_X + this.i_w * i, this.off_Y);
      this.canvas.lineTo(this.off_X + this.i_w * i, this.off_Y + this.chessH);
    }
    this.canvas.closePath();
    this.canvas.stroke();

    //绘制点圈
    var radius = this.i_w - 10;
    if (isStructDraw) {
      for (var i = 0; i < this.chessBoard.length; i++) {
        this.canvas.beginPath();
        this.canvas.setFillStyle(this.chessColor[this.chessBoard[i].c + colorRandom + -1]);
        this.canvas.arc(
          this.off_X + (this.chessBoard[i].f[1] + 0.5) * this.i_w,
          this.off_Y + (this.chessBoard[i].f[0] + 0.5) * this.i_h,
          radius / 2,
          0, 2 * Math.PI, true
        );
        this.canvas.arc(
          this.off_X + (this.chessBoard[i].s[1] + 0.5) * this.i_w ,
          this.off_Y + (this.chessBoard[i].s[0] + 0.5) * this.i_h,
          radius / 2,
          0, 2 * Math.PI, true
        );
        this.canvas.fill();
        this.canvas.closePath();
      }
    } else {
      for (var i = 0; i < this.chessBoard.length; i++) {
        for (var j = 0; j < this.chessBoard[i].length; j++) {
          var boardItem = this.chessBoard[i][j];
          if (boardItem > 0) {
            this.canvas.beginPath();
            this.canvas.setFillStyle(this.chessColor[boardItem - 1]);
            this.canvas.arc(
              this.off_X + (j + 0.5) * this.i_w,
              this.off_Y + (i + 0.5) * this.i_h,
              radius / 2,
              0, 2 * Math.PI, true
            );
            this.canvas.closePath();
            this.canvas.fill();
          }
        }
      }
    }
    this.canvas.draw(true);
  },

  //给定一个中心点后,返回他的六边形的六个点的坐标
  //pos-六边形的中心点,六边形的变成
  getSixPoint: function (pos, sideL) {
    var six = [];
    var half = sideL / 2;
    var other = Math.sqrt(3) * sideL / 2;
    var x = pos[0] - sideL;
    var y = pos[1];
    six.push([x, y]);
    x = pos[0] - half;
    y = pos[1] + other;
    six.push([x, y]);
    x = pos[0] + half;
    six.push([x, y]);
    x = pos[0] + sideL;
    y = pos[1];
    six.push([x, y]);
    x = pos[0] + half;
    y = pos[1] - other;
    six.push([x, y]);
    x = pos[0] - half;
    six.push([x, y]);
    return six;
  },

  //清除画布
  clear: function clear() {
    if (this.canvas != null) {
      // this.canvas.clearRect(0, 0, this.chessW, this.chessH);
      this.canvas.draw();
    }
  },
  //重置
  resetDraw: function resetDraw() {
    this.clear();
    this.draw();
  },
  //销毁canvas
  destroy: function destroy() {
    if (this.canvas!=null)
    {
      // this.canvas.clearActions();      
      this.canvas = null;
    }
  }
}
var chessDraw = {
  chessDraw: ChessBoardDraw
};

module.exports = chessDraw;
