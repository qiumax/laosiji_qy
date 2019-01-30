// pages/address/index.js
var handlogin = require('../../utils/handlelogin.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    default_address: wx.getStorageSync('default_address'),//默认地址
    prevaction:'',//上一页面
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this
    console.log(options)
    if (options.type == 'sendfrom')//发件人
    {
      _this.setData({
        prevaction: 'sendfrom',
      })
    }
    else if (options.type == 'sendto')//收件人
    {
      _this.setData({
        prevaction: 'sendto',
      })
    }
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
    this.getaddlist()
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
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  //地址列表
  getaddlist:function(){
    var _this =this
    _this.setData({ default_address: wx.getStorageSync('default_address')})
    handlogin.isLogin(() => {
      wx.request({
        url: app.globalData.host + '/api/address/getAddress',
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
          if(!res.data.err){
              _this.setData({addlist:res.data.address})
          }
          else
          {
            handlogin.handError(res, _this.getaddlist)
          }
        },
        fail:function(res){
          handlogin.handError(res, _this.getaddlist)
        },
        complete: function (res) {

        }


      })
    })
  },

//新增地址
  newadd:function(e)
  {
      wx.navigateTo({
        url: '/pages/adddetail/index?type=addnew',
      })
  },

  //编辑地址
  editaddress:function(e)
  {
    var _this = this
    console.log(e)
    var add_info = e.currentTarget.dataset.add_info
    console.log(add_info)
    console.log(JSON.stringify(add_info))
    wx.navigateTo({
      url: '/pages/adddetail/index?type=edit&addinfo=' + JSON.stringify(add_info),
   })

  },


  //设默认
  setdefault:function(e)
  {
    var _this = this
    var id = e.currentTarget.dataset.add_id
    console.log(id)
    if (id) {
      handlogin.isLogin(() => {
        wx.request({
          url: app.globalData.host + '/api/address/setDefaultAddress',
          data: {
            'user_id': wx.getStorageSync('user_id'),
            's_id': wx.getStorageSync('s_id'),
            'address_id': id,
          },
          method: 'POST',
          header: {
            'content-type': 'application/json'
          }, // 设置请求的 header
          success: function (res) {
            console.log(res)
            if (!res.data.err) {
              if (res.data.ok == '1') {
                wx.setStorage(
                  {
                    key: 'default_address',
                    data: id,
                    success: function (res) {
                      console.log(id)
                      _this.getaddlist()
                      wx.showToast({
                        title: '设置成功',
                        duration: 1000,
                        success(res) {
                          setTimeout(function () {
                           
                          }, 1000);

                        }
                      })
                    }
                  },
                )//默认地址
               
              }
            }
            else {
              handlogin.handError(res, _this.setdefault)
            }
          },
          fail: function (res) {
            handlogin.handError(res, _this.setdefault)
          },
          complete: function (res) {

          }


        })
      })
    }
  },

  //删除地址
  deladdress:function(e){
    var _this =this
    var id = e.currentTarget.dataset.add_id
    console.log(id)
    if(id){
      handlogin.isLogin(() => {
        wx.request({
          url: app.globalData.host + '/api/address/delAddress',
          data: {
            'user_id': wx.getStorageSync('user_id'),
            's_id': wx.getStorageSync('s_id'),
            'address_id':id,
            'account_id': wx.getStorageSync('account_id')
          },
          method: 'POST',
          header: {
            'content-type': 'application/json'
          }, // 设置请求的 header
          success: function (res) {
            console.log(res)
            if (!res.data.err) {
              if(res.data.ok =='1')
              {
                wx.showToast({
                  title: '删除成功',
                  duration: 2000,
                  success(res) {
                    setTimeout(function () {
                      _this.getaddlist()
                    }, 2000);

                  }
                })
               
              }
            }
            else {
              handlogin.handError(res, _this.deladdress)
            }
          },
          fail: function (res) {
            handlogin.handError(res, _this.deladdress)
          },
          complete: function (res) {

          }


        })
      })
    }

  },

  setprevdata:function(e){
    var _this =this
    var addinfo =  e.currentTarget.dataset.addinfo
    console.log(addinfo)
    var prevaction = _this.data.prevaction
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];//当前页面
    var prevpage = pages[pages.length - 2];//上一个页面
    if (prevaction == 'sendfrom')
    {
      prevpage.setData({
        sendfrom_title: addinfo.name + '  ' + addinfo.phone,
        sendfrom_address: addinfo.address + ' ' + addinfo.note,
        sendfrominfo: JSON.stringify({
          city: addinfo.city,
          address: addinfo.address,
          note: addinfo.note,
          name: addinfo.name,
          phone: addinfo.phone,
          location: {
            type: "Point",
            coordinates: [addinfo.longitude, addinfo.latitude]
          }
        })
      })
      wx.navigateBack({})

    }
    else if (prevaction == 'sendto')
    {
      prevpage.setData({
        sendto_title: addinfo.name + '  ' + addinfo.phone,
        sendto_address: addinfo.address + ' ' + addinfo.note,
        sendtoinfo: JSON.stringify({
          city: addinfo.city,
          address: addinfo.address,
          note: addinfo.note,
          name: addinfo.name,
          phone: addinfo.phone,
          location: {
            type: "Point",
            coordinates: [addinfo.longitude, addinfo.latitude]
          }
        })
      })
      wx.navigateBack({})
    }
    else
    {
      console.log('do nothing')
    }

   
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})