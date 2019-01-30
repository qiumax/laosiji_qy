// pages/orders/index.js
var handlogin = require('../../utils/handlelogin.js');
var util = require('../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderinfo:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
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
    var _this = this
    _this.getneedfollow()
    
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
    this.getneedfollow()
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },


  //未接单
  getneedfollow: function () {

    var _this = this
    handlogin.isLogin(() => {
      wx.request({
        url: app.globalData.host + '/api/Need/getNeedsFollowup',
        data: {
          'user_id': wx.getStorageSync('user_id'),
          's_id': wx.getStorageSync('s_id'),
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        }, // 设置请求的 header
        success: function (res) {
          console.log(res)
          if (!res.data.err) {
            if (res.data.need.length > 0) {
              var orderstatus
              var orderinfo = res.data.need
              orderinfo.forEach((v, k) => {
                orderinfo[k].time = util.formatDateTime(v.time)
                if (v.need_schedule) {
                  orderstatus = '抢单中'
                }
                else if (v.state == app.globalData.ORDER_STATE.TO_GET_CARGO) {
                  orderstatus = '待取货'
                }
                else if (v.state == app.globalData.ORDER_STATE.DRIVER_CONFIRM_GET_CARGO) {
                  orderstatus = '司机已确认取货'
                }
                else if (v.state == app.globalData.ORDER_STATE.COMPANY_CONFIRM_GET_CARGO) {
                  orderstatus = '运送中'
                }
                else if (v.state == app.globalData.ORDER_STATE.DRIVER_CONFIRM_DELIVER) {
                  orderstatus = '司机确认交货'
                }
                else if (v.state == app.globalData.ORDER_STATE.COMPANY_TOUSU_DELIVER) {
                  orderstatus = '投诉处理中'
                }
                else if (v.state == app.globalData.ORDER_STATE.PLAT_HANDLE_TOUSU) {
                  orderstatus = '投诉处理已完成'
                }
                else if (v.state == app.globalData.ORDER_STATE.COMPANY_CONFIRM_DELIVER) {
                  orderstatus = '已确认收货'
                }
                else if (v.state == app.globalData.ORDER_STATE.COMMENTED) {
                  orderstatus = '已完成'
                }
                orderinfo[k].orderstatus = orderstatus
              })
              _this.setData({ orderlist: orderinfo }) 
            
            }
            else {
              _this.setData({
                hasneeds: false
              })
            }
          }
          else {

            handlogin.handError(res, _this.getneedfollow)
          }
        },
        fail: function (res) {
          handlogin.handError(res, _this.getneedfollow)
        }

      })
    })
  },

  //订单明细
  gotodetail:function(e){
    console.log(e)
    var order_id = e.currentTarget.dataset.order_id
      wx.navigateTo({
        url: '/pages/orderdetail/index?order_id=' + order_id,
      })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})