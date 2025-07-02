// pages/pricingDetail.js
import {
  ownergetWxCollecpriceTask,
  queryTypeDicts,
  ownersaveCollectPrice,
  regeo,
  filepreview,
  softRemoveFile,
  selectChooseStalls,
  ownerbuildCollectPriceId,
  selectButtomVarieties,
  selectStallFruiveggies,
  selectStallLinkers,
  selectVarietySpecss,
  ownerSelectCategories,
  ownerRemoveCollectCategory,
  ownerAddCollectCategory,
  selectAreaTreeByParentCode,
  saveTempCollectStall,
} from "../../utils/api";
import {
  Toast
} from "tdesign-miniprogram";
import {
  isImageVideoUrl
} from "../../utils/util"
import {
  env
} from "../../utils/env";
import dayjs from 'dayjs';

const now = dayjs().locale('zh-cn');
Page({
  data: {
    priceTypes: {
      'FARMER_SALE_PRICE': '离地价',
      'BUY_PRICE': '收购价',
      'SELL_PRICE':'出售价'
    },
    showCategoryDialog: false,
    availableCategories: [],
    selectedCategories: [],
    allCategories: [],
    varietyUnit: {
      "UG": "元/斤",
      "UKG": "元/公斤",
    },
    disabled: false,
    refresherTriggered: false,
    stagingLoading: false,
    submitLoading: false,
    visible: false,
    pickerVisible: false,
    pickerValue: null,
    collectPriceId: null,
    stallId: null,
    taskId: null,
    specssIndex: null,
    unitPrice: null,
    pickerTitle: '',
    today: '',
    pickerKay: '',
    selectChooseStallList: [],
    pricingType: 'diameterSpecsVos',
    unit: "",
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
      priceType: 'FARMER_SALE_PRICE',
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
    busiId: '',
    busiType: 'COLLECT_PRICE',
  stallSelectVisible: false,
  stallSearchValue: '',
  filteredStallList: [],
  selectedStallId: '',
  confirmStallLoading: false,
  
  showTempStallDialog: false,
  tempStallForm: {
    stallName: '',
    stallType: '',
    stallTypeName: '',
    varietyIds: [],
    varietyNames: '',
    areaCode: '',
    areaName: '',
    stallAddress: '',
    linkerName: '',
    linkerMobile: ''
  },
  stallTypePickerVisible: false,
  stallTypePickerValue: '',
  stallTypeOptions: [],
  varietySelectVisible: false,
  varietyOptions: [],
  areaPickerVisible: false,
  areaPickerValue: [0, 0, 0],
  provinces: [], // 省份列表
  cities: [], // 当前省份下的城市列表  
  counties: [], // 当前城市下的区县列表
  selectedProvince: null,
  selectedCity: null, 
  selectedCounty: null,
  
  },
  onLoad(options) {
    if (options.collectPriceId) {
      this.setData({
        collectPriceId: options.collectPriceId,
        stallId: options.stallId,
        "pricingDetail.stallId": options.stallId,
        busiType: 'COLLECT_PRICE',
        taskId: options.taskId,
        "pricingDetail.taskId": options.taskId,
        'pricingDetail.stallName': options.stallName,
      }, async () => {
        if (this.data.collectPriceId) {
          // await this.selectButtomVarietiesFn();
          this.getDetails();
          this.getChannelList()
        } else {
          this.setTodayDate()
        };
        if (options.stallId) {
          this.selectButtomVarietiesFn()
        }
        this.getCurrentStall()

      })
    } else {
      this.setTodayDate()
      this.getCurrentStall()
      this.getChannelList()
      this.getCurrentLocation()
      ownerbuildCollectPriceId({}).then((res) => {
        this.setData({
          busiId: res
        })
      })
    }


  },
  async getCurrentLocation() {

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
          wx.getLocation({
            type: 'gcj02',
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
  selectStalls() {
  if (this.data.disabled) {
    return
  }
  
  this.setData({
    stallSelectVisible: true,
    stallSearchValue: '',
    filteredStallList: this.data.selectChooseStallList,
    selectedStallId: this.data.pricingDetail.stallId || ''
  })
},
onStallSelectVisibleChange(e) {
  this.setData({
    stallSelectVisible: e.detail.visible
  })
},
onStallSearchClear() {
  this.setData({
    stallSearchValue: '',
    filteredStallList: this.data.selectChooseStallList
  })
},

onStallSearchChange(e) {
  const searchValue = e.detail.value
  this.setData({
    stallSearchValue: searchValue
  })
  this.filterStallList(searchValue)
},

onStallSearch(e) {
  const searchValue = e.detail.value
  this.filterStallList(searchValue)
},
// 过滤采价点列表
filterStallList(searchValue) {
  if (!searchValue.trim()) {
    this.setData({
      filteredStallList: this.data.selectChooseStallList
    })
    return
  }
  
  const filtered = this.data.selectChooseStallList.filter(item => 
    item.stallName.includes(searchValue.trim())
  )
  
  this.setData({
    filteredStallList: filtered
  })
},

// 单选框选择
onStallRadioChange(e) {
  this.setData({
    selectedStallId: e.detail.value
  })
},

// 确认选择采价点
confirmStallSelection() {
  if (!this.data.selectedStallId) {
    this.toast('请选择一个采价点', 'warning')
    return
  }
  
  this.setData({
    confirmStallLoading: true
  })
  
  const selectedStall = this.data.selectChooseStallList.find(
    item => item.stallId === this.data.selectedStallId
  )
  
  if (selectedStall) {
    // 设置采价点信息
    this.setData({
      'pricingDetail.stallId': selectedStall.stallId,
      'pricingDetail.stallName': selectedStall.stallName,
      stallSelectVisible: false
    })
    
    // 根据采价点类型设置价格类型
    const stallType = selectedStall.stallType
    const priceType = stallType === 'SFRM' ? 'FARMER_SALE_PRICE' : 'BUY_PRICE'
    this.setData({
      'pricingDetail.priceType': priceType,
      stallType: stallType
    })
    
    // 获取采价点相关数据
    Promise.all([
      // 获取品种大类数据
      this.selectButtomVarietiesFnAsync(selectedStall.stallId),
      // 获取联系人信息
      this.getLinkerList(selectedStall.stallId)
    ]).then(() => {
      this.setData({
        confirmStallLoading: false
      })
      this.toast('采价点选择成功', 'success')
    }).catch(err => {
      console.error('获取采价点数据失败:', err)
      this.setData({
        confirmStallLoading: false
      })
      this.toast('获取采价点数据失败', 'error')
    })
    
  } else {
    this.setData({
      confirmStallLoading: false
    })
    this.toast('选择的采价点不存在', 'error')
  }
},

selectButtomVarietiesFnAsync(stallId) {
  return new Promise((resolve, reject) => {
    const params = {
      "condition": {
        "primaryKey": stallId
      }
    }
    
    selectStallFruiveggies(params).then((res) => {
      this.setData({
        varieties: res,
        // 清空之前选择的品种相关数据
        'pricingDetail.varietyId': '',
        'pricingDetail.varietyName': '',
        'pricingDetail.categoryId': '',
        'pricingDetail.categoryName': '',
        categories: []
      })
      
      // 如果有品种数据，自动选择第一个
      if (res.length > 0) {
        const firstVariety = res[0]
        this.setData({
          'pricingDetail.varietyId': firstVariety.varietyId,
          'pricingDetail.varietyName': firstVariety.varietyName,
          // 设置品种小类数据
          categories: firstVariety.categories || []
        })
        
        if (firstVariety.varietyId) {
          this.setPickerData(firstVariety.varietyId, true)
        }
        
        // 如果有品种小类组件，触发获取小类数据
        this.fetchCategories()
      }
      
      resolve(res)
    }).catch(err => {
      console.error('获取品种大类失败:', err)
      reject(err)
    })
  })
},

// 显示新增临时采价点对话框
showAddTempStallDialog() {
  this.setData({
    showTempStallDialog: true,
    tempStallForm: {
      stallName: '',
      stallType: '',
      stallTypeName: '',
      varietyIds: [],
      varietyNames: '',
      areaCode: '',
      areaName: '',
      stallAddress: '',
      linkerName: '',
      linkerMobile: ''
    },
  })
  this.resetAreaPicker()
  // 并行加载所有必需的数据
  Promise.all([
    this.getStallTypeOptions(),
    this.getVarietyOptions(), 
    this.getAreaOptions()
  ]).then(() => {
    console.log('所有数据加载完成')
  }).catch(err => {
    console.error('数据加载失败:', err)
    this.toast('数据加载失败，请重试', 'error')
  })
},
// 获取采价类型选项
getStallTypeOptions() {
  return new Promise((resolve, reject) => {
    const params = {
      condition: {
        dictType: 'STALL_TYPE'
      }
    }
    
    queryTypeDicts(params).then((res) => {
      console.log('采价类型数据:', res)
      
      const options = Array.isArray(res) ? res.map(item => ({
        label: item.dictValue || item.dictName,
        value: item.dictCode || item.dictKey
      })) : []
      
      this.setData({
        stallTypeOptions: options
      })
      resolve(options)
    }).catch(err => {
      console.error('获取采价类型失败:', err)
      this.toast('获取采价类型失败', 'error')
      reject(err)
    })
  })
},
// 获取品种大类选项
getVarietyOptions() {
  return new Promise((resolve, reject) => {
    selectButtomVarieties({}).then((res) => {
      console.log('品种大类数据:', res)
      const options = Array.isArray(res) ? res.filter(item => 
        item.varietyId && item.varietyName
      ) : []
      
      this.setData({
        varietyOptions: options
      })
      resolve(options)
    }).catch(err => {
      console.error('获取品种大类失败:', err)
      this.toast('获取品种大类失败', 'error')
      reject(err)
    })
  })
},
getAreaOptions() {
  return new Promise((resolve, reject) => {
    // 获取省级数据（第一级）
    const params = {
      condition: {
        primaryKey: ""  // 空字符串表示获取第一级（省级）数据
      }
    }
    
    selectAreaTreeByParentCode(params).then((res) => {
      console.log('省级区域数据:', res)
      
      // 处理省级数据，第一个选项为"请选择"
      const provinces = [
        { label: '请选择省份', value: '' },
        ...(Array.isArray(res) ? res.map(item => ({
          label: item.areaname,
          value: item.areacode
        })) : [])
      ]
      
      this.setData({
        provinces: provinces,
        cities: [{ label: '请选择城市', value: '' }],      // 默认显示请选择
        counties: [{ label: '请选择区县', value: '' }],    // 默认显示请选择

      })
      
      resolve(res)
    }).catch(err => {
      console.error('获取省级区域数据失败:', err)
      this.toast('获取省级区域数据失败', 'error')
      reject(err)
    })
  })
},


// 选择采价类型
selectStallType() {
  // 检查数据是否已加载
  if (this.data.stallTypeOptions.length === 0) {
    this.toast('采价类型数据加载中，请稍候', 'loading')
    // 重新加载数据
    this.getStallTypeOptions().then(() => {
      this.setData({
        stallTypePickerVisible: true,
        stallTypePickerValue: [this.data.tempStallForm.stallType]
      })
    })
    return
  }
  
  this.setData({
    stallTypePickerVisible: true,
    stallTypePickerValue: [this.data.tempStallForm.stallType]
  })
},

onStallTypePickerConfirm(e) {
  console.log('采价类型选择:', e.detail.value)
  
  const selectedValue = e.detail.value[0]
  const selectedType = this.data.stallTypeOptions.find(item => item.value === selectedValue)
  
  this.setData({
    'tempStallForm.stallType': selectedValue,
    'tempStallForm.stallTypeName': selectedType ? selectedType.label : '',
    stallTypePickerVisible: false
  })
},

onStallTypePickerCancel() {
  this.setData({
    stallTypePickerVisible: false
  })
},

// 选择品种大类
selectVarieties() {
  // 检查数据是否已加载
  if (this.data.varietyOptions.length === 0) {
    this.toast('品种数据加载中，请稍候', 'loading')
    // 重新加载数据
    this.getVarietyOptions().then(() => {
      this.setData({
        varietySelectVisible: true
      })
    })
    return
  }
  
  this.setData({
    varietySelectVisible: true
  })
},

onVarietyCheckboxChange(e) {
  this.setData({
    'tempStallForm.varietyIds': e.detail.value
  })
},

confirmVarietySelect() {
  const selectedIds = this.data.tempStallForm.varietyIds
  
  if (!selectedIds || selectedIds.length === 0) {
    this.toast('请至少选择一个品种大类', 'warning')
    return
  }
  
  const selectedNames = this.data.varietyOptions
    .filter(item => selectedIds.includes(item.varietyId))
    .map(item => item.varietyName)
    .join('、')
  
  this.setData({
    'tempStallForm.varietyNames': selectedNames,
    varietySelectVisible: false
  })
  
  console.log('选择的品种大类:', selectedNames)
},


cancelVarietySelect() {
  this.setData({
    varietySelectVisible: false
  })
},

// 选择行政区划
selectArea() {
  // 如果数据还没加载完，提示用户稍等
  if (this.data.provinces.length === 0) {
    this.toast('区域数据加载中，请稍候', 'loading')
    return
  }
  
  this.setData({
    areaPickerVisible: true
  })
},
onAreaColumnChange(e) {
  console.log('区域选择器列变化:', e.detail)
  const { column, index } = e.detail
  
  if (column === 0) {
    // 省份改变，获取城市数据
    const selectedProvince = this.data.provinces[index]
    console.log('选择省份:', selectedProvince)
    
    // 先记录选择状态
    this.setData({
      selectedProvince: selectedProvince,
      selectedCity: null,
      selectedCounty: null
    })
    
    // 如果选择的不是"请选择"，则获取城市数据
    if (selectedProvince && selectedProvince.value !== '') {
      const params = {
        condition: {
          primaryKey: selectedProvince.value
        }
      }
      
      selectAreaTreeByParentCode(params).then((res) => {
        const cities = [
          { label: '请选择城市', value: '' },
          ...(Array.isArray(res) ? res.map(item => ({
            label: item.areaname,
            value: item.areacode
          })) : [])
        ]
        
        const counties = [{ label: '请选择区县', value: '' }]
        
        // 先更新数据，不更新areaPickerValue
        this.setData({
          cities: cities,
          counties: counties
        })
        
      }).catch(err => {
        console.error('获取城市数据失败:', err)
        this.toast('获取城市数据失败', 'error')
      })
    } else {
      // 选择了"请选择"，清空下级数据
      this.setData({
        cities: [{ label: '请选择城市', value: '' }],
        counties: [{ label: '请选择区县', value: '' }]
      })
      
    }
    
  } else if (column === 1) {
    // 城市改变，获取区县数据
    const selectedCity = this.data.cities[index]
    console.log('选择城市:', selectedCity)
    
    // 先记录选择状态
    this.setData({
      selectedCity: selectedCity,
      selectedCounty: null
    })
    
    // 如果选择的不是"请选择"，则获取区县数据
    if (selectedCity && selectedCity.value !== '') {
      const params = {
        condition: {
          primaryKey: selectedCity.value
        }
      }
      
      selectAreaTreeByParentCode(params).then((res) => {
        const counties = [
          { label: '请选择区县', value: '' },
          ...(Array.isArray(res) ? res.map(item => ({
            label: item.areaname,
            value: item.areacode
          })) : [])
        ]
        
        // 先更新数据
        this.setData({
          counties: counties
        })
        
      }).catch(err => {
        console.error('获取区县数据失败:', err)
        this.toast('获取区县数据失败', 'error')
      })
    } else {
      // 选择了"请选择"，清空区县数据
      this.setData({
        counties: [{ label: '请选择区县', value: '' }]
      })
      
    }
    
  } else if (column === 2) {
    // 区县改变
    const selectedCounty = this.data.counties[index]
    console.log('选择区县:', selectedCounty)
    
    this.setData({
      selectedCounty: selectedCounty
    })
    
  }
},

onAreaPickerConfirm(e) {
  console.log('区域选择确认:', e.detail)
  const { value, label } = e.detail
  
  // 使用当前选择的数据来验证
  const selectedProvince = this.data.selectedProvince
  const selectedCity = this.data.selectedCity
  const selectedCounty = this.data.selectedCounty
  
  console.log('当前选择状态:', { selectedProvince, selectedCity, selectedCounty })
  
  // 检查是否选择了有效的省份（不是"请选择"）
  if (!selectedProvince || selectedProvince.value === '') {
    this.toast('请选择省份', 'warning')
    return
  }
  
  // 检查是否选择了有效的城市（不是"请选择"）
  if (!selectedCity || selectedCity.value === '') {
    this.toast('请选择城市', 'warning')
    return
  }
  
  // 检查是否选择了有效的区县（不是"请选择"）
  if (!selectedCounty || selectedCounty.value === '') {
    this.toast('请选择区县', 'warning')
    return
  }
  
  // 拼接完整的区域名称
  const fullAreaName = `${selectedProvince.label}-${selectedCity.label}-${selectedCounty.label}`
  
  this.setData({
    'tempStallForm.areaCode': selectedCounty.value,
    'tempStallForm.areaName': fullAreaName,
    areaPickerVisible: false
  })
  
  console.log('选择的区域:', {
    code: selectedCounty.value,
    name: fullAreaName,
    province: selectedProvince,
    city: selectedCity,
    county: selectedCounty
  })
},

onAreaPickerCancel() {
  this.setData({
    areaPickerVisible: false
  })
},

resetAreaPicker() {
  this.setData({
    areaPickerValue: [0, 0, 0],
    selectedProvince: null,
    selectedCity: null,
    selectedCounty: null,
    cities: [{ label: '请选择城市', value: '' }],
    counties: [{ label: '请选择区县', value: '' }]
  })
},

// 确认新增临时采价点
confirmAddTempStall() {
  const form = this.data.tempStallForm
  
  // 验证必填字段
  if (!form.stallName.trim()) {
    this.toast('请输入采价点名称', 'warning')
    return
  }
  
  if (!form.stallType) {
    this.toast('请选择采价类型', 'warning')
    return
  }
  
  if (!form.varietyIds || form.varietyIds.length === 0) {
    this.toast('请选择品种大类', 'warning')
    return
  }
  
  if (!form.areaCode) {
    this.toast('请选择行政区划', 'warning')
    return
  }
  
  if (!form.stallAddress.trim()) {
    this.toast('请输入详细地址', 'warning')
    return
  }
  
  // 获取行政区划的省市区编码
  const selectedProvince = this.data.selectedProvince
  const selectedCity = this.data.selectedCity
  const selectedCounty = this.data.selectedCounty
  
  if (!selectedProvince || !selectedCity || !selectedCounty) {
    this.toast('行政区划信息不完整，请重新选择', 'warning')
    return
  }
  
  // 准备联系人信息
  const linkers = []
  if (form.linkerName.trim() || form.linkerMobile.trim()) {
    linkers.push({
      linkerName: form.linkerName.trim(),
      linkerMobile: form.linkerMobile.trim()
    })
  }
  
  // 准备提交数据，按照新的API格式
  const submitData = {
    condition: {
      cityCode: selectedCity.value,               // 行政区划-市编码
      linkers: linkers,                           // 联系人数组
      provinceCode: selectedProvince.value,       // 行政区划-省编码
      stallAddress: form.stallAddress.trim(),     // 详细地址
      stallName: form.stallName.trim(),           // 采价点名字
      stallState: "0",                            // 采价点状态：固定传"0"表示临时采价点
      stallType: form.stallType,                  // 采价点类型
      townCode: selectedCounty.value,             // 行政区划-区县编码
      varietyIds: form.varietyIds                 // 采集品种ID数组
    }
  }
  
  console.log('提交临时采价点数据:', submitData)
  
  this.toast('正在创建临时采价点...', 'loading')
  
  // 调用API创建临时采价点
  saveTempCollectStall(submitData).then((res) => {
    this.toast('临时采价点创建成功', 'success')
    
    // 关闭对话框
    this.setData({
      showTempStallDialog: false
    })
    
    // 刷新采价点列表
    this.refreshStallList()
    
  }).catch(err => {
    console.error('创建临时采价点失败:', err)
    this.toast('创建临时采价点失败', 'error')
  })
},

// 刷新采价点列表
refreshStallList() {
  this.getCurrentStall()
  // 同时更新过滤后的列表
  this.setData({
    filteredStallList: this.data.selectChooseStallList
  })
},




// 关闭临时采价点对话框
closeTempStallDialog() {
  this.setData({
    showTempStallDialog: false
  })
},

// 临时采价点表单输入处理
onTempStallNameChange(e) {
  this.setData({
    'tempStallForm.stallName': e.detail.value
  })
},

onTempStallTypeChange(e) {
  this.setData({
    'tempStallForm.stallType': e.detail.value
  })
},

onTempStallAddressChange(e) {
  this.setData({
    'tempStallForm.stallAddress': e.detail.value
  })
},

onTempStallLinkerChange(e) {
  this.setData({
    'tempStallForm.linkerName': e.detail.value
  })
},

onTempStallMobileChange(e) {
  this.setData({
    'tempStallForm.linkerMobile': e.detail.value
  })
},

  setTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    console.log(now.format('YYYY-MM-DD'), 'formattedDate')
    this.setData({
      today: formattedDate,
      'pricingDetail.collectDate': now.format('YYYY-MM-DD')
    });
  },
  selectButtomVarietiesFn(stallId, flag) {
    let params = {
      "condition": {
        "primaryKey": this.data.stallId || stallId
      }
    }
    selectStallFruiveggies(params).then((res) => {
      this.setData({
        varieties: res
      });

      if (res.length > 0 && !this.data.pricingDetail.varietyId) {
        const firstVariety = res[0];
        this.setData({
          'pricingDetail.varietyId': firstVariety.varietyId,
          'pricingDetail.varietyName': firstVariety.varietyName
        });

        this.fetchCategories(firstVariety.varietyId);

        this.setPickerData(firstVariety.varietyId, true);
      } else if (this.data.pricingDetail.varietyId) {
        this.fetchCategories(this.data.pricingDetail.varietyId);
      }
    }).finally(() => {
      this.setData({
        refresherTriggered: false
      });
    });
  },
  fetchCategories(varietyId) {
    if (!varietyId) return;

    const params = {
      "condition": {
        "collectPriceId": this.data.busiId || this.data.collectPriceId,
        "varietyId": varietyId
      }
    };

    ownerSelectCategories(params).then((res) => {
      this.setData({
        categories: res.map(item => ({
          ...item,
          collectCategoryId: item.collectCategoryId
        }))
      });
    }).catch(err => {
      console.error('Error fetching categories:', err);
      this.toast('获取品种小类失败', 'error');
    });
  },
  selectPriceType() {
    if (this.data.disabled) {
      return;
    }
    const stallType = this.data.selectChooseStallList.find(item => item.stallId === this.data.pricingDetail.stallId)?.stallType
    const priceTypeOptions = Object.entries(this.data.priceTypes).map(([value, label]) => {
      return {
        value: value,
        label: label
      };
    });

    if (stallType === 'SFRM') priceTypeOptions.splice(1)
    else priceTypeOptions.splice(0, 1)
    this.setData({
      pickerOptions: priceTypeOptions,
      pickerValue: this.data.pricingDetail.priceType,
      pickerTitle: "价格类型",
      pickerVisible: true,
      pickerKay: 'priceType'
    });
  },
  getCurrentStall() {
    selectChooseStalls().then(res => {
      console.log(res)
      this.setData({
        selectChooseStallList: res
      })
    })
  },
  setPhotos(options) {
    console.log(options, 'options')
    this.setData({
      'pricingDetail.priceFileIds': this.data.pricingDetail.priceFileIds.concat(options.priceFileIds),
      'pricingDetail.collectFileIds': this.data.pricingDetail.collectFileIds.concat(options.collectFileIds)
    })
  },
  getDetails() {
    const params = {
      condition: {
        primaryKey: this.data.collectPriceId
      }
    };

    ownergetWxCollecpriceTask(params).then(async (res) => {
      const pricingType = res.specss && res.specss.length > 0
        ? (res.specss[0] && res.specss[0].specsType
          ? (res.specss[0].specsType === 'WEIGHT' ? 'weightSpecsVos' : 'diameterSpecsVos')
          : 'diameterSpecsVos')
        : 'diameterSpecsVos';

      this.setData({
        disabled: ['4', '5'].includes(res.priceStatus),
        busiId: res.collectPriceId,
        pricingType: pricingType,
        specss: res.specss || [],

        pricingDetail: {
          ...res,
          priceType: res.priceType || 'FARMER_SALE_PRICE',
          specss: res.specss || [],
          collectFileIds: res.collectFileIds ? res.collectFileIds.map(v => v.fileId) : [],
          priceFileIds: res.priceFileIds ? res.priceFileIds.map(v => v.fileId) : []
        }
      }, () => {
        const that = this;

        // setTimeout(() => {
        //   console.log(that.data.pricingDetail.varietyId)
        //   that.setData({
        //     categories: that.data.varieties.filter(v => v.varietyId === that.data.pricingDetail.varietyId)[0]
        //       ? that.data.varieties.filter(v => v.varietyId === that.data.pricingDetail.varietyId)[0].categories
        //       : []
        //   });
        //   console.log(that.data.categories, 'categories===');
        // }, 200);

        if (this.data.pricingDetail.varietyId) {
          this.setPickerData(this.data.pricingDetail.varietyId);
        }

        console.log('pricingDetail specss:', this.data.pricingDetail.specss);
      });

      if (res.stallId) {
        await this.selectButtomVarietiesFn(res.stallId);
      }
    }).catch(err => {
      console.error('获取详情失败:', err);
      this.toast('获取详情失败', 'error');
    }).finally(() => {
      this.setData({
        refresherTriggered: false
      });
    });
  },
  bindRefresh() {
    if (this.data.collectPriceId) this.getDetails();
    this.getCurrentStall()
    // this.selectButtomVarietiesFn()
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
            type: 'gcj02',
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
    if (this.data.disabled) {
      return
    }
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
    if (this.data.pickerKay === 'varietyId') {
      const params = {
        primaryKey: e.detail.value[0]
      }
      selectVarietySpecss(params).then((res) => {
        this.setData({
          specssList: res,
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
      })
    }
    if (['saleChannelCode', 'specsId'].includes(this.data.pickerKay)) {
      this.data.pricingDetail.specss.forEach((item, index) => {
        if (index !== this.data.specssIndex) return;
        item[this.data.pickerKay] = e.detail.value[0];
        if (this.data.pickerKay !== 'specsId') return;
        const label = e.detail.label[0];
        const {
          fvSpecsMin,
          fvSpecsMax,
          fvSpecsUnit
        } = this.parseSpecsLabel(label);
        let specssItem = this.data.specssList[this.data.pricingType]
        const varietyUnit = specssItem.find(v => v.specsId == e.detail.value[0]) ? specssItem.find(v => v.specsId == e.detail.value[0]).varietyUnit : item.varietyUnit
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
    if (this.data.pickerKay == 'stallId') {
      this.setData({
        'pricingDetail.stallId': e.detail.value[0],
        'pricingDetail.stallName': e.detail.label[0],
      });
      this.selectButtomVarietiesFn(e.detail.value[0], true);
      this.getLinkerList(e.detail.value[0])
      const stallType = this.data.selectChooseStallList.find(item => item.stallId === this.data.pricingDetail.stallId)?.stallType
      const priceType = stallType === 'SFRM' ? 'FARMER_SALE_PRICE' : 'BUY_PRICE'
      this.setData({
        'pricingDetail.priceType': priceType
      })
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
  getLinkerList(stallId) {
    const params = {
      condition: {
        primaryKey: stallId
      }
    }
    selectStallLinkers(params).then((res) => {
      if (res.length) {
        let item = res[0]
        this.setData({
          "pricingDetail.linkerName": item.linkerName,
          "pricingDetail.linkerMobile": item.linkerMobile,
        })
      }

    })
  },
  getLinkerName(e) {
    if (this.data.disabled) {
      return
    }
    const key = e.target.dataset.key
    this.setData({
      pickerKay: key,
    })
    if (!(this.data.stallId || this.data.pricingDetail.stallId)) {
      this.toast('请选择采价点', "none")
      return
    }
    const params = {
      condition: {
        primaryKey: this.data.stallId || this.data.pricingDetail.stallId
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
  tagClick(e) {
    if (this.data.disabled) {
      return
    }
    const key = e.target.dataset.key
    const varietyId = e.currentTarget.dataset.varietyid;

    this.setData({
      pickerKay: key,
      "pricingDetail.varietyId": varietyId,
      "pricingDetail.varietyName": e.currentTarget.dataset.varietyname,
    })

    this.fetchCategories(varietyId);

    this.setPickerData(varietyId, true);
  },

  setPickerData(key, flag) {
    if (this.data.pickerKay === 'varietyId') {
      const params = {
        primaryKey: key
      }

      selectVarietySpecss(params).then((res) => {
        this.setData({
          specssList: res
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
  getCategoryId(e) {
    if (!this.data.pricingDetail.varietyId) {
      this.toast('请先选择品种大类', 'warning')
      return
    }
    const key = e.target.dataset.key
    this.setData({
      pickerKay: key,
    })

    if (this.data.categories && this.data.categories.length > 0) {
      this.setData({
        pickerOptions: this.data.categories.map(item => {
          return {
            label: item.categoryName,
            value: item.categoryId,
          }
        }),
        pickerValue: this.data.pricingDetail.categoryId,
        pickerTitle: key === 'varietyId' ? '品种大类' : '品种小类',
        pickerVisible: true,
      })
    } else {
      this.fetchCategories(this.data.pricingDetail.varietyId);
      this.toast('正在加载品种小类', 'loading');
    }
  },
  pricingTypeFn(e) {
    if (this.data.disabled) {
      return
    }
    let priceType = {
      "diameterSpecsVos": 'mm',
      "weightSpecsVos": 'g'
    }
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
    console.log(this.data.unitPrice)
    if (e.type === "confirm") {
      if (!this.data.unitPrice) {
        this.toast('请输入价格', 'warning')
        return
      }
      if (!this.isNumberString(this.data.unitPrice)) {
        this.toast('请输入数字', 'warning')
        return
      }
      this.data.pricingDetail.specss[this.data.specssIndex].unitPrice = this.data.unitPrice
      this.setData({
        'pricingDetail.specss': this.data.pricingDetail.specss,
      });
    }
    this.setData({
      showWithInput: false,
      unitPrice: null
    });
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
    if (this.data.disabled) {
      return
    }
    if (this.data.pricingDetail.specss.length === 1) {
      return
    }
    const index = e.target.dataset.index
    this.data.pricingDetail.specss.splice(index, 1)
    this.setData({
      'pricingDetail.specss': this.data.pricingDetail.specss,
    });
  },
  addSpecs() {
    if (this.data.disabled) {
      return
    }
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
    if (this.data.disabled) {
      return
    }
    const sourceType = e.target.dataset.type
    const key = e.target.dataset.key
    const that = this
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
    if (this.data.disabled) {
      return
    }
    let that = this
    const key = e.target.dataset.key
    wx.chooseMessageFile({
      count: 10,
      type: 'all',
      success(res) {
        console.log(res)
        const tempFilePaths = res.tempFiles
        tempFilePaths.forEach((temp) => {
          if (temp.path) that.uploadFile(temp.path, key)
        })
        console.log(tempFilePaths)
      }
    })
  },
  uploadFile(tempFilePaths, key) {
    const that = this
    wx.uploadFile({
      url: `${env.baseURL}/file/uploadFile`,
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
          console.log(retData)
          that.data.pricingDetail[key].push(retData)
          that.setData({
            [`pricingDetail.${key}`]: that.data.pricingDetail[key],
          });
          console.log(that.data.pricingDetail[key])
        } else {
          that.toast(retMsg, 'warning')
        }
      }
    })
  },
  fileDelete(e) {
    if (this.data.disabled) {
      return
    }
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
    console.log(e)
    let that = this
    const id = e.target.dataset.id
    const key = e.target.dataset.key
    const index = e.target.dataset.index

    const fs = wx.getFileSystemManager();
    if (['image', 'video'].includes(isImageVideoUrl(id))) {
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
          fs.writeFileSync(filePath,
            list[index].data,
            "binary",
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
    //  else {
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
  saveCollectPriceFn(submitType) {
    this.data.pricingDetail.specss.forEach((item) => {
      item.specsType = this.data.pricingType === 'diameterSpecsVos' ? 'DIAMETER' : 'WEIGHT'
    })


    const params = {
      condition: {
        ...this.data.pricingDetail,
        submitType: submitType,
        collectPriceId: this.data.pricingDetail.collectPriceId || this.data.busiId,
      }
    }
    ownersaveCollectPrice(params).then((res) => {
      console.log(res)
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

    if (!this.data.pricingDetail.linkerName) {
      this.toast('请选择联系人', 'warning')
      return
    }
    if (!this.data.pricingDetail.linkerMobile) {
      this.toast('请选择联系人电话', 'warning')
      return
    }

    this.setData({
      submitLoading: true,
    })
    this.saveCollectPriceFn("1")
  },
  onCheckboxToggle(e) {
    const { id, index } = e.currentTarget.dataset;

    let availableCategories = [...this.data.availableCategories];
    availableCategories[index].selected = !availableCategories[index].selected;

    this.setData({
      availableCategories: availableCategories
    });

    console.log(`小类 ${id} 选中状态: ${availableCategories[index].selected}`);
  },

  showAddCategoryDialog() {
    console.log('打开添加品种小类对话框');

    // 获取当前品种大类的所有小类
    const currentVarietyId = this.data.pricingDetail.varietyId;
    if (!currentVarietyId) {
      this.toast('请先选择品种大类', 'warning');
      return;
    }

    // this.toast('加载中...', 'loading');

    const currentVariety = this.data.varieties.find(v => v.varietyId === currentVarietyId);
    const allCategories = currentVariety ? currentVariety.categories || [] : [];

    const params = {
      "condition": {
        "collectPriceId": this.data.busiId,
        "varietyId": currentVarietyId
      }
    };

    ownerSelectCategories(params).then((existingCategories) => {
      const addedCategoryIds = existingCategories.map(item => item.categoryId);

      const availableCategories = allCategories.map(item => {
        return {
          ...item,
          available: !addedCategoryIds.includes(item.categoryId),
          selected: false
        };
      });

      this.setData({
        allCategories: allCategories,
        availableCategories: availableCategories.filter(item => item.available),
        selectedCategories: [],
        showCategoryDialog: true
      });

      wx.hideLoading();
    }).catch(err => {
      console.error('获取已添加小类失败:', err);
      this.toast('获取小类数据失败', 'error');
    });
  },

  closeCategoryDialog() {
    this.setData({
      showCategoryDialog: false,
      selectedCategories: []
    });
  },

  onCategorySelectionChange(e) {
    console.log('选择的小类：', e.detail.value);
    this.setData({
      selectedCategories: e.detail.value
    });
  },

  confirmAddCategory() {
    const selectedIds = this.data.selectedCategories;
    const currentVarietyId = this.data.pricingDetail.varietyId;

    if (selectedIds.length === 0) {
      this.toast('请至少选择一个品种小类', 'warning');
      return;
    }

    console.log('确认添加品种小类：', selectedIds);

    const items = selectedIds.map(categoryId => {
      return {
        categoryId: categoryId,
        varietyId: currentVarietyId
      };
    });

    const params = {
      "condition": {
        "collectPriceId": this.data.busiId,
        "items": items
      }
    };

    // this.toast('添加中...', 'loading');

    ownerAddCollectCategory(params).then(() => {
      this.toast('添加成功', 'success');

      this.setData({
        showCategoryDialog: false,
        selectedCategories: []
      });

      this.fetchCategories(currentVarietyId);
    }).catch(err => {
      console.error('添加小类失败:', err);
      this.toast('添加失败', 'error');
    });
  },
  onCheckboxChange(e) {
    this.setData({
      selectedCategories: e.detail.value
    });
  },

  deleteCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    const collectCategoryId = e.currentTarget.dataset.collectcategoryid;
    const varietyId = this.data.pricingDetail.varietyId;

    console.log('删除品种小类', collectCategoryId);

    this.toast('正在删除...', 'loading');

    const params = {
      "condition": {
        "primaryKey": collectCategoryId
      }
    };

    ownerRemoveCollectCategory(params).then((res) => {
      this.toast('删除成功', 'success');

      this.fetchCategories(varietyId);
    }).catch(err => {
      console.error('Error deleting category:', err);
    });
  },

  handleCategoryClick(e) {
    const categoryId = e.currentTarget.dataset.id;
    const categoryName = e.currentTarget.dataset.name;
    const collectCategoryId = e.currentTarget.dataset.collectcategoryid;

    console.log('点击品种小类, collectCategoryId:', collectCategoryId);

    wx.navigateTo({
      url: `/subPackage/categoryDetail/categoryDetail?categoryId=${categoryId}&categoryName=${categoryName}&varietyId=${this.data.pricingDetail.varietyId}&varietyName=${this.data.pricingDetail.varietyName}&stallId=${this.data.pricingDetail.stallId}&collectCategoryId=${collectCategoryId}&priceStatus=${this.data.pricingDetail.priceStatus}`
    });
  }
})