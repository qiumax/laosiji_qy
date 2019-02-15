// pages/publish/index.js
var handlogin = require('../../utils/handlelogin.js');
const app = getApp()
var pickerFile = require('picker_datetime.js');
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var amapFile = require('../../utils/amap-wx.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowWidth: 0,
    windowHeight: 0,
    switch_cal: true,//计算方式
    sendfrom_title: '寄件人信息',
    sendfrom_address: '点击填写寄件人地址',
    sendfrominfo:[],//发件人信息
    sendtoinfo:[],//收件人信息
    sendto_title: '收件人信息',
    sendto_address: '点击填写收件人地址',
    productValueTitle:'货物重量',
    productValueDesc: '货物重量(吨)',
    changeValue:0,//重量 体积
    productName:'',//产品名
    starttime:'',//发货时间
    peizaitypes:['整车','配载'],
    peizai:'整车',
    price_type:'zhengche',
    chaoxians: ['未超限', '超限'],
    money:0,//金额
    distance:0,//距离
    showmoney:'display:none',
    truckid:'',
    currentId:1,
    price_dun:0,
    mass:0,
    youka:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    _this.setData({ truckid:options.truckid})
    _this.setData({ currentId: options.currentId })
    // 实例化API核心类
    var qqmapsdk = new QQMapWX({
      key: 'TSFBZ-YAN3U-S2BVJ-4AP4W-XWEQF-GYFRI'
    });
    _this.setData({ qqmapsdk: qqmapsdk })

    //计算view宽度
    var query = wx.createSelectorQuery();
    query.select('.addressbook').boundingClientRect()
    query.exec((res) => {
      console.log(res)
      var addwidth = res[0].width; // 
      _this.setData({ addwidth: addwidth+15})
      _this.setData({ loacationwidth: _this.data.windowWidth - addwidth - 66 })

    })
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
    var _this = this;
    //_this.setData({ price: 0})
    //计算屏幕宽度
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({ windowWidth: res.windowWidth })
        _this.setData({ windowHeight: res.windowHeight })
      },
    })

    //时间选择
    _this.datetimePicker = new pickerFile.pickerDatetime({
      page: _this,
      duration: 100,
    });

    //计算距离 价格
    _this.calprice()
    _this.caldistanc()
    console.log(_this.data.sendfrominfo)
      
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


  datepicker: function () {
    this.datetimePicker.setPicker('starttime');
  },

  enddatepicker:function(){
    this.datetimePicker.setPicker('endtime');
  },
  getsendfrom:function(){
    var _this = this

    var sendfrominfo = _this.data.sendfrominfo
    console.log(sendfrominfo)
    if (sendfrominfo) {
      wx.navigateTo({
        url: '/pages/adddetail/index?type=sendfrom&frominfo=' + sendfrominfo,
      })
    }
    else
    {
      wx.navigateTo({
        url: '/pages/adddetail/index?type=sendfrom',
      })
    }
  },
  getsendto: function () {
    var _this = this
    var sendtoinfo = _this.data.sendtoinfo
    console.log(sendtoinfo)
    if(sendtoinfo){
      wx.navigateTo({
        url: '/pages/adddetail/index?type=sendto&toinfo=' + sendtoinfo,
      })
    }
    else
    {
      wx.navigateTo({
        url: '/pages/adddetail/index?type=sendto',
      })
    }

  },

  getaddfrom:function(){
    wx.navigateTo({
      url: '/pages/address/index?type=sendfrom',
    })

  },

  getaddto: function () {
    wx.navigateTo({
      url: '/pages/address/index?type=sendto',
    })
  },

  getorder:function(){
    wx.navigateTo({
      url: '/pages/orderdetail/index',
    })
  },

