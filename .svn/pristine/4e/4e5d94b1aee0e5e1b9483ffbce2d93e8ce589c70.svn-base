//dataStruct.js

//定义一个“类”  
function conflictReset() {
  this.preColor = 0;
  this.color = 0;
  this.pointX = 0;
  this.pointY = 0;
}

//定义设置变量方法：setConflictData
conflictReset.prototype.setConflictData = function (preColor,color, posX,posY) {
  this.preColor = preColor;
  this.color = color;
  this.pointX = posX;
  this.pointY = posY;
}

//获取变量值的方法  
conflictReset.prototype.getConflictColor = function () {
  return this.preColor;
}



// //获取变量值  
// var userName = hellokitty.getConflictColor();
module.exports = {
  conflictReset: conflictReset
}