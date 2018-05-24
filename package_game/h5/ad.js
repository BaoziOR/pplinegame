var app = getApp();

Page({
    data:{
        webUrl:"",
    },
    onShow:function(){
        var that=this;
        that.setData({
            webUrl:app.globalData.otherInfo.adContent.data.ad1.url
          });
    }
})