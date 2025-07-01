// subPackages/minPrice/list/list.js
import {
  recvSalePlans
} from "../../../../utils/api"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabValue: 0,
    confirmBtn: {
      content: '认领',
      variant: 'base'
    },
    clamItem: {},
    confirmType: '',
    showConfirm: false,
    confirmContent: '',
    confirmTitle: '',
    clamPlanid: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },
  onTabsChange(e) {
    this.setData({
      tabValue: e.detail.value
    })
  },
  showDialog(data) {
    console.log(data, 'data')
    this.setData({
      showConfirm: true,
      confirmType: 'clam',
      confirmTitle: '认领大额出售计划',
      confirmContent: '请确认是否认领大额出售计划',
      clamItem: data.detail,
      clamPlanid: data.detail.clamPlanid
    })
  },
  closeDialog(e) {
    let that = this
    if (e.type == 'confirm') {
      if (this.data.confirmType == 'clam') {
        this.onClaim(this.data.clamPlanid)

      } else {
        const {
          planId,
          collectPriceId,
          stallId,
          taskId,
          stallName,
          taskStatus,
          varietyId,
          categoryId,
          linkerMobile,
          linkerName,
          registAddress,
          longitude,
          latitude
        } = this.data.clamItem
        wx.navigateTo({
          url: `/subPackage/salePlan/minPrice/sallpriceDetail/sallpriceDetail?planId=${ planId}&collectPriceId=${collectPriceId}&stallId=${stallId}&stallName=${stallName}&taskId=${taskId}&taskStatus=${taskStatus}&categoryId=${categoryId}&varietyId=${varietyId}&linkerName=${linkerName}&linkerMobile=${linkerMobile}&registAddress=${registAddress}&longitude=${longitude}&latitude=${latitude}`,
        })
        this.setData({
          showConfirm:false,
        })
      }
    } else {
      this.setData({
        showConfirm: false,
        confirmType: '',
        clamPlanid: '',
        confirmContent: '',
        confirmTitle: '',
      })
    }
  },
  // 认领
  onClaim(clamPlanid) {
    let params = {
      "condition": {
        "primaryKey": clamPlanid
      }
    }
    recvSalePlans(params).then(res => {

      this.setData({
        showConfirm: false,
        confirmType: '',
        clamPlanid: '',
        confirmContent: '',
        confirmTitle: '',
      })
      const child = this.selectComponent('.clamList')
      child.onSearch(true)
      setTimeout(() => {
        this.setData({
          showConfirm: true,
          confirmTitle: '认领成功',
          confirmType: 'clamSuccess',
          confirmContent: '是否现在执行采价？',
          confirmBtn: {
            content: '执行',
            variant: 'base'
          },
        })
      }, 300)
    }).catch(() => {
      this.setData({
        cellOpend: false,
      })
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})