//配载选项
  // bindpeizaiChange:function(e){
  //   console.log(e)
  //   var _this = this
  //   var typeindex = e.detail.value
  //   var price_type = 'mass' 
  //   _this.setData({peizai:_this.data.peizaitypes[typeindex]})
  //   if(typeindex == 0)
  //   {
  //     price_type = 'zhengche' 
  //   }
  //   else if (typeindex == 1)
  //   {
  //     price_type = 'peizai' 
  //   }
  //   else
  //   {
  //     price_type = 'mass'
  //   }
  //   _this.setData({ price_type: price_type})
  //   if (_this.data.chaoxian_type) {
  //     _this.getprice()
  //   }
   
  // },

  //超限选项
  bindchaoxianChange: function (e) {
    console.log(e)
    var _this = this
    var cxIndex = e.detail.value
    var chaoxian_type
    _this.setData({ chaoxian: _this.data.chaoxians[cxIndex] })
    chaoxian_type = cxIndex
   
    _this.setData({ chaoxian_type: chaoxian_type })
    if(_this.data.price_type)
    {
      _this.getprice()
    }


  },

  getprice:function(){
    var _this = this
    handlogin.isLogin(() => {
      wx.request({
        url: app.globalData.host + '/api/need/getPrice',
        data: {
          'user_id': wx.getStorageSync('user_id'),
          's_id': wx.getStorageSync('s_id'),
          'price_type': _this.data.price_type,
          'chaoxian_type': _this.data.chaoxian_type,
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        }, // 设置请求的 header
        success: function (res) {
          console.log(res)
          if (!res.data.err) {
            _this.setData({
              price: res.data.price
            })
          }
        }
      })

    })
  },
  //提交
  pulish:function(e){
    console.log(e)
    var _this = this
      
    if (_this.data.sendfrom_title == '寄件人信息' || _this.data.sendfrom_address =='点击填写寄件人地址'){
      wx.showToast({
        title: '请填写发件人信息',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
  
    if (_this.data.sendto_title == '收件人信息' || _this.data.sendto_address =='点击填写收件人地址') {
      wx.showToast({
        title: '请填写收件人信息',
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    var mass = 0
    var volume = 0
    var price_type ='mass'
    //发货时间
    var needtime = _this.data.starttime+":00"
    var arrive_time = _this.data.endtime+":00"
    needtime = needtime.replace(/-/g, '/'); 
    arrive_time = arrive_time.replace(/-/g, '/'); 
    if (!needtime || needtime == '')
    {
      wx.showToast({
        title: '请选择发货时间！',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    var T = new Date(needtime);
    
    var pubtime = T.getTime()/1000
    if (pubtime < Date.parse(new Date())/1000)
    {
      wx.showToast({
        title: '请选择正确的发货时间！',
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    if (pubtime == 'null' || pubtime=='')
    {
      wx.showToast({
        title: '请选择正确的发货时间！',
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    

    if (!arrive_time || arrive_time == '') {
      wx.showToast({
        title: '请选择到货时间！',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    var T_arrive = new Date(arrive_time);

    arrive_time = T_arrive.getTime() / 1000
    if (arrive_time < Date.parse(new Date()) / 1000) {
      wx.showToast({
        title: '请选择正确的到货时间！',
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    if (arrive_time == 'null' || arrive_time == '') {
      wx.showToast({
        title: '请选择正确的到货时间！',
        icon: 'none',
        duration: 1000
      })
      return false;
    }


  //货物名称
    var productName = _this.data.productName
    if (!productName || productName == '') {
      wx.showToast({
        title: '货物名称不能为空！',
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    var peizai = _this.data.peizai
    if (!peizai || peizai == '') {
      wx.showToast({
        title: '配载信息不能为空',
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    var chaoxian = _this.data.chaoxian
    if (!chaoxian || chaoxian == '') {
      wx.showToast({
        title: '超限信息不能为空',
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    var size = _this.data.size
    console.log(size)
    if (!size || size == '') {
      wx.showToast({
        title: '货物尺寸不能为空！',
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    var remark = _this.data.remark
    if (!remark || remark == '') {
      wx.showToast({
        title: '备注不能为空',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    //货物重量
    var mass = _this.data.mass
    if (mass == 0)
    {
      wx.showToast({
        title: '重量不能为空！',
        icon: 'none',
        duration: 1000
      })
      return false;
    }



    var truck_type ='不限'
    //货车类型
    if(_this.data.currentId == 2)
    {
      truck_type='高栏'
    }
    else if (_this.data.currentId == 3){
      truck_type = '重板'
    }
    else if (_this.data.currentId == 4) {
      truck_type = '轻板'
    }
    else if (_this.data.currentId == 5) {
      truck_type = '厢式'
    }
    else{
      truck_type = '不限'
    }
    
    var price = _this.data.money
    var youka = _this.data.youka
    
    var distance = _this.data.distance
    if (!price || price==0 || !distance || distance==0){
      wx.showToast({
        title: '价格，距离不能为空！',
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    if (youka > price*0.3)
    {
      wx.showToast({
        title: '油卡金额不能高于运单总金额30%',
        icon: 'none',
        duration: 1000
      })
      return false;
    }

    handlogin.isLogin(() => {
      console.log('pubtime')
      console.log(pubtime)
      wx.request({
        url: app.globalData.host + '/api/need/publishNeed',
        data: {
          'user_id': wx.getStorageSync('user_id'),
          's_id': wx.getStorageSync('s_id'),
          'from':_this.data.sendfrominfo,
          'to':_this.data.sendtoinfo,
          'time': pubtime,
          'arrive_time': arrive_time,
          'peizai': peizai,
          'chaoxian': chaoxian,
          'youka':youka,
          'cargo': productName,
          'size': size,
          'remark': remark,
          'truck_type': truck_type,
          'price_type': price_type,
          'mass': mass,
          'distance': distance,
          'volume': volume,
          'truck_id': _this.data.truckid,
          'price': price,
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        }, // 设置请求的 header
        success: function (res) {
          console.log(res)
          if (!res.data.err) {
            wx.showToast({
              title: '订单提交成功！',
              icon: 'success',
              duration: 2000
            })
            wx.navigateTo({
              url: '/pages/orderdetail/index?order_id=' + res.data._id,
            })
          }
          else {
            wx.showToast({
              title: '提交失败，请重试',
              icon: 'none',
              duration: 1000
            })
            return false;
          }
        },
        fail: function (res) {
          console.log(res)
          wx.showToast({
            title: '提交失败，请重试',
            icon: 'none',
            duration: 1000
          })
          return false;
        }

      })

    })
  },

  //计算距离
  caldistanc:function(){
    var _this = this
    var qqapi = _this.data.qqmapsdk
   console.log('caldistance')
    if (this.data.sendfrominfo == '' || _this.data.sendtoinfo == '') {
      return false;
    }

    var frominfo = JSON.parse(_this.data.sendfrominfo)
    var toinfo = JSON.parse(_this.data.sendtoinfo)
    console.log(frominfo)
    wx.request({
      url: 'https://restapi.amap.com/v4/direction/truck?parameters',
      data:{
        key: '827c1fb597e927669eff7f1c63991f3d',
        origin: frominfo.location.coordinates[0] + "," + frominfo.location.coordinates[1],
        destination: toinfo.location.coordinates[0] + "," + toinfo.location.coordinates[1],
        strategy: 8,
        size: 4
      },
      success: function (res) {
        console.log(res)
        var distance = res.data.data.route.paths[0].distance
        // if (distance > resdata.route.paths[1].distance) {
        //   distance = data.route.paths[1].distance
        // }
        // if (distance > data.route.paths[2].distance) {
        //   distance = data.route.paths[2].distance
        // }
        var distance = Math.round(distance / 1000)
        if(distance<100)
        {
          distance =100
        }
        _this.setData({ distance: distance })
        _this.calprice()

      }
    })
    // var myAmapFun = new amapFile.AMapWX({ key: '0bac3cb43f733478b446998dc86ccc11' });
    // myAmapFun.getDrivingRoute({
    //   origin: frominfo.location.coordinates[0] + "," + frominfo.location.coordinates[1],
    //   destination: toinfo.location.coordinates[0] + "," + toinfo.location.coordinates[1],
    //   strategy: 11,
    //   success: function (data) {
    //     var distance = data.paths[0].distance
    //     if (distance > data.paths[1].distance)
    //     {
    //       distance = data.paths[1].distance
    //     }
    //     if (distance > data.paths[2].distance) {
    //       distance = data.paths[2].distance
    //     }
        
    //     _this.setData({ distance: Math.round(distance / 1000)})
    //     _this.calprice()

    //   }
    // })

    // qqapi.calculateDistance({
    //   mode:'driving',
    //   from: {
    //     latitude: frominfo.location.coordinates[1],
    //     longitude: frominfo.location.coordinates[0]
    //   },
    //   to: [{
    //     latitude: toinfo.location.coordinates[1],
    //     longitude: toinfo.location.coordinates[0]
    //   }],
    //   success: function (res) {
    //     console.log(res);
    //     if(res.status == 0)
    //     {
    //       _this.setData({ distance: Math.round(res.result.elements[0].distance / 1000) }) 
    //       _this.calprice()
    //     }
    //   },
    //   fail:function(res){
    //     console.log(res)
    //   }
    // });
  },
  //计算价格
  calprice:function(){
    var _this = this
    //货物重量 体积
    var mass = 0
    var volume = 0
    var price_type = _this.data.price_type
    var chaoxian_type = _this.data.chaoxian_type
    mass = _this.data.mass
    var distance =_this.data.distance
    if (mass == 0) {
      return false;
    }
   
    if (distance == 0)
    {
      return false;
    }


    handlogin.isLogin(() => {
      wx.request({
        url: app.globalData.host + '/api/need/getNeedPrice',
        data: {
          'user_id': wx.getStorageSync('user_id'),
          's_id': wx.getStorageSync('s_id'),
          'distance':distance,
          'price_type': price_type,
          'chaoxian_type': chaoxian_type,
          'mass': mass,
          'volume': volume,
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        }, // 设置请求的 header
        success: function (res) {
          console.log(res)
          if (!res.data.err) {
            _this.setData({ 
              money: Math.round(res.data.price)
            })
          }
        }
      })

    })
  },

  //名称
  productname:function(e){
    console.log(e)
    var _this =this
    var name = e.detail.detail.value
    _this.setData({productName:name})
  },

  //高度
  gaodu: function (e) {
    console.log(e)
    var _this = this
    var gaodu = e.detail.value
    gaodu=gaodu.replace('米','')
    gaodu = gaodu.replace('高', '')
    gaodu = gaodu.replace(' ', '')
    if (isNaN(gaodu) || gaodu == 0 || gaodu=='') {
      wx.showToast({
        title: '请输入数字',
        icon: 'none',
        duration: 1000
      })
      return false;

    }
    _this.setData({ gaodu: gaodu })
    _this.setData({ gaodumi:  "高"+gaodu +"米" })
    if (gaodu > 0 && _this.data.changdu > 0 && _this.data.kuandu > 0) {
      _this.setData({ size: _this.data.changdu + "米" + " * " + _this.data.kuandu + "米" + " * " + gaodu + "米"})
    }

  },

  //宽度
  kuandu: function (e) {
    console.log(e)
    var _this = this
    var kuandu = e.detail.value
    kuandu = kuandu.replace('米', '')
    kuandu = kuandu.replace('宽', '')
    kuandu = kuandu.replace(' ', '')
    if (isNaN(kuandu) || kuandu == 0) {
      wx.showToast({
        title: '请输入数字',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    if (_this.data.gaodu > 0 && _this.data.changdu > 0 && kuandu > 0) {
      _this.setData({ size: _this.data.changdumi + "米" + " * " + kuandu + "米" + " * " + _this.data.gaodu + "米"})
    }
    _this.setData({ kuandu: kuandu })
    _this.setData({ kuandumi:"宽"+kuandu+ "米" })
  },


  //长度
  changdu: function (e) {
    console.log(e)
    var _this = this
    var changdu = e.detail.value
    changdu = changdu.replace('米', '')
    changdu = changdu.replace('长', '')
    changdu = changdu.replace(' ', '')
    if (isNaN(changdu) || changdu == 0) {
      wx.showToast({
        title: '请输入数字',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    if (_this.data.gaodu > 0 && _this.data.kuandu>0 && changdu>0)
    {
      _this.setData({ size: changdu + "米" + " * " + _this.data.kuandu + "米" + " * " + _this.data.gaodu + "米"  })
    }
    _this.setData({ changdu: changdu })
    _this.setData({ changdumi: "长"+changdu+"米" })
  },

  //尺寸
  size: function (e) {
    console.log(e)
    var _this = this
    var name = e.detail.detail.value
    _this.setData({ size: name })
  },

  //备注
  remark: function (e) {
    console.log(e)
    var _this = this
    var name = e.detail.detail.value
    _this.setData({ remark: name })
  },

//油卡金额
  youka:function(e){
    console.log(e)
    var _this = this
    var youka = e.detail.detail.value
    console.log(isNaN(youka))
    if (isNaN(youka)) {
      wx.showToast({
        title: '请输入数字',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    _this.setData({ youka: youka })
   
  },

  //重量
  mass: function (e) {
    console.log(e)
    var _this = this
    var mass = e.detail.detail.value
    console.log(isNaN(mass))
    if (isNaN(mass) || mass == 0) {
      wx.showToast({
        title: '请输入数字',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    _this.setData({ mass: mass })
    _this.calprice()
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})