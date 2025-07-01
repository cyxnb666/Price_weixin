// orderRecord.js
import {
  selectIFruitMarkets,
  removeOrderRecord,
  marketsoftRemoveFruitMarket
} from "../../utils/api";
import {
  Toast
} from "tdesign-miniprogram";

Page({
  data: {
    disabled: false,
    cellOpend: false,
    showConfirm: false,
    orderItem: {},
    confirmBtn: {
      content: '确定',
      variant: 'base'
    },
    queryForm: {
      condition: {
        productName: '',
        status: '',
      },
      pageNo: 1,
      pageSize: 10,
    },
    statusOptions: [{
        value: '',
        label: '全部',
      },
      {
        value: '1',
        label: '待确认',
      },
      {
        value: '2',
        label: '已确认',
      },
      {
        value: '3',
        label: '已完成',
      },
      {
        value: '4',
        label: '已取消',
      },
    ],
    orderStatus: {
      // "1": "待确认",
      // "2": "已确认", 
      "3": "暂存",
      "4": "待审核",
      "5": "已完成",
    },
    orderStatusColor: {
      '3': "primary",
      '4': "success",
      '5': "success",
    },
    orderRecordList: [],
    refresherTriggered: false,
    total: 0,
  },
  
  onShow() {
    this.onSearch(true)
  },
  
  onChange(e) {
    this.setData({
      'queryForm.condition.status': e.detail.value,
    });
    this.onSearch(true)
  },
  
  toast(message, theme) {
    Toast({
      context: this,
      selector: '#t-toast',
      message: message,
      theme: theme,
      direction: 'column',
      preventScrollThrough: true,
    });
  },
  
  submit() {
  wx.navigateTo({
    url: `/subPackage/marketPriceDetail/marketPriceDetail`,
  })
},

toDetail(e) {
  const {
    fruitMarketId,
    priceStatus
  } = e.currentTarget.dataset.item;
  wx.navigateTo({
    url: `/subPackage/marketPriceDetail/marketPriceDetail?orderId=${fruitMarketId}`,
  })
},
  
  bindBlur(e) {
    this.setData({
      'queryForm.condition.productName': e.detail.value,
    });
    this.onSearch(true)
  },
  
  closeDialog(e) {
    let that = this
    console.log(e, '---', that.data.orderItem)
    if (e.type == 'confirm') {
      let params = {}
        params = {
          "condition": {
            "primaryKey": that.data.orderItem.fruitMarketId,
          }
        }
        marketsoftRemoveFruitMarket(params).then(res => {
          that.toast('删除成功', 'warning')
          this.onSearch(true)
        }).finally(() => {
          that.setData({
            showConfirm: false,
            cellOpend: false,
            orderItem: {},
          })
        })
   
    } else {
      this.setData({
        showConfirm: false,
        cellOpend: false
      })
    }
  },
  
  onDelete(e) {
    const {
      item
    } = e.currentTarget.dataset
    this.setData({
      showConfirm: true,
      orderItem: item
    })
  },
  
  onSearch(value = true) {
    console.log('刷新')
    if (value) {
      this.setData({
        'queryForm.pageNo': 1,
      });
    }
    selectIFruitMarkets(this.data.queryForm).then((res) => {
      this.setData({
        total: res.total,
        orderRecordList: value ? res.records : this.data.orderRecordList.concat(res.records)
      })
    }).finally(() => {
      this.setData({
        refresherTriggered: false
      })
    })
  },
  
  pageTurning() {
    console.log('翻页')
    if (this.data.queryForm.pageNo < (this.data.total / this.data.queryForm.pageSize)) {
      this.setData({
        'queryForm.pageNo': this.data.queryForm.pageNo + 1,
      }, () => {
        this.onSearch(false)
      })
    }
  },
})