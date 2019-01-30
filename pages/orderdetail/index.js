// pages/orderdetail/index.js
var handlogin = require('../../utils/handlelogin.js');
var util = require('../../utils/util.js');
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowWidth: 0,
    windowHeight: 0,
    orderinfo:{},
    showdetail: false,
    verticalCurrent: 10000,
    interval: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this; 
    var order_id = options.order_id
    console.log(options)
    _this.setData({ order_id: order_id })
    var orderinfo = _this.data.orderinfo
    orderinfo.state = 10
    console.log(orderinfo)
    _this.setData({ orderinfo: orderinfo })
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
    clearInterval(this.data.interval)
    var _this = this;

    //计算屏幕宽度
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({ windowWidth: res.windowWidth })
        _this.setData({ windowHeight: res.windowHeight })
      },
    })

    _this.getOrderDetail()

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.data.interval)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.interval)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    clearInterval(this.data.interval)
    this.getOrderDetail()
    wx.stopPullDownRefresh();
  },


//show 起点 终点
  showmarkers:function(){

    var _this =this
    var orderinfo = _this.data.orderinfo
    _this.mapCtx = wx.createMapContext('navi_map');

    console.log(orderinfo)
    //发货地址 收货地址
    _this.mapCtx.includePoints({
      padding:[30,20,20,20],
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
    var pastpoints=new Array()

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
            orderinfo.logs.forEach((v,k)=>{
              if (loglength == k+1)//最后一个取出来
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
            if (orderinfo.state < app.globalData.ORDER_STATE.DRIVER_CONFIRM_DELIVER)
            {
              nopastpoints.push({
                'points': nopastedpolyline,
                'color': "#FF0000DD",
                'dottedLine': true,
                'width': 3
              })
            }
            else
            {
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
    else
    {
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

  //确认司机已取货
  confirmGetCargo:function(){
    var _this = this
    handlogin.getUserLocation(()=>{
      var order_id = _this.data.orderinfo._id
      //判断司机是否确认
      var state = _this.data.orderinfo.state
      if (state < 2) {
        wx.showToast({
          icon: 'none',
          title: '请提醒司机确认取货',
          duration: 5000,
          success(res) {
            setTimeout(function () {
            }, 2000);

          }
        })
        return false
      }
      var longitude = 0
      var latitude = 0
      wx.getLocation({
        success: function (res) {
          longitude = res.longitude
          latitude = res.latitude
          var company_confirm_cargo_at = new Array()
          company_confirm_cargo_at = {
            location: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            time: Date.parse(new Date()) / 1000
          }

          console.log(JSON.stringify(company_confirm_cargo_at))
          if (order_id) {
            handlogin.isLogin(() => {
              wx.request({
                url: app.globalData.host + '/api/com_user/confirmGetCargo',
                data: {
                  'user_id': wx.getStorageSync('user_id'),
                  's_id': wx.getStorageSync('s_id'),
                  'order_id': order_id,
                  'company_confirm_cargo_at': JSON.stringify(company_confirm_cargo_at)
                },
                method: 'POST',
                header: {
                  'content-type': 'application/json'
                }, // 设置请求的 header
                success: function (res) {
                  console.log(res)
                  if (!res.data.err) {
                    if (res.data.ok == 1) {
                      _this.getOrderDetail()
                      wx.showToast({
                        title: '确认司机取货成功！',
                        icon:'none',
                        duration: 5000,
                        success(res) {
                          setTimeout(function () {
                          }, 2000);

                        }
                      })
                    }
                  }
                  else {
                    handlogin.handError(res, _this.confirmGetCargo)
                  }
                },
                fail: function (res) {
                  handlogin.handError(res, _this.confirmGetCargo)
                }

              })
            })
          }

        },
        fail: function (res) {
          wx.showToast({
            title: '操作失败，请重试！',
          })
        }
      })
    })
    
  },


  //运单详情
  showdetail: function () {
    console.log('show')
    var _this = this

    //记录
    var logs = new Array()
    if (_this.data.orderinfo.state) {
      //发单时间
      logs.push({
        action: '订单已提交',
        time: util.utcformat(_this.data.orderinfo.created_at)
      })
    }
    else {
      //发单时间
      logs.push({
        action: '订单已提交',
        time: util.utcformat(_this.data.orderinfo.created_at)
      })
    }
    var state = _this.data.orderinfo.state
    console.log(state)
    var i = 1
    for (i = 1; i <= state; i++) {
      console.log(i)
      //已接单
      if (i == app.globalData.ORDER_STATE.TO_GET_CARGO) {
        logs.push({
          action: '司机已接单',
          time: util.formatDateTime(_this.data.orderinfo.publish_at)
        })
      }
      //司机已接单
      if (i == app.globalData.ORDER_STATE.DRIVER_CONFIRM_GET_CARGO) {
        logs.push({
          action: '司机已取货',
          time: util.formatDateTime(_this.data.orderinfo.driver_confirm_cargo_at.time)
        })
      }
      //发货方确认已接单
      if (i == app.globalData.ORDER_STATE.COMPANY_CONFIRM_GET_CARGO) {
        logs.push({
          action: '发货方确认已取货',
          time: util.formatDateTime(_this.data.orderinfo.company_confirm_cargo_at.time)
        })
        //地理位置
        var locations = _this.data.orderinfo.logs;
        if (locations.length > 0) {
          locations.forEach((v, k) => {
            logs.push({
              action: '到达' + v.address,
              time: util.formatDateTime(v.time)
            })
          })
        }
      }

      //确认收货
      if (i == app.globalData.ORDER_STATE.DRIVER_CONFIRM_DELIVER) {
        logs.push({
          action: '司机已确认交货',
          time: util.formatDateTime(_this.data.orderinfo.driver_confirm_deliver_at.time)
        })

      }

     
      //判断是否有投诉
     
      if (i == app.globalData.ORDER_STATE.COMPANY_TOUSU_DELIVER && Object.keys(_this.data.orderinfo.tousu_to_driver).length>1) {
        logs.push({
          action: '收货方发起投诉',
          time: util.formatDateTime(_this.data.orderinfo.tousu_to_driver.time)
        })
      }
     
      //投诉处理完成
      
      if (i == app.globalData.ORDER_STATE.PLAT_HANDLE_TOUSU && Object.keys(_this.data.orderinfo.plat_handle_tousu).length > 1) {
        logs.push({
          action: '投诉处理完成',
          time: util.formatDateTime(_this.data.orderinfo.plat_handle_tousu.time)
        })
      }
      
      //企业确认收货
      if (i == app.globalData.ORDER_STATE.COMPANY_CONFIRM_DELIVER) {
        logs.push({
          action: '已确认收货',
          time: util.formatDateTime(_this.data.orderinfo.company_confirm_deliver_at.time)
        })
      }

      //已完成
      if (i == app.globalData.ORDER_STATE.COMMENTED) {


          if (_this.data.orderinfo.comment_to_driver.time <= _this.data.orderinfo.comment_to_company.time) {
            logs.push({
              action: '收货方已评价',
              time: util.formatDateTime(_this.data.orderinfo.comment_to_driver.time)
            })
            logs.push({
              action: '司机已评价',
              time: util.formatDateTime(_this.data.orderinfo.comment_to_company.time)
            })
            logs.push({
              action: '已完成',
              time: util.formatDateTime(_this.data.orderinfo.comment_to_company.time)
            })

          }
          else {
            logs.push({
              action: '司机已评价',
              time: util.formatDateTime(_this.data.orderinfo.comment_to_company.time)
            })
            logs.push({
              action: '收货方已评价',
              time: util.formatDateTime(_this.data.orderinfo.comment_to_driver.time)
            })

            logs.push({
              action: '已完成',
              time: util.formatDateTime(_this.data.orderinfo.comment_to_driver.time)
            })
          }
        
      }


    }


    _this.setData({
      logs: logs,
      showdetail: true,
      opacity: 0.3,
      backcolor:'rgba(232, 232, 232, 0.8)'
    })
  },

  //关闭详情
  closedetail: function () {
    console.log('close')
    var _this = this
    _this.setData({
      showdetail: false,
      opacity: 1,
      backcolor:''
    })

  },

//打电话
  makephonecall:function(){
    console.log('make phone')
    var _this =this
    wx.makePhoneCall({
      phoneNumber:_this.data.orderinfo.driver.user.phone
    })
  },
  //禁止滑动
  preventTouchMove() {
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  //企业确认收货
  confirmDeliver:function(){

    var _this = this
    var order_id = _this.data.orderinfo._id
    handlogin.getUserLocation(() => {
    var longitude = 0
    var latitude = 0
    wx.getLocation({
      success: function (res) {
        longitude = res.longitude
        latitude = res.latitude
        var company_confirm_deliver_at = new Array()
        company_confirm_deliver_at = {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          time: Date.parse(new Date()) / 1000
        }

        console.log(JSON.stringify(company_confirm_deliver_at))
        if (order_id) {
          handlogin.isLogin(() => {
            wx.request({
              url: app.globalData.host + '/api/com_user/confirmDeliver',
              data: {
                'user_id': wx.getStorageSync('user_id'),
                's_id': wx.getStorageSync('s_id'),
                'order_id': order_id,
                'company_confirm_deliver_at': JSON.stringify(company_confirm_deliver_at)
              },
              method: 'POST',
              header: {
                'content-type': 'application/json'
              }, // 设置请求的 header
              success: function (res) {
                console.log(res)
                if (!res.data.err) {
                  if (res.data.ok == 1) {
                    _this.getOrderDetail()
                    wx.showToast({
                      title: '确认收货成功！',
                      icon:'none',
                      duration: 5000,
                    })
                  }
                }
                else {
                  handlogin.handError(res, _this.confirmDeliver)
                }
              },
              fail: function (res) {
                handlogin.handError(res, _this.confirmDeliver)
              }

            })
          })
        }

      },
      fail: function (res) {
        wx.showToast({
          title: '操作失败，请重试！',
          icon:'none'
        })
      }
    })
    })
  },


  showmap:function(){
    clearInterval(this.data.interval)
    var orderinfo = this.data.orderinfo
    wx.navigateTo({
      url: '/pages/map/index?orderinfo=' + JSON.stringify(orderinfo),
    })
  },
  //评价
  comment: function () {
    clearInterval(this.data.interval)
    var _this = this
    var order_id = _this.data.orderinfo._id
    wx.navigateTo({
      url: '/pages/comment/index?order_id=' + order_id,
    })
  },


  //获取订单详情
  getOrderDetail: function () {
    clearInterval(this.data.interval)
    var _this = this
    handlogin.isLogin(() => {
      wx.request({
        url: app.globalData.host + '/api/order/getOrderDetail',
        data: {
          'user_id': wx.getStorageSync('user_id'),
          's_id': wx.getStorageSync('s_id'),
          'order_id': _this.data.order_id
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        }, // 设置请求的 header
        success: function (res) {
          console.log(res)
          if (!res.data.err) {
            var interval = setInterval(function () {
              _this.getOrderDetail()
            }, app.globalData.refreshtime)
            if(res.data.order.driver)
            {
              res.data.order.driver.star = parseInt(res.data.order.driver.star) + ".0"
            }

            _this.setData({ interval: interval })
            _this.setData({ orderinfo: res.data.order })


            //判断司机是否确认交货
            if (res.data.order.state >= app.globalData.ORDER_STATE.DRIVER_CONFIRM_DELIVER) {
              _this.setData({
                showpics: true
              })
            }
            //image
            if(res.data.image){
              _this.setData({ orderimg: app.globalData.host+res.data.image})
            }
            _this.showmarkers()
          }
          else {
            handlogin.handError(res, _this.getOrderDetail)
          }
        },
        fail: function (res) {
          handlogin.handError(res, _this.getOrderDetail)
        }
      })
    })
  },

  phoneplat:function(){
    wx.makePhoneCall({
      phoneNumber: '400988888'
    })
  },

//签收图
  showqspics:function(e){
    console.log(e)
    var _this = this
    var img = e.currentTarget.dataset.img
    wx.previewImage({
      current: img,
      urls: _this.data.orderinfo.driver_confirm_deliver_at.pics
    })
  },

//投诉图
  showtspics:function(e){
    console.log(e)
    var _this = this
    var img = e.currentTarget.dataset.img
    wx.previewImage({
      current: img,
      urls: _this.data.orderinfo.tousu_to_driver.pics
    })
  },

  //平台处理投诉
  showhandletspics:function(e){
    console.log(e)
    var _this = this
    var img = e.currentTarget.dataset.img
    wx.previewImage({
      current: img,
      urls: _this.data.orderinfo.plat_handle_tousu.pics
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})