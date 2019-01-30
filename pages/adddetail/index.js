// pages/adddetail/index.js
var handlogin = require('../../utils/handlelogin.js');
var QQMapWX  = require('../../utils/qqmap-wx-jssdk.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    default_address: wx.getStorageSync('default_address'),//默认地址
    id:'',
    longitude: '',
    latitude: '',
    prevaction:[],//更新上一页信息
    msgtext:'保存到地址簿',//地址提示
    name:'',//姓名
    phone:'',//电话
    setup:'/images/radio_checked.png',//radio
    address:'详细地址',//地址默认显示
    note:'',//地址备注
    city:'',//城市
    qqmapsdk:''//map api
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var _this =this

    // 实例化API核心类
    var qqmapsdk = new QQMapWX({
      key: 'TSFBZ-YAN3U-S2BVJ-4AP4W-XWEQF-GYFRI'
    });

    _this.setData({ qqmapsdk: qqmapsdk })


    console.log(options)
    if(options.type=='sendfrom')//发件人
    {
      _this.setData({ 
        prevaction:'sendfrom',
        savetoadd: true,//单选按钮勾选是否保存到地址簿
      })
    }
    else if(options.type=='sendto')//收件人
    {
      _this.setData({ 
        prevaction: 'sendto',
        savetoadd: true,//单选按钮勾选是否保存到地址簿
       })
    }
    else if (options.type == 'addnew')//新增
    {
      _this.setData({
        prevaction: 'addnew',
        msgtext:'设为默认地址',
        setasdefault: false,//单选按钮是否设为默认
        })
    }
    else if (options.type == 'edit')//编辑
    {
      var addinfo = JSON.parse(options.addinfo)
      _this.setData({
        id:addinfo._id,
        longitude: addinfo.longitude,
        latitude: addinfo.latitude,
        name: addinfo.name,//姓名
        phone: addinfo.phone,//电话
        address: addinfo.address,//地址默认显示
        note: addinfo.note,//地址备注
        city: addinfo.city,//城市
        prevaction: 'edit',
        msgtext: '设为默认地址',
        setasdefault: false,//单选按钮是否设为默认
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

  //提交
  submit:function(e){
    console.log(e)
    var _this =this
    var name = _this.data.name
    var id = _this.data.id
    var phone = _this.data.phone
    var address = _this.data.address
    var note = _this.data.note
    var city = _this.data.city
    var longitude = _this.data.longitude
    var latitude = _this.data.latitude
    var savetoadd = _this.data.savetoadd
    var prevaction = _this.data.prevaction
    //name phone 不能为空
    if (!name || name == '') {
      wx.showToast({
        title: '姓名不能为空！',
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    if (!phone || phone == '') {
      wx.showToast({
        title: '手机号码不能为空！',
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    var reg = /^\d{11}$/;
    console.log(phone)
    if (!reg.test(phone)) {
      wx.showToast({
        icon: 'none',
        title: '手机号码格式不正确',
      })
      return false;
    }

    if (!address || address == '' || longitude == '' || latitude=='') {
      wx.showToast({
        title: '请点击定位获取详细地址',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    console.log(prevaction)
    if (prevaction == 'addnew' || (prevaction != 'addnew' && prevaction != 'edit' && savetoadd)){//从订单--保存到地址簿
      //request
      handlogin.isLogin(() => {
        wx.request({
          url: app.globalData.host + '/api/address/addAddress',
          data: {
            'user_id': wx.getStorageSync('user_id'),
            's_id': wx.getStorageSync('s_id'),
            'name': name,
            'phone': phone,
            'city': city,
            'address': address,
            'longitude': longitude,
            'latitude': latitude,
            'note':note
          },
          method: 'POST',
          header: {
            'content-type': 'application/json'
          }, // 设置请求的 header
          success: function (res) {
            if (!res.data.err) {
              if (res.data.ok == '1') {
                _this.prevsetdata()
                if (prevaction == 'addnew'){
                  wx.showToast({
                    title: '新增成功',
                    duration: 1000,
                    success(res) {
                      //setTimeout(function () {
                        wx.navigateBack({})
                     // }, 1000);

                    }
                  })
                }
                else
                {
                  wx.navigateBack({})  
                }
              }
            }
            else {
              wx.showToast({
                title: '操作失败',
              })
            }
            
          },
          fail:function(res){
            wx.showToast({
              title: '操作失败',
            })
          }


        })
      })
    }
    else if (prevaction == 'edit')//编辑
    {
      handlogin.isLogin(() => {
        wx.request({
          url: app.globalData.host + '/api/address/updateAddress',
          data: {
            'user_id': wx.getStorageSync('user_id'),
            's_id': wx.getStorageSync('s_id'),
            'address_id': id,
            'account_id': wx.getStorageSync('account_id'),
            'name': name,
            'phone': phone,
            'city': city,
            'address': address,
            'longitude': longitude,
            'latitude': latitude,
            'note': note
          },
          method: 'POST',
          header: {
            'content-type': 'application/json'
          }, // 设置请求的 header
          success: function (res) {
            if (!res.data.err) {
              if (res.data.ok == '1') {
                _this.prevsetdata()
                wx.showToast({
                  title: '更新成功',
                  duration: 2000,
                  success(res) {
                    setTimeout(function () {
                      wx.navigateBack({})
                    }, 2000);

                  }
                })
              }
            }
            else {
              wx.showToast({
                title: '更新失败',
                duration: 2000
              })
            }},
            fail:function(res){
              wx.showToast({
                title: '更新失败',
                duration: 2000
              })
            }


        })
      })
      
    }
    else//不保存
    {
      _this.prevsetdata()
      wx.navigateBack({})
    }
    

  },

  //获取位置授权
  getUserLocation: function () {
    var _this = this;
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          //未授权
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: function (res) {
              if (res.cancel) {
                //取消授权
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })

              } else if (res.confirm) {
                //确定授权，通过wx.openSetting发起授权请求
                wx.openSetting({
                  success: function (res) {
                    if (res.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      //再次授权，调用wx.getLocation的API
                      _this.getlocation();
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        }
        else if (res.authSetting['scope.userLocation'] == undefined) {
          //用户首次进入页面,调用wx.getLocation的API
          _this.getlocation();
        }
        else {
          console.log('授权成功')
          //调用wx.getLocation的API
          _this.getlocation();
        }
      }
    })

  }, 

  //获取地址
  getlocation:function(){
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        console.log(res)
        var qqapi = that.data.qqmapsdk
        qqapi.reverseGeocoder({
          location: {
                latitude: res.latitude,
                longitude: res.longitude
            },
            success: function (res) {
                console.log(res);
                that.setData({ city: res.result.address_component.city})
            },
            fail: function (res) {
                console.log(res);
            }
        });
        that.setData({
          longitude: res.longitude,
          latitude:res.latitude,
          address:res.address
        })
      }
    })  
  },

  //姓名
  name_input: function (e){
    this.setData({
      name: e.detail.value
    })

  },

  //电话
  phone_input: function (e) {
    this.setData({
      phone: e.detail.value
    })

  },

  //地址备注
  note_input: function (e) {
    this.setData({
      note: e.detail.value
    })

  },

  //radio选择
  setup:function(e){
      var _this = this
    if (_this.data.setup == '/images/radio_checked.png'){
      _this.setData({ 
        setup:'/images/radio_no.png',
        savetoadd:false,
        setasdefault:false
      })
    }
    else
    {
      _this.setData({ 
        setup: '/images/radio_checked.png',
        savetoadd:true,
        setasdefault: true
      })
    }
  },

  //设置上一页地址信息
  prevsetdata:function(){
    console.log('prevsetdata')
    var _this = this
    //获取上一个页面，1.下单页面 2 地址簿-设为默认地址
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];//当前页面
    var prevpage = pages[pages.length - 2];//上一个页面
    var prevaction = _this.data.prevaction
    if(prevaction == 'sendfrom'){
        prevpage.setData({
          sendfrom_title: _this.data.name +'  '+_this.data.phone,
          sendfrom_address: _this.data.address +' ' +_this.data.note,
          sendfrominfo: JSON.stringify({
            city: _this.data.city,
            address: _this.data.address,
            note: _this.data.note,
            name: _this.data.name,
            phone: _this.data.phone,
            location: {
              type: "Point",
              coordinates: [_this.data.longitude, _this.data.latitude]
            }
          })
        })
    }
    else if (prevaction == 'sendto')//sendto
    {
      prevpage.setData({
        sendto_title: _this.data.name + '  ' + _this.data.phone,
        sendto_address: _this.data.address +' '+ _this.data.note,
        sendtoinfo: JSON.stringify({
          city: _this.data.city,
          address: _this.data.address,
          note: _this.data.note,
          name: _this.data.name,
          phone: _this.data.phone,
          location: {
            type: "Point",
            coordinates: [_this.data.longitude, _this.data.latitude]
          }

        })
      })
    }
    else//新增 编辑
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