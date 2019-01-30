// pages/orders/index.js
var handlogin = require('../../utils/handlelogin.js');
var util = require('../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentId: 0,
    ordernum:0,
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
    this.getOrderList()
    this.getmyOrderList()
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
    this.getOrderList()
    this.getmyOrderList()
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  //导航栏切换
  tabChoice: function (e) {
    var tabid = e.currentTarget.dataset.tabid
    this.setData({ currentId: tabid })
  },

//订单列表
  getOrderList:function(){
    var _this =this
    var orderstatus
    handlogin.isLogin(() => {
      wx.request({
        url: app.globalData.host + '/api/order/getOrderList',
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
            res.data.order.forEach((v, k) => {
              res.data.order[k].time = util.formatDateTime(v.time)
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
                orderstatus = '投诉处理完成'
              }
              else if (v.state == app.globalData.ORDER_STATE.COMPANY_CONFIRM_DELIVER) {
                orderstatus = '已确认收货'
              }
              else if (v.state == app.globalData.ORDER_STATE.COMMENTED) {
                orderstatus = '已完成'
              }
              res.data.order[k].orderstatus = orderstatus
            })
            _this.setData({
              orderlist:res.data.order,
              ordernum:res.data.order.length
              })
          }
          else {
            handlogin.handError(res, _this.getOrderList)
          }

        },
        fail: function (res) {
          handlogin.handError(res, _this.getOrderList)
        }

      })

    })
  },


  //我收的
  getmyOrderList: function () {
    var _this = this
    var orderstatus
    handlogin.isLogin(() => {
      wx.request({
        url: app.globalData.host + '/wx/myOrderList',
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
            res.data.order.forEach((v, k) => {
              res.data.order[k].time = util.formatDateTime(v.time)
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
                orderstatus = '投诉处理完成'
              }
              else if (v.state == app.globalData.ORDER_STATE.COMPANY_CONFIRM_DELIVER) {
                orderstatus = '已确认收货'
              }
              else if (v.state == app.globalData.ORDER_STATE.COMMENTED) {
                orderstatus = '已完成'
              }
              res.data.order[k].orderstatus = orderstatus
            })
            _this.setData({
              myorderlist: res.data.order,
              myordernum: res.data.order.length
            })
          }
          else {
            handlogin.handError(res, _this.getmyOrderList)
          }

        },
        fail: function (res) {
          handlogin.handError(res, _this.getmyOrderList)
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

  //我收的订单明细
  gotomydetail:function(e){
    console.log(e)
    var order_id = e.currentTarget.dataset.order_id
    wx.navigateTo({
      url: '/pages/myorderdetail/index?order_id=' + order_id,
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})