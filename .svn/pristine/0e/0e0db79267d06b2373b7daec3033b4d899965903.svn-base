//util.js

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function readData(date) {
}
function move(data,range) {
  var moveX;
  if (range == undefined) {
    moveX = data[1][0] - data[0][0];
    var tail = data[data.length - 1];
    var head = data.shift();
    head[0] = tail[0] + moveX;
    //console.log("last: " + head);
    data.push(head);
  } else {
    moveX =range[0];
  }
  for (var i = 0; i < data.length; ++i) {
    data[i][0] -= moveX;
  }
}
function selfAdapter(data, stageW, stageH) {
  var head = data[0];
  var tail = data[data.length - 1];
  var scalex = stageW / (tail[0] - head[0]);
  var scaley = scalex / 0.618;
  for (var i = 0; i < data.length; ++i) {
    data[i][0] *= scalex;
    data[i][1] *= scaley;
  }
}

function logUtil(obj){
  if(false){
    console.log(obj);
  }
}

//比较版本号
function CompareVersion(v1, v2){
  v1 = v1.split('.')
  v2 = v2.split('.')
  var len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }
  for (var i = 0; i < len; i++) {
    var num1 = parseInt(v1[i])
    var num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }
  return 0
}

function StartWith(initStr,testStr)
{
  var reg = new RegExp("^" + testStr);
  return reg.test(initStr);        
}

// 判断某个json对象是否在json数组中
function ArrayContainsJson(array,item)
{
  for(var i=0;i<array.length;i++)
  {
    if(JSON.stringify(array[i]) == JSON.stringify(item))
    {
      return true;
    }
  }
  return false;
}

// 通过随机种子计算随机数
function SeedRandom(max, min) {
  max = max || 1;
  min = min || 0;
  Math.seed = (Math.seed * 9301 + 49297) % 233280;
  var rnd = Math.seed / 233280.0;
  return min + rnd * (max - min);
};

module.exports = {
  formatTime: formatTime,
  readData: readData,
  move: move,
  log: logUtil,
  compVersion: CompareVersion,
  selfAdapter: selfAdapter,
  StartWith: StartWith,
  ArrayContainsJson: ArrayContainsJson,
  SeedRandom: SeedRandom
}
