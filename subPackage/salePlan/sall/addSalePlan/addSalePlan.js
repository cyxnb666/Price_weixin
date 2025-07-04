// subPackage/salePlan/sall/addSalePlan/addSalePlan.js
import {
  selectCurrentStall,
  selectStallFruiveggies,
  regeo,
  saveLargeSaleCollectCategoryPrice,
  filepreview,
  selectStallLinkers,
  softRemoveFile,
  saveLargeSalePlan,
  editLargeSalePlan,
  getLargePlan
} from "../../../../utils/api"
import dayjs from 'dayjs';
const now = dayjs().locale('zh-cn');
import {
  Toast
} from "tdesign-miniprogram";
import {
  env
} from "../../../../utils/env";
import {
  isImageVideoUrl
} from "../../../../utils/util"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dialogValue: false,
    userInfo: {},
    categoryes: [],
    specssIndex: '',
    salePalnDetail: {
      "categoryId": '',
      "fileIds": [],
      "latitude": "",
      "linkerMobile": "",
      "linkerName": "",
      "longitude": "",
      "planSaleDate": now.format('YYYY-MM-DD'),
      "planSaleWeight": '',
      "registAddress": "",
      "stallId": "",
      "submitType": "",
      "varietyId": ''
    },
    deleteObj: {
      key: '',
      index: '',
      id: '',
    },
    buttomVariet: [],
    categoryList: [],
    pickerVisible: false,
    pickerValue: "",
    pickerTitle: "",
    pickerKay: '',
    planId: "",
    priceError: false,
    showConfirm: false,
    stagingLoading: false,
    submitLoading: false,
    confirmBtn: {
      content: '删除',
      variant: 'base'
    },
    priceFormat: (v) => {
      const isNumber = /^\d+(\.\d+)?$/.test(v);
      if (isNumber) {
        return parseFloat(v).toFixed(2);
      }
      return v;
    },
    pickerOptions: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    if (options.planId) {
      this.setData({
        planId: options.planId
      })
      this.getLargePlan(options.planId);
    } else {
      this.init()
      this.getCurrentStall()
    }
    this.setData({
      userInfo: wx.getStorageSync('userInfo')
    })

  },
  getLargePlan(planId) {
    let params = {
      "condition": {
        "primaryKey": planId
      }
    }
    getLargePlan(params).then(async (res) => {
      console.log(res)
      await this.getButtomVarietiesl(res.stallId)
      this.setData({
        salePalnDetail: {
          ...this.data.salePalnDetail,
          ...res,
        },
        categoryes: res.specss,
        "categoryList": this.data.buttomVariet.filter(v => v.varietyId === res.varietyId)[0] ? this.data.buttomVariet.filter(v => v.varietyId === res.varietyId)[0].categories : []
      })
    })
  },
  onDateChange(e) {
    this.setData({
      'salePalnDetail.planSaleDate': e.detail,
    });
  },
  init() {
    wx.getLocation({
      success: res => {
        console.log(res)
        let params = {
          "condition": {
            "latitude": res.latitude,
            "longitude": res.longitude
          }
        }
        regeo(params).then(result => {
          this.setData({
            "salePalnDetail.latitude": res.latitude,
            "salePalnDetail.longitude": res.longitude,
            "salePalnDetail.registAddress": result.address
          })
        })
      }
    })
    // this.getButtomVarietiesl()
  },
  addLinker(value) {
    console.log(value)
    this.setData({
      'salePalnDetail.linkerMobile': value.detail.linkerMobile,
      'salePalnDetail.linkerName': value.detail.linkerName,
      dialogValue: false
    })
  },
  closeAddDialog() {
    this.setData({
      dialogValue: false
    })
  },
  onAddLinker(e) {
    console.log(e)
    this.setData({
      dialogValue: true
    })
  },
  updateCategory(e) {
    const data = e.detail.data;
    console.log(data, 'data')
    console.log(this.data.categoryList, 'categoryList')
    this.setData({
      categoryes: data
    })
  },
  addCategory(e) {
    console.log(this.data.categoryList.length,this.data.categoryes.length)
    let data = [...this.data.categoryes]
    if ( this.data.categoryes.length < this.data.categoryList.length) {
      data.push({
        categoryId: '',
        categoryName: "",
        saleDate: "",
        planSaleWeight:"",
        varietyId: this.data.salePalnDetail.varietyId,
        varietyName: this.data.salePalnDetail.varietyName
      })
      this.setData({
        categoryes:data
      })
    } else {
      this.toast("不能新增","warning")
    }
  },
  deleteCategory(e) {
    console.log(e)
    const index = e.detail.params.index;
    let data = [...this.data.categoryes]
    data.splice(index, 1)
    this.setData({
      categoryes: data
    })
  },

  tagClick(e) {
    this.setData({
      "salePalnDetail.varietyId": e.currentTarget.dataset.varietyid,
      "categoryList": this.data.buttomVariet.filter(v => v.varietyId === e.currentTarget.dataset.varietyid)[0].categories
    })
  },
  tagcategoryClick(e) {
    console.log(e)
    this.setData({
      "salePalnDetail.categoryId": e.currentTarget.dataset.categoryid,
    })
  },
  onPickerCancel(e) {
    console.log('onPickerCancel', e)
  },
  onPriceInput(e) {
    const {
      priceError
    } = this.data;
    const isNumber = /^\d+(\.\d+)?$/.test(e.detail.value);
    console.log(e.detail.value)
    if (priceError === isNumber) {
      this.setData({
        priceError: !isNumber,
      });
    } else {
      this.setData({
        "salePalnDetail.planSaleWeight": e.detail.value
      })
    }
  },
  onPickerConfirm(e) {
    console.log(e)
    const index = this.data.specssIndex;
    const key = this.data.pickerKay;
    let data = [...this.data.categoryes]
    console.log(this.data.categoryList, index, 'categoryList')
    if (this.data.pickerKay === 'linkerName') {
      const linkerMobile = e.detail.label[0].split('-')[1]
      this.setData({
        'salePalnDetail.linkerMobile': linkerMobile,
      })
    } else if (this.data.pickerKay = 'categoryId') {
      if(this.data.categoryes.find(v=>v.categoryId == e.detail.value[0])){
        this.toast(e.detail.label[0] +"已存在暂不能新增",'warning')
        return 
      } else {
        data[index][key] = e.detail.value[0];
        this.setData({
          categoryes: data
        })
      }
  
    }
    console.log('数据更新', this.data.categoryes)
    console.log('数据更新', this.data.categoryList)
    this.setData({
      [`salePalnDetail.${this.data.pickerKay}`]: e.detail.value[0],
    })

  },
  getStallLinkers(stallId) {
    const params = {
      condition: {
        primaryKey: stallId
      }
    }
    selectStallLinkers(params).then((res) => {
      if (res.length) {
        let item = res[0]
        this.setData({
          "salePalnDetail.linkerName": item.linkerName,
          "salePalnDetail.linkerMobile": item.linkerMobile,
        })
      }

    })
  },
  getLinkerName(e) {
    const key = e.target.dataset.key
    this.setData({
      pickerKay: key,
    })
    const params = {
      condition: {
        primaryKey: this.data.salePalnDetail.stallId
      }
    }
    selectStallLinkers(params).then((res) => {
      this.setData({
        pickerOptions: res.map(item => {
          return {
            label: `${item.linkerName}-${item.linkerMobile}`,
            value: item.linkerName,
          }
        }),
        pickerValue: this.data.salePalnDetail.linkerName,
        pickerTitle: '协助采价员联系人',
        pickerVisible: true,
      })
    })
  },
  handleSelectItem(e) {
    const {
      index
    } = e.detail;

    this.setData({
      specssIndex: index,
      pickerKay: 'categoryId'
    });
    console.log(this.data.categoryList, 'this.data.categoryList')
    this.setData({
      pickerOptions: this.data.categoryList.map(item => {
        return {
          label: item.categoryName,
          value: item.categoryId
        };
      }),
      pickerTitle: '品种小类',
      pickerValue: this.data.categoryes[index].categoryId,
      pickerVisible: true
    });
  },
  getButtomVarietiesl(stallId, flag) {
    let params = {
      "condition": {
        "primaryKey": stallId
      }
    }
    selectStallFruiveggies(params).then(res => {
      this.setData({
        buttomVariet: res,
        "categoryList": res.filter(v => v.varietyId === this.data.salePalnDetail.varietyId)[0] ? res.filter(v => v.varietyId === this.data.salePalnDetail.varietyId)[0].categories : []
      })
      if (flag) {
        if (res.length) {
          this.setData({
            "salePalnDetail.varietyId": res[0].varietyId,
            "categoryList": res.filter(v => v.varietyId === res[0].varietyId)[0] ? res.filter(v => v.varietyId === res[0].varietyId)[0].categories : [],
            categoryes: res.filter(v => v.varietyId === res[0].varietyId)[0] ? res.filter(v => v.varietyId === res[0].varietyId)[0].categories : []
          })
        }
      }
    })
  },
  getCurrentStall() {
    selectCurrentStall().then(res => {
      console.log(res)
      this.setData({
        'salePalnDetail.stallId': res.stallId,
        'salePalnDetail.stallName': res.stallName
      })
      this.getButtomVarietiesl(res.stallId, true);
      !this.data.planId && this.getStallLinkers(res.stallId)
    })
  },
  async onIconTap(e) {
    switch (e.target.dataset.type) {
      case 'location':
        const that = this
        try {
          const res = await wx.authorize({
            scope: 'scope.userLocation',
          })
          console.log('scope.userLocation', res)
          // 2. 判断手机微信App是否拥有定位访问权限
          const appAuthorizeSetting = wx.getAppAuthorizeSetting()
          if (appAuthorizeSetting.locationAuthorized === 'authorized') {
            // 3. 判断用户手机定位开关是否开启
            const systemSetting = wx.getSystemSetting()
            if (systemSetting.locationEnabled) {
              console.log('小程序可以正常使用用户位置信息')
              wx.chooseLocation({
                type: 'wgs84',
                success(res) {
                  that.setData({
                    'salePalnDetail.latitude': res.latitude,
                    'salePalnDetail.longitude': res.longitude,
                    "salePalnDetail.registAddress": res.address
                  })
                },
                fail(err) {
                  console.log(err)
                }
              })
            } else {
              console.log('手机定位暂未开启')
            }
          } else {
            console.log('手机微信暂无定位权限')
          }
        } catch (err) {
          console.log('scope.userLocation', err)
          // return new Result(-1, '小程序暂无定位权限')
        }
        break;
      case 'calendar':
        this.setData({
          dateVisible: true
        })
        break;

      default:
        break;
    }

    console.log(e.target.dataset.type)
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
  chooseMedia(e) {
    const that = this
    const sourceType = e.target.dataset.type
    const key = e.target.dataset.key
    wx.chooseMedia({
      count: 9,
      mediaType: ['image', 'video'],
      sourceType: [sourceType],
      camera: 'back',
      success(res) {
        res.tempFiles.forEach((temp) => {
          if (temp.tempFilePath) that.uploadFile(temp.tempFilePath, key)
        })
      }
    })
  },
  chooseMessageFile(e) {
    const that = this
    const key = e.target.dataset.key
    wx.chooseMessageFile({
      count: 10,
      type: 'all',
      success(res) {
        res.tempFiles.forEach((temp) => {
          if (temp.path) that.uploadFile(temp.path, key)
        })
      }
    })
  },
  uploadFile(tempFilePaths, key) {
    const that = this
    wx.uploadFile({
      url: `${env.baseURL}/file/uploadFile`, //仅为示例，非真实的接口地址
      filePath: tempFilePaths,
      name: 'file',
      header: {
        'content-type': 'multipart/form-data',
        'X-Access-Token': wx.getStorageSync('token')
      },
      success(res) {
        const {
          retCode,
          retData,
          retMsg
        } = JSON.parse(res.data)
        if (retCode === 200) {
          that.data.salePalnDetail[key].push(retData)
          that.setData({
            [`salePalnDetail.${key}`]: that.data.salePalnDetail[key],
          });
          that.toast('上传成功', 'success')
        } else {
          that.toast(retMsg, 'warning')
        }
      }
    })
  },
  closeDialog() {
    this.setData({
      showConfirm: false,
      deleteObj: {
        key: '',
        index: '',
        id: '',
      }
    })
  },
  confirmDelete() {
    const key = this.data.deleteObj.key
    const index = this.data.deleteObj.index
    const id = this.data.deleteObj.id
    const params = {
      condition: {
        primaryKeys: [id]
      }
    }
    softRemoveFile(params).then((res) => {
      if (res) {
        this.data.salePalnDetail[key].splice(index, 1)
        this.setData({
          [`salePalnDetail.${key}`]: this.data.salePalnDetail[key],
          showConfirm: false,
        });
        this.toast('删除成功', 'success')
      }
    })
  },
  fileDelete(e) {
    const key = e.target.dataset.key
    const index = e.target.dataset.index
    this.data.salePalnDetail[key].splice(index, 1)
    this.setData({
      [`salePalnDetail.${key}`]: this.data.salePalnDetail[key],
    });
    // const key = e.target.dataset.key
    // const index = e.target.dataset.index
    // const id = e.target.dataset.id
    // const params = {
    //   condition: {
    //     primaryKeys: [id]
    //   }
    // }
    // softRemoveFile(params).then((res) => {
    //   if (res) {
    //     this.data.salePalnDetail[key].splice(index, 1)
    //     this.setData({
    //       [`salePalnDetail.${key}`]: this.data.salePalnDetail[key],
    //     });
    //     this.toast('删除成功', 'success')
    //   }
    // })
  },
  preview(e) {
    const id = e.target.dataset.id
    const key = e.target.dataset.key
    const index = e.target.dataset.index
    if (['image', 'video'].includes(isImageVideoUrl(id))) {
      let priceImg = this.data.salePalnDetail[key].filter((v, i) => i === index)
      const sources = priceImg.map(item => {
        let params = {
          condition: {
            primaryKey: item,
          },
        }
        return filepreview(params)
      })
      wx.showLoading({
        title: '加载中',
      })
      Promise.all(sources).then(list => {
        const sourcesList = priceImg.map((item, index) => {
          let filePath = wx.env.USER_DATA_PATH + "/" + item;
          fs.writeFileSync(filePath, // wx.env.USER_DATA_PATH 指定临时文件存入的路径，后面字符串自定义
            list[index].data,
            "binary", //二进制流文件必须是 binary
          )
          return {
            url: filePath,
            type: isImageVideoUrl(item)
          }
        })
        wx.hideLoading()
        wx.previewMedia({
          sources: sourcesList,
          fail: (err) => {
            console.log(err)
          }
        })
      })
    }
    // else {
    //   wx.downloadFile({
    //     url: `${env.ImageUrl}${id}`,
    //     // url: `https://webxtx-test-sz.oss-cn-shenzhen.aliyuncs.com/price_saas/${id}`,
    //     success: function (res) {
    //       const filePath = res.tempFilePath
    //       wx.openDocument({
    //         filePath: filePath,
    //         success: function (res) {
    //           console.log('打开文档成功')
    //         }
    //       })
    //     }
    //   })
    // }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  // 暂存
  staging() {
    this.setData({
      stagingLoading: true
    })
    this.submitSalePlan('0')
  },
  // 提交
  submit() {


    this.setData({
      submitLoading: true
    })
    this.submitSalePlan('1')
  },
  submitSalePlan(submitType) {
    let params = {
      condition: {
        ...this.data.salePalnDetail,
        specss: this.data.categoryes,
        submitType
      }
    }
    let RequestUrl = this.data.salePalnDetail.planId ? editLargeSalePlan : saveLargeSalePlan
    RequestUrl(params).then(res => {
      this.setData({
        submitLoading: false,
        stagingLoading: false,
      })
      this.toast(submitType == '1' ? '提交成功' : '暂存成功', 'success')
      if (submitType == '1') {
        console.log(res, '=====')
        let planId = typeof res === "string" ? res : this.data.salePalnDetail.planId
        wx.navigateTo({
          url: `/subPackage/salePlan/sall/priceSend/priceSend?planId=${planId}&stallId=${this.data.salePalnDetail.stallId}&stallName=${this.data.salePalnDetail.stallName}&collectPriceId=null&delta=2`,
        })
        console.log(`/subPackage/salePlan/sall/priceSend/priceSend?planId=${res}&stallId=${this.data.salePalnDetail.stallId}&stallName=${this.data.salePalnDetail.stallName}&collectPriceId=null`)
      } else {
        wx.navigateBack({
          delta: 1,
          success: (res) => {},
          fail: (res) => {},
          complete: (res) => {},
        })
      }
    }).catch(() => {
      this.setData({
        submitLoading: false,
        stagingLoading: false,
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // this.getCurrentStall();
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