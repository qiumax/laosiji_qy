// pages/map/index.js
var handlogin = require('../../utils/handlelogin.js');
const app = getApp()
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
    var _this = this
    
    var orderinfo = JSON.parse(options.orderinfo)
    _this.setData({ orderinfo: orderinfo })
    console.log(orderinfo)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },


  //show 起点 终点
  showmarkers: function () {

    var _this = this
    var orderinfo = _this.data.orderinfo
    _this.mapCtx = wx.createMapContext('navi_map');

    console.log(orderinfo)
    //发货地址 收货地址
    _this.mapCtx.includePoints({
      padding: [30, 20, 20, 20],
      points: [{
        latitude: orderinfo.from.location.coordinates[1],
        longitude: orderinfo.from.location.coordinates[0]
      },
      {
        latitude: orderinfo.to.location.coordinates[1],
        longitude: orderinfo.to.location.coordinates[0]
      }]
    })//缩放视野展示所有经纬度

    var marker = {
      id: 1,
      latitude: orderinfo.from.location.coordinates[1],
      longitude: orderinfo.from.location.coordinates[0],
      iconPath: '/images/qidian.png',
      width: 30,
      height: 30
    }
    var marker1 = {
      id: 2,
      latitude: orderinfo.to.location.coordinates[1],
      longitude: orderinfo.to.location.coordinates[0],
      iconPath: '/images/enddian.png',
      width: 30,
      height: 30
    }
    var markers = new Array();
    markers.push(marker);
    markers.push(marker1);
    this.setData({
      markers: markers,
    });

    //路线
    var polyline = []
    //起点到目的的位置
    var pastedpolyline = new Array()
    var pastpoints = new Array()

    var nopastedpolyline = new Array()
    var nopastpoints = new Array()
    pastedpolyline.push({
      longitude: orderinfo.from.location.coordinates[0],
      latitude: orderinfo.from.location.coordinates[1]
    })//起点

 
    if (_this.data.orderinfo.logs && _this.data.orderinfo.logs.length > 0) {

      //循环经过的点
      var loglength = orderinfo.logs.length
      var lstlongitude = 0
      var lstlatitude = 0
      orderinfo.logs.forEach((v, k) => {
        if (loglength == k + 1)//最后一个取出来
        {
          lstlongitude = v.coordinates[0]
          lstlatitude = v.coordinates[1]
        }
        pastedpolyline.push({
          longitude: v.coordinates[0],
          latitude: v.coordinates[1]
        })
      })
      pastpoints.push({
        'points': pastedpolyline,
        'color': "#3592E1DD",
        'width': 3
      })
      polyline.push(pastpoints[0])


      //logs 最后一个点
      nopastedpolyline.push({
        longitude: lstlongitude,
        latitude: lstlatitude
      })
      nopastedpolyline.push({
        longitude: orderinfo.to.location.coordinates[0],
        latitude: orderinfo.to.location.coordinates[1]
      })//终点

      //判断是否已经收货，司机确认收货
      if (orderinfo.state < app.globalData.ORDER_STATE.DRIVER_CONFIRM_DELIVER) {
        nopastpoints.push({
          'points': nopastedpolyline,
          'color': "#FF0000DD",
          'dottedLine': true,
          'width': 3
        })
      }
      else {
        nopastpoints.push({
          'points': nopastedpolyline,
          'color': "#3592E1DD",
          'width': 3
        })
      }

      polyline.push(nopastpoints[0])

      _this.setData({
        polyline: polyline,
      });
    }
    else {
      //起点
      nopastedpolyline.push({
        longitude: orderinfo.from.location.coordinates[0],
        latitude: orderinfo.from.location.coordinates[1]
      })
      nopastedpolyline.push({
        longitude: orderinfo.to.location.coordinates[0],
        latitude: orderinfo.to.location.coordinates[1]
      })//终点

      nopastpoints.push({
        'points': nopastedpolyline,
        'color': "#FF0000DD",
        'dottedLine': true,
        'width': 3
      })

      polyline.push(nopastpoints[0])

      _this.setData({
        polyline: polyline,
      });

    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.showmarkers()
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

  }
})