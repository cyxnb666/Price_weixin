// home.js
import {
  linkSocket
} from "../../utils/WebSocket";
import {
  selectHome
} from "../../utils/api"
Page({
  data: {
    showConfirm: false,
    userInfo: {},
    confirmBtn: {
      content: '去登录',
      variant: 'base'
    },
    menuList: {
      "COLLECTOR": [ //采价员
        // {
        //   path: '/pages/pricingTask/pricingTask',
        //   icon: '/pages/images/miningPriceTask.png',
        //   menuName: '采价任务',
        //   rightIcon: 'alarm',
        //   rightLabel: '待提交',
        //   key: 'ctaskNSubmitCount',
        //   length: 0
        // },
        // {
        //   path: '/subPackage/salePlan/minPrice/list/list',
        //   icon: '/pages/images/salePlan.png',
        //   menuName: '大额出售计划',
        //   rightIcon: 'alarm',
        //   key: 'largeNRecvCount',
        //   length: 0,
        //   rightLabel: '待认领'
        // },
        {
          path: '/subPackage/autopriceReport/autopriceReport',
          icon: '/pages/images/Autocollection.png',
          menuName: '自主采价上报'
        },
        // {
        //   path: '/subPackage/marketRecord/marketRecord',
        //   icon: '/pages/images/market.png',
        //   menuName: '行情上报',
        //   rightIcon: 'alarm',
        //   key: 'orderCount',
        //   length: 0,
        //   rightLabel: '待处理'
        // },
      ],
      "STALL_LINKER_CUSTOMER": [ //农户-优质客户
        {
          path: '/subPackage/salePlan/sall/PriceReport/PriceReport',
          icon: '/pages/images/miningPriceTask.png',
          menuName: '出售记录',
          // rightIcon: 'alarm',
          // rightLabel: '待填报'
        },
        // {
        //   path: '/subPackage/salePlan/sall/list/list',
        //   icon: '/pages/images/salePlan.png',
        //   menuName: '出售计划',
        //   // rightIcon: 'alarm',
        //   // rightLabel: '待填报'
        // },
        {
          path: '/subPackage/orderRecord/orderRecord',
          icon: '/pages/images/orderRecord.png',
          menuName: '收购记录',
          rightIcon: 'alarm',
          key: 'orderCount',
          length: 0,
          rightLabel: '待处理'
        },
      ],
      "STALL_LINKER_FARMER": [ //农户-普通农户
        {
          path: '/subPackage/salePlan/sall/PriceReport/PriceReport',
          icon: '/pages/images/miningPriceTask.png',
          menuName: '自主价格报送',
        },
      ],
    },
    currentMenuKey: '', // 当前显示的菜单键
    userInfo: {},
    token: ""
  },
  logOut() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          wx.reLaunch({
            url: '/pages/login/login',
          })
        }
      }
    })
  },
  onShow() {
    this.initSocket();
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({
      userInfo: userInfo,
      token: wx.getStorageSync('token')
    })
    if (wx.getStorageSync('token') && userInfo) {
      // 设置当前菜单键
      this.setCurrentMenuKey(userInfo);
      userInfo.roleCode == 'COLLECTOR' && this.getselectHome()
    }
  },
  
  // 根据用户角色设置当前菜单键
  setCurrentMenuKey(userInfo) {
    let menuKey = '';
    if (userInfo.roleCode === 'COLLECTOR') {
      menuKey = 'COLLECTOR';
    } else if (userInfo.roleCode === 'STALL_LINKER') {
      // 农户需要根据secondRoleCode进一步判断
      if (userInfo.secondRoleCode === 'CUSTOMER') {
        menuKey = 'STALL_LINKER_CUSTOMER'; // 优质客户：自主价格报送+订购记录
      } else if (userInfo.secondRoleCode === 'FARMER') {
        menuKey = 'STALL_LINKER_FARMER'; // 普通农户：只有自主价格报送
      } else {
        // 兜底：如果secondRoleCode不存在或为其他值，默认使用普通农户菜单
        menuKey = 'STALL_LINKER_FARMER';
      }
    }
    this.setData({
      currentMenuKey: menuKey
    });
  },
  initSocket() {
    console.log(wx.getStorageSync('userInfo').accountNo, " wx.getStorageSync('userInfo').accountNo")
    if (wx.getStorageSync('userInfo').accountNo && wx.getStorageSync('userInfo').accountNo != 'undefined') {
      linkSocket();
    } else {
      let timer = setInterval(() => {
        if (wx.getStorageSync('userInfo').accountNo && wx.getStorageSync('userInfo').accountNo != 'undefined') {
          linkSocket();
          clearInterval(timer)
        }
      })
    }

    wx.onSocketOpen(function () {
      console.log('WebSocket连接已打开');
    });

    wx.onSocketError(function (error) {
      console.log('WebSocket连接打开失败', error);
    });

    wx.onSocketClose(function () {
      console.log('WebSocket连接已关闭');
    });
  },
  getselectHome() {
    selectHome().then(res => {
      this.setData({
        'menuList.COLLECTOR': this.data.menuList.COLLECTOR.map(v => {
          v.length = res[v.key]
          return v
        })
      })
      console.log(this.data.menuList)
    })
  },
  closeDialog() {
    this.setData({
      showConfirm: false
    })
  },
  confirmDelete() {
    this.setData({
      showConfirm: false
    })
    wx.redirectTo({
      url: '/pages/login/login',
    })
  },
  jumpPage(e) {
    const {
      token
    } = this.data.userInfo
    console.log(e, token)
    if (token) {
      wx.navigateTo({
        url: e.currentTarget.dataset.url,
        success: (res) => {
          console.log(res)
        },
        fail: (err) => {
          console.log(err)
        },
        complete: (com) => {
          console.log(com)
        }
      })
    } else {
      this.setData({
        showConfirm: true
      })
    }
  }
})