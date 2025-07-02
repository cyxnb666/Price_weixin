// pages/pricingDetail.js
import {
  ownerbuildCollectPriceId,
  ownerRemoveCollectCategory,
  ownergetWxCollecpriceTask,
  queryTypeDicts,
  regeo,
  ownersaveCollectPrice,
  selectStallFruiveggies,
  filepreview,
  selectStallLinkers,
  selectVarietySpecss,
  softRemoveFile,
  selectCurrentStall
} from "../../../../utils/api";
import {
  Toast
} from "tdesign-miniprogram";
import {
  env
} from "../../../../utils/env";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    priceTypes: {
      'FARMER_SALE_PRICE': '离地价',
      'BUY_PRICE': '收购价',
      'SELL_PRICE':'出售价'
    },
    varietyUnit: {
      "UG": "元/斤",
      "UKG": "元/公斤",
    },
    refresherTriggered: false,
    stagingLoading: false,
    submitLoading: false,
    visible: false,
    pickerVisible: false,
    pickerValue: null,
    collectPriceId: null,
    busiId: null,
    busiType: null,
    stallId: null,
    taskId: null,
    specssIndex: null,
    unitPrice: null,
    pickerTitle: '',
    today: '',
    pickerKay: '',
    pricingType: 'diameterSpecsVos',
    pricingDetail: {
      stallName: '',
      collectAddress: '',
      longitude: '',
      latitude: '',
      collectDate: '',
      categoryId: '',
      varietyId: '',
      linkerName: '',
      linkerMobile: '',
      specss: [{
        fvSpecsMax: 0,
        fvSpecsMin: 0,
        fvSpecsUnit: "",
        saleChannelCode: "",
        specsId: 0,
        specsType: "",
        unitPrice: 0,
        varietyUnit: "UG",
      }],
      priceFileIds: [],
      collectFileIds: [],
    },
    pickerOptions: [],
    varieties: [],
    categories: [],
    channel: [],
    specssList: [],
    specss: [],
    showWithInput: false,
    priceError: false,
    disabled: false,
    unit:'',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    if (options.collectPriceId) {
      this.setData({
        collectPriceId: options.collectPriceId == "null" ? "" : options.collectPriceId,
        stallId: options.stallId,
        taskId: options.taskId,
        disabled: ['4', '5'].includes(options.priceStatus),
        busiType: options.busiType,
        'pricingDetail.stallName': options.stallName,
        'pricingDetail.stallId': options.stallId,
      }, async () => {
        await this.selectButtomVarietiesFn();
        if (this.data.collectPriceId != 'null' && this.data.collectPriceId) this.getDetails();
        else {
          this.setTodayDate();
          ownerbuildCollectPriceId({}).then((res) => {
            this.setData({
              busiId: res
            })
          })
        }

      })
    } else {
      this.setTodayDate();
      ownerbuildCollectPriceId({}).then((res) => {
        this.setData({
          busiId: res
        })
      })
      this.getCurrentStall();
      this.getCurrentLocation()
    }
    this.getChannelList()
  },
  setTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    this.setData({
      today: formattedDate,
      'pricingDetail.collectDate': formattedDate
    });
  },
  selectPriceType() {
    if (this.data.disabled) {
      return;
    }
    const priceTypeOptions = Object.entries(this.data.priceTypes).map(([value, label]) => {
      return {
        value: value,
        label: label
      };
    }).filter(v=>{
      if(this.data.pricingDetail.stallType == "SFRM"){
        return v.value == "FARMER_SALE_PRICE"
      } else {
        return v.value !== "FARMER_SALE_PRICE"
      }
    });
    console.log('this.data.pricingDetail', this.data.pricingDetail)
    this.setData({
      pickerOptions: priceTypeOptions,
      pickerValue: this.data.pricingDetail.priceType,
      pickerTitle: "价格类型",
      pickerVisible: true,
      pickerKay: 'priceType'
    });
  },
  setPhotos(options) {
    this.setData({
      'pricingDetail.priceFileIds': this.data.pricingDetail.priceFileIds.concat(options.priceFileIds),
      'pricingDetail.collectFileIds': this.data.pricingDetail.collectFileIds.concat(options.collectFileIds)
    })
  },
  deleteCategory(data){
    console.log(data,'deleteCategory')
    this.toast('正在删除...', 'loading');
    ownerRemoveCollectCategory(data.detail.params).then(res=>{
    this.toast('删除成功', 'success')
    const child = this.selectComponent('.categoriesSelect')
    child.fetchCategories(this.data.pricingDetail.varietyId)
    })
  },
  fetchCategories(){
    const child = this.selectComponent('.categoriesSelect')
    child.fetchCategories(this.data.pricingDetail.varietyId)
  },
  selectButtomVarietiesFn(flag) {
    let params = {
      "condition": {
        "primaryKey": this.data.stallId
      }
    }
    selectStallFruiveggies(params).then((res) => {
      // 安全地获取当前选中品种的分类
      let currentCategories = [];
      if (this.data.pricingDetail.varietyId) {
        const matchedVariety = res.find(v => v.varietyId === this.data.pricingDetail.varietyId);
        currentCategories = matchedVariety ? matchedVariety.categories || [] : [];
      }
      
      this.setData({
        varieties: res,
        categories: currentCategories
      })
      
      if (flag) {
        if (res.length) {
          // 默认选择第一个品种
          const firstVariety = res[0];
          const firstCategories = firstVariety.categories || [];
          
          this.setData({
            "pricingDetail.varietyId": firstVariety.varietyId,
            "pricingDetail.varietyName": firstVariety.varietyName,
            pickerKay:"varietyId",
            categories: firstCategories
          })
          
          // 如果有品种ID，获取规格数据
          if (firstVariety.varietyId) {
            this.setPickerData(firstVariety.varietyId, true)
          }
        }
      }
    }).finally(() => {
      this.setData({
        refresherTriggered: false
      })
    })
  },
  tagClick(e) {
    if (this.data.disabled) {
      return
    }
    const varietyId = e.currentTarget.dataset.varietyid;
    const varietyName = e.currentTarget.dataset.varietyname;
    const key = e.target.dataset.key;
    
    // 安全地获取对应品种的分类
    const matchedVariety = this.data.varieties.find(v => v.varietyId === varietyId);
    const categories = matchedVariety ? matchedVariety.categories || [] : [];
    
    this.setData({
      pickerKay: key,
      "pricingDetail.varietyId": varietyId,
      "pricingDetail.varietyName": varietyName,
      "pricingDetail.categoryId": "", // 重置分类选择
      "pricingDetail.categoryName": "", // 重置分类名称
      "categories": categories
    })
    
    if (varietyId) {
      this.setPickerData(varietyId, true)
    }
  },
  tagcategoryClick(e) {
    if (this.data.disabled) {
      return
    }
    console.log(e)
    const key = e.target.dataset.key
    this.setData({
      pickerKay: key,
      "pricingDetail.categoryId": e.currentTarget.dataset.categoryid,
      "pricingDetail.categoryName": e.currentTarget.dataset.categoryname,
    })
  },
  setPickerData(key, flag) {
    if (this.data.pickerKay === 'varietyId') {
      const params = {
        primaryKey: key
      }
      selectVarietySpecss(params).then((res) => {
        this.setData({
          specssList: res,

        })
        if (flag) {
          this.setData({
            "pricingDetail.specss": res[this.data.pricingType].map(v => {
              return {
                fvSpecsMax: v.fvSpecsMax,
                fvSpecsMin: v.fvSpecsMin,
                fvSpecsUnit: v.fvSpecsUnit,
                saleChannelCode: "SCH_JXS",
                specsId: v.specsId,
                specsType: v.specsType,
                unitPrice: 0,
                varietyUnit: v.varietyUnit,
              }
            })
          })
        }
      })
    }

  },
  getCurrentStall() {
    selectCurrentStall().then(res => {
      console.log(res)
      this.setData({
        stallId: res.stallId,
        'pricingDetail.stallId': res.stallId,
        'pricingDetail.stallName': res.stallName,
        'pricingDetail.stallType': res.stallType,
        "pricingDetail.priceType":res.stallType == "SFRM" ? "FARMER_SALE_PRICE" : "BUY_PRICE",
      })
      this.selectButtomVarietiesFn(true)
    })
  },
  getDetails() {
    const params = {
      condition: {
        primaryKey: this.data.collectPriceId
      }
    }
    let obj = {
      "WEIGHT": 'weightSpecsVos',
      "DIAMETER": 'diameterSpecsVos',
    }
    ownergetWxCollecpriceTask(params).then((res) => {
      console.log(res)
      console.log(this.data.varieties, 'this.data.varieties')
      
      // 查找对应的品种数据
      const matchedVariety = this.data.varieties.find(v => v.varietyId == res.varietyId);
      const categories = matchedVariety ? matchedVariety.categories : [];
      
      // 安全地设置规格类型
      let pricingType = 'diameterSpecsVos';
      if (res.specss && res.specss.length > 0) {
        const specsType = res.specss[0].specsType;
        if (specsType && obj[specsType]) {
          pricingType = obj[specsType];
        }
      }
      
      // 安全地处理文件ID
      const collectFileIds = res.collectFileIds ? res.collectFileIds.map(v => v.fileId) : [];
      const priceFileIds = res.priceFileIds ? res.priceFileIds.map(v => v.fileId) : [];
      
      // 确保品种名称正确设置
      let varietyName = res.varietyName;
      if (!varietyName && matchedVariety) {
        varietyName = matchedVariety.varietyName;
      }
      
      // 确保分类名称正确设置
      let categoryName = res.categoryName;
      if (!categoryName && res.categoryId && categories.length > 0) {
        const matchedCategory = categories.find(c => c.categoryId == res.categoryId);
        if (matchedCategory) {
          categoryName = matchedCategory.categoryName;
        }
      }
      
      this.setData({
        specss: res.specss || [],
        pricingDetail: {
          ...res,
          varietyName: varietyName,
          categoryName: categoryName,
          collectFileIds: collectFileIds,
          priceFileIds: priceFileIds
        },
        pickerKay: 'varietyId',
        pricingType: pricingType,
        categories: categories,
      })
      
      // 如果有品种ID，获取规格数据
      if (res.varietyId) {
        this.setPickerData(res.varietyId, false)
      }
    }).finally(() => {
      this.setData({
        refresherTriggered: false
      })
    })
  },
  getChannelList() {
    const params = {
      condition: {
        dictType: 'SALE_CHANNEL'
      }
    }
    queryTypeDicts(params).then((res) => {
      this.setData({
        channel: res,
      })
    })
  },
  bindRefresh() {
    if (this.data.collectPriceId) this.getDetails();
    this.selectButtomVarietiesFn()
  },
  async getCurrentLocation() {

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
          wx.getLocation({
            type: 'wgs84',
            success(res) {
              console.log(res)
              const params = {
                condition: {
                  latitude: res.latitude,
                  longitude: res.longitude,
                }
              }
              regeo(params).then((regeoRes) => {
                that.setData({
                  'pricingDetail.latitude': res.latitude,
                  'pricingDetail.longitude': res.longitude,
                  'pricingDetail.collectAddress': regeoRes.address,
                })
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
  },
  async getLocation() {
    if (this.data.disabled) {
      return
    }
    console.log('getLocation')
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
              console.log(res)
              const params = {
                condition: {
                  latitude: res.latitude,
                  longitude: res.longitude,
                }
              }
              regeo(params).then((regeoRes) => {
                that.setData({
                  'pricingDetail.latitude': res.latitude,
                  'pricingDetail.longitude': res.longitude,
                  'pricingDetail.collectAddress': regeoRes.address,
                })
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
  },
  onDateChange(e) {
    this.setData({
      'pricingDetail.collectDate': e.detail,
    });
  },
  handleClose(e) {
    console.log('handleClose:', e);
  },
  onPickerConfirm(e) {
    console.log(e)
    if (this.data.pickerKay === 'linkerName') {
      const linkerMobile = e.detail.label[0].split('-')[1]
      this.setData({
        'pricingDetail.linkerMobile': linkerMobile,
      })
    }
    if (['saleChannelCode', 'specsId'].includes(this.data.pickerKay)) {
      // 确保specss数组存在且是数组
      if (!this.data.pricingDetail.specss || !Array.isArray(this.data.pricingDetail.specss)) {
        this.setData({
          'pricingDetail.specss': []
        });
        return;
      }
      
      // 确保specssIndex有效
      if (this.data.specssIndex === null || this.data.specssIndex === undefined || 
          this.data.specssIndex < 0 || this.data.specssIndex >= this.data.pricingDetail.specss.length) {
        console.warn('Invalid specssIndex:', this.data.specssIndex);
        return;
      }
      
      this.data.pricingDetail.specss.forEach((item, index) => {
        if (index !== this.data.specssIndex || !item) return;
        item[this.data.pickerKay] = e.detail.value[0];
        if (this.data.pickerKay !== 'specsId') return;
        const label = e.detail.label[0];
        const {
          fvSpecsMin,
          fvSpecsMax,
          fvSpecsUnit
        } = this.parseSpecsLabel(label);
        let specssItem = this.data.specssList[this.data.pricingType]
        const varietyUnit = specssItem && specssItem.find(v=>v.specsId == e.detail.value[0]) ? specssItem.find(v=>v.specsId == e.detail.value[0]).varietyUnit : item.varietyUnit
        Object.assign(item, {
          fvSpecsMin,
          fvSpecsMax,
          fvSpecsUnit,
          varietyUnit
        });
      });
      this.setData({
        'pricingDetail.specss': this.data.pricingDetail.specss
      });
      console.log(this.data.pricingDetail.specss)
      return
    }
    this.setData({
      [`pricingDetail.${this.data.pickerKay}`]: e.detail.value[0],
    })

  },
  parseSpecsLabel(label) {
    if (label.includes('-')) {
      const [, min, unit, max] = label.match(/(\d+)\s*([a-zA-Z]+)\s*-\s*(\d+)\s*([a-zA-Z]+)/) || [];
      return {
        fvSpecsMin: min,
        fvSpecsMax: max,
        fvSpecsUnit: unit
      };
    }

    const [value, unit] = label.split(' ');
    return {
      fvSpecsMin: label.includes('以上') ? value : null,
      fvSpecsMax: label.includes('以下') ? value : null,
      fvSpecsUnit: unit
    };
  },
  onPickerCancel(e) {
    console.log('onPickerCancel', e)
  },
  getVarietyId(e) {
    const key = e.target.dataset.key
    this.setData({
      pickerKay: key,
    })
    this.setData({
      pickerOptions: this.data.varieties.map(item => {
        return {
          label: item.varietyName,
          value: item.varietyId,
          linkerMobile: item.linkerMobile,
        }
      }),
      pickerValue: this.data.pricingDetail.varietyId,
      pickerTitle: key === 'varietyId' ? '品种大类' : '品种小类',
      pickerVisible: true,
    })
  },
  getLinkerName(e) {
    const key = e.target.dataset.key
    this.setData({
      pickerKay: key,
    })
    const params = {
      condition: {
        primaryKey: this.data.pricingDetail.stallId
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
        pickerValue: this.data.pricingDetail.linkerName,
        pickerTitle: '协助采价员联系人',
        pickerVisible: true,
      })
    })
  },
  getCategoryId(e) {
    if (!this.data.pricingDetail.varietyId) {
      this.toast('请先选择品种大类', 'warning')
      return
    }
    const key = e.target.dataset.key
    this.setData({
      pickerKay: key,
    })
    const categories = this.data.varieties.find(item => item.varietyId === this.data.pricingDetail.varietyId)?.categories
    if (!categories) {
      this.toast('该品种暂无品种小类', 'warning')
      return;
    }
    this.setData({
      pickerOptions: categories.map(item => {
        return {
          label: item.categoryName,
          value: item.categoryId,
        }
      }),
      categories: categories,
      pickerValue: this.data.pricingDetail.categoryId,
      pickerTitle: key === 'varietyId' ? '品种大类' : '品种小类',
      pickerVisible: true,
    })
  },
  pricingTypeFn(e) {
    if (this.data.disabled) {
      return
    }
    let priceType = {
      "diameterSpecsVos": 'mm',
      "weightSpecsVos": 'g'
    }
    let specss = this.data.pricingDetail.specss.filter(v => v.fvSpecsUnit == priceType[e.target.dataset.type])
    this.setData({
      pricingType: e.target.dataset.type,
      "pricingDetail.specss": this.data.specssList[e.target.dataset.type].map(v => {
        return {
          fvSpecsMax: v.fvSpecsMax,
          fvSpecsMin: v.fvSpecsMin,
          fvSpecsUnit: v.fvSpecsUnit,
          saleChannelCode: "SCH_JXS",
          specsId: v.specsId,
          specsType: v.specsType,
          unitPrice: 0,
          varietyUnit: v.varietyUnit,
        }
      })
    })
  },
  getChannel(e) {
    if (this.data.disabled) {
      return
    }
    const key = e.currentTarget.dataset.key
    const index = e.currentTarget.dataset.index
    const params = {
      condition: {
        dictType: 'SALE_CHANNEL'
      }
    }
    queryTypeDicts(params).then((res) => {
      this.setData({
        pickerKay: key,
        specssIndex: Number(index),
        pickerTitle: '渠道',
        channel: res,
        pickerValue: e.target.dataset.id,
        pickerOptions: res.map(item => {
          return {
            label: item.dictValue,
            value: item.dictCode,
          }
        }),
        pickerVisible: true,
      })
    })
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
  getSpecs(e) {
    if (this.data.disabled) {
      return
    }
    if (!this.data.pricingDetail.varietyId) {
      this.toast('请先选择品种大类', 'warning')
      return
    }
    if (!this.data.specssList[this.data.pricingType].length) {
      this.toast('暂无规格数据', 'warning')
      return
    }
    const key = e.currentTarget.dataset.key
    const index = e.currentTarget.dataset.index
    this.setData({
      pickerKay: key,
      specssIndex: Number(index),
      pickerTitle: '渠道',
      pickerValue: e.currentTarget.dataset.id,
      pickerOptions: this.data.specssList[this.data.pricingType].map(item => {
        let label = `${item.fvSpecsMin} ${item.fvSpecsUnit}-${item.fvSpecsMax} ${item.fvSpecsUnit}`
        if (item.fvSpecsMin === null) {
          label = `${item.fvSpecsMax} ${item.fvSpecsUnit} 以下`
        }
        if (item.fvSpecsMax === null) {
          label = `${item.fvSpecsMin} ${item.fvSpecsUnit} 以上`
        }
        return {
          label,
          value: item.specsId,
        }
      }),
      pickerVisible: true,
    })
  },
  showDialog(e) {
    if (this.data.disabled) {
      return
    }
    const value = e.currentTarget.dataset.value
    const index = e.currentTarget.dataset.index
    const unit = e.currentTarget.dataset.unit
    
    this.setData({
      showWithInput: true,
      unitPrice: value,
      unit,
      specssIndex: Number(index),
    });
  },
  closeDialog(e) {
    if (e.type === "confirm") {
      const {
        priceError
      } = this.data;
      const isNumber = /^\d+(\.\d+)?$/.test(this.data.unitPrice);
      if (priceError === isNumber) {
        this.setData({
          priceError: !isNumber,
        });
      } else {
        this.data.pricingDetail.specss[this.data.specssIndex].unitPrice = this.data.unitPrice
        this.setData({
          showWithInput: false,
          unitPrice: null,
          'pricingDetail.specss': this.data.pricingDetail.specss,
        });
      }
      // if (!this.data.unitPrice) {
      //   this.toast('请输入价格', 'warning')
      //   return
      // }
      // if (!this.isNumberString(this.data.unitPrice)) {
      //   this.toast('请输入数字', 'warning')
      //   return
      // }

    } else {
      this.setData({
        showWithInput: false,
        unitPrice: null,
      })
    }

  },
  isNumberString(str) {
    return typeof str === 'string' && str.trim() !== '' && !isNaN(+str);
  },
  onInput(e) {
    this.setData({
      unitPrice: e.detail.value,
    })
  },
  onInputClear() {
    this.setData({
      unitPrice: null,
    })
  },
  removeSpecs(e) {
    console.log(e)
    if (this.data.pricingDetail.specss.length === 1) {
      return
    }
    const index = e.target.dataset.index
    this.data.pricingDetail.specss.splice(index, 1)
    this.setData({
      'pricingDetail.specss': this.data.pricingDetail.specss,
    });
    console.log(this.data.pricingDetail.specss)
  },
  addSpecs() {
    this.data.pricingDetail.specss.push({
      fvSpecsMax: 0,
      fvSpecsMin: 0,
      fvSpecsUnit: "",
      saleChannelCode: "SCH_JXS",
      specsId: 0,
      specsType: "",
      unitPrice: 0,
      varietyUnit: "UG",
    })
    this.setData({
      'pricingDetail.specss': this.data.pricingDetail.specss,
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
          that.data.pricingDetail[key].push(retData)
          that.setData({
            [`pricingDetail.${key}`]: that.data.pricingDetail[key],
          });
          that.toast('上传成功', 'success')
        } else {
          that.toast(retMsg, 'warning')
        }
      }
    })
  },
  fileDelete(e) {
    const key = e.target.dataset.key
    const index = e.target.dataset.index
    const id = e.target.dataset.id
    this.data.pricingDetail[key].splice(index, 1)
    this.setData({
      [`pricingDetail.${key}`]: this.data.pricingDetail[key],
    });
    // const params = {
    //   condition: {
    //     primaryKeys: [id]
    //   }
    // }
    // softRemoveFile(params).then((res) => {
    //   if (res) {
    //     this.data.pricingDetail[key].splice(index, 1)
    //     this.setData({
    //       [`pricingDetail.${key}`]: this.data.pricingDetail[key],
    //     });
    //     this.toast('删除成功', 'success')
    //   }
    // })

  },
  preview(e) {
    const id = e.target.dataset.id
    const key = e.target.dataset.key
    const index = e.target.dataset.index
    const fs = wx.getFileSystemManager();
    if (['image', 'video'].includes(this.isImageVideoUrl(id))) {
      let priceImg = this.data.pricingDetail[key].filter((v, i) => i === index)
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
              type: this.isImageVideoUrl(item)
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
  isImageVideoUrl(url) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'flv'];
    const ext = url.split('.').pop().toLowerCase();
    if (imageExtensions.includes(ext)) {
      return 'image';
    } else if (videoExtensions.includes(ext)) {
      return 'video';
    }
    return 'other';
  },
  saveCollectPriceFn(submitType) {
    // 确保specss是一个数组，如果不存在或不是数组则初始化为空数组
    if (!this.data.pricingDetail.specss || !Array.isArray(this.data.pricingDetail.specss)) {
      this.setData({
        'pricingDetail.specss': []
      });
    }
    
    // 安全地遍历specss数组
    if (this.data.pricingDetail.specss && this.data.pricingDetail.specss.length > 0) {
      this.data.pricingDetail.specss.forEach((item) => {
        if (item) {
          item.specsType = this.data.pricingType === 'diameterSpecsVos' ? 'DIAMETER' : 'WEIGHT'
        }
      })
    }
    
    const params = {
      condition: {
        ...this.data.pricingDetail,
        submitType: submitType,
        collectPriceId: this.data.busiId || this.data.pricingDetail.collectPriceId,
      }
    }
    
    ownersaveCollectPrice(params).then((res) => {
      this.toast('保存成功', 'success')
      wx.navigateBack()
    }).finally(() => {
      this.setData({
        stagingLoading: false,
        submitLoading: false,
      })
    })
  },
  staging() {
    this.setData({
      stagingLoading: true,
    })
    this.saveCollectPriceFn("0")
  },
  submit() {
    if (!this.data.pricingDetail.varietyId) {
      this.toast('请选择品种大类', 'warning')
      return
    }
  

    this.setData({
      submitLoading: true,
    })
    this.saveCollectPriceFn("1")
  },
})