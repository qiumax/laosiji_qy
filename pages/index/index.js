// pages/index/index.js
var handlogin = require('../../utils/handlelogin.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current_scroll: 0,
    truckid:'',
    current_scroll:0,
    num:0,
    leftshow:'',
    rightshow:'',
    isvalid:0,
    hasneeds:false,
    needs:[],
    currentId: 1,
    interval: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    //订单二维码
    if (options.scene) {
      wx.navigateTo({
        url: '/pages/myorderdetail/index?order_id='+options.scene,
      })
    }
    
    _this.setData({ phone: wx.getStorageSync('phone') })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  //车型
  label_click: function (e) {
    console.log(e)
    var value = e.currentTarget.dataset.value
    this.setData({ currentId: value })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    clearInterval(this.data.interval)
    var _this = this
    _this.setData({ phone: wx.getStorageSync('phone') })
    console.log(wx.getStorageSync('phone'))
    handlogin.isLogin(() => {
      _this.getTruck()
      _this.getAccountinfo()
    })

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('hide')
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
    var _this = this
    _this.getAccountinfo()
    _this.getTruck()
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

//获取公司信息
  getAccountinfo:function(){
    var _this =this
    console.log('getacc')
    handlogin.isLogin(() => {
    wx.request({
      url: app.globalData.host + '/api/com_user/getAccountInfo',
      data: {
        'user_id': wx.getStorageSync('user_id'),
        's_id': wx.getStorageSync('s_id'),
        'phone': wx.getStorageSync('phone'),
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      }, // 设置请求的 header
      success: function (res) {
        console.log(res)
        if (!res.data.err && res.data.ok !='0' && res.data.company.state) {
          wx.setStorageSync('name', res.data.name)//姓名
          wx.setStorageSync('companyname', res.data.company.name)//公司名
          wx.setStorageSync('account_id', res.data._id)//acccountid
          wx.setStorageSync('default_address', res.data.default_address)//默认地址
          wx.setStorageSync('price_dun', res.data.company.price_dun)
          _this.setData({ isvalid: 1 })
          _this.getneedfollow()
        }
        else
        {
          _this.setData({ isvalid: 0 })
          console.log('do nothing')
        }
      }
    })
    })
  },

  getorder:function(){
    var _this = this
    if (_this.data.isvalid == 0){
      handlogin.isLogin(() => {
        wx.request({
          url: app.globalData.host + '/api/com_user/getAccountInfo',
          data: {
            'user_id': wx.getStorageSync('user_id'),
            's_id': wx.getStorageSync('s_id'),
            'phone': wx.getStorageSync('phone'),
          },
          method: 'POST',
          header: {
            'content-type': 'application/json'
          }, // 设置请求的 header
          success: function (res) {
            console.log(res)
            if (!res.data.err && res.data.ok != '0' && res.data.company.state) {
              wx.setStorageSync('name', res.data.name)//姓名
              wx.setStorageSync('companyname', res.data.company.name)//公司名
              wx.setStorageSync('account_id', res.data._id)//acccountid
              wx.setStorageSync('default_address', res.data.default_address)//默认地址
              wx.setStorageSync('price_dun', res.data.company.price_dun)
              _this.setData({ isvalid: 1 })
              wx.navigateTo({
                url: '/pages/publish/index?truckid=' + _this.data.truckid + '&currentId=' + _this.data.currentId,
              })
            }
            else {
              wx.showToast({
                title: '请开通权限',
                icon: 'none',
                duration: 2000
              })
              return false;
            }
          }
        })
      })
    }
    else
    {
      var pages = getCurrentPages();
      var currPage = pages[pages.length - 1];//当前页面
      var prevpage = pages[pages.length - 2];//上一个页面
      console.log(currPage)
      console.log(pages)
      wx.navigateTo({
        url: '/pages/publish/index?truckid=' + _this.data.truckid + '&currentId=' + _this.data.currentId,
      })
    }
   
  },

  gotomember:function(){
    clearInterval(this.data.interval)
    wx.navigateTo({
      url: '/pages/member/index',
    })
  },

  left:function(){
    var _this =this
    var current = _this.data.current_scroll
    console.log(current)
    if(current == 0)
    {
      console.log('donothing')
    }
    else if(current > 0)
    {
      current = current -1
      _this.setData({
        
        truckimg: _this.data.trucks[current].img,
        current_scroll: current,
        truckload: _this.data.trucks[current].load,
        trucksize: _this.data.trucks[current].size,
        truckvolume: _this.data.trucks[current].volume,
        truckid: _this.data.trucks[current]._id
      })

    }
    else
    {
      console.log('donothing')

    }
  },

  right:function(){
    var _this = this
    var current = _this.data.current_scroll
    console.log(current)
    if (current+1 == _this.data.num) {
      console.log('donothing')
    }

    else if (current+1 < _this.data.num) {
      current = current+1
      _this.setData({
        truckimg: _this.data.trucks[current].img,
        current_scroll: current,
        truckload: _this.data.trucks[current].load,
        trucksize: _this.data.trucks[current].size,
        truckvolume: _this.data.trucks[current].volume,
        truckid: _this.data.trucks[current]._id
      })

    }
    else {
      console.log('donothing')

    }
  },

  handleChangeScroll: function (e){
    var _this =this
    console.log(_this.data.trucks[e.detail.key].img)
    this.setData({
      truckimg: _this.data.trucks[e.detail.key].img,
      current_scroll: e.detail.key,
      truckload: _this.data.trucks[e.detail.key].load,
      trucksize: _this.data.trucks[e.detail.key].size,
      truckvolume: _this.data.trucks[e.detail.key].volume,
      truckid: _this.data.trucks[e.detail.key]._id
    });
  },

  getTruck:function(){
    var _this =this
    handlogin.isLogin(() => {
      wx.request({
        url: app.globalData.host + '/api/Need/getTruck',
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
            console.log(res.data.truck)
            console.log(res.data.truck.length)
            _this.setData({
              num: res.data.truck.length,
              trucks:res.data.truck,
              show: true,
              current_scroll: 0,
              truckimg: res.data.truck[0].img,
              truckload: res.data.truck[0].load,
              trucksize: res.data.truck[0].size,
              truckvolume: res.data.truck[0].volume,
              truckid: res.data.truck[0]._id
              })
          }
          else {
            handlogin.handError(res, _this.getTruck)
          }
        },
        fail: function (res) {
          handlogin.handError(res, _this.getTruck)
        }

      })
    })
  },

  //未接单
  getneedfollow: function () {
    clearInterval(this.data.interval)
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
            if (res.data.need.length > 0){

              var interval = setInterval(function () {
                _this.getneedfollow()
              }, app.globalData.refreshtime)
              _this.setData({ interval: interval })

              _this.setData({
                hasneeds: true,
                needs: res.data.need
              })
            }
            else
            {
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

  getPhoneNumber: function (e) {
    console.log('getphone')
    var _this = this
    //先判断用户是否已经有电话
    var btn_type = e.currentTarget.dataset.type

    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      wx.showToast({
        title: '授权失败，请重试',
        icon: 'none',
        duration: 2000
      })
    } else {//授权成功

      //解密数据
      handlogin.isLogin(() => {
        wx.request({
          url: app.globalData.host + '/api/com_user/getphone',
          data: {
            'user_id': wx.getStorageSync('user_id'),
            's_id': wx.getStorageSync('s_id'),
            'encryptedData': e.detail.encryptedData,
            'iv': e.detail.iv,
            'session_key': wx.getStorageSync('session_key')
          },
          method: 'POST',
          header: {
            'content-type': 'application/json'
          }, // 设置请求的 header
          success: function (res) {
            console.log(res)
            if (res.data.phoneNumber) {
              var phone = res.data.phoneNumber
              _this.setData({ phone: res.data.phoneNumber })
              //更新
              wx.request({
                url: app.globalData.host + '/api/com_user/updatePhone',
                data: {
                  'user_id': wx.getStorageSync('user_id'),
                  's_id': wx.getStorageSync('s_id'),
                  'phone': res.data.phoneNumber,
                },
                method: 'POST',
                header: {
                  'content-type': 'application/json'
                }, // 设置请求的 header
                success: function (res) {
                  console.log('update success')
                  wx.setStorageSync('phone', phone)
                  console.log(phone)
                 
                  //进入相应页面

                  clearInterval(_this.data.interval)
                  if (btn_type == 'getorder') {
                    _this.getorder()
                  }
                  else if (btn_type =='gotomember'){
                    _this.gotomember()
                  }
                  
                }  
              })
            }
          }
      })

      })
     
    }
  },

//未接单
  gotoneeds:function(){
    clearInterval(this.data.interval)
    var _this =this

    wx.navigateTo({
      url: '/pages/needs/index',
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})