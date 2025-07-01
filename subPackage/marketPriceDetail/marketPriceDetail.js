// marketpriceReportDetail.js
import {
  selectButtomVarieties,
  regeo,
  getmarketFarmersAreaTree,
  buildFruitMarketId,
  saveFruitMarket,
  getFruitMarket,
  selectVarietySpecss,
  queryTypeDicts,
  filepreview,
  softRemoveFile,
  marketAddCollectCategory,
  marketRemoveCollectCategory,
  marketSelectCategories
} from "../../utils/api";
import {
  Toast
} from "tdesign-miniprogram";
import {
  isImageVideoUrl
} from "../../utils/util";
import {
  env
} from "../../utils/env";
import dayjs from 'dayjs';

const now = dayjs().locale('zh-cn');

Page({
  data: {
    areaText:'',
    showCategoryDialog:false,
    userInfo: wx.getStorageSync('userInfo'),
    monthValue: '',
    start: '2000-01-01 00:00:00',
    end: '2080-09-09 12:12:12',
    orderId: '',
    busiId: '',
    disabled: false,
    refresherTriggered: false,
    stagingLoading: false,
    submitLoading: false,
    pickerVisible: false,
    pickerValue: null,
    pickerTitle: '',
    pickerKay: '',
    pickerOptions: [],
    selectedCategories:[],
    availableCategories:[],
    specssIndex: null,
    currentSection: '',
    today: '',
    areaVisible:false,
    areaValue:'',
    cities:[],
    counties:[],
    priceTypes: {
      'FARMER_SALE_PRICE': '离地价',
      'ORDER_PRICE': '订购价'
    },
    phoneError: false,
    priceReportDetail: {
      "areacode": "",
      "collectDate": "",
      "fruitMarketId": "",
      "latitude": "",
      "longitude": "",
      reportingLocation:'',
      "submitType": "",
      "varietyId": ''
    },
    varieties: [],
    categories: [],
    farmerAreaList: [],
    channel: [],
    specssList: {},



    varietyUnit: {
      "UG": "元/斤",
      "UKG": "元/公斤",
    }
  },

  onLoad(options) {
    this.setTodayDate();
    this.getCurrentLocation();
    this.getFarmersAreaTree()
    if (options.orderId) {
      this.setData({
        orderId: options.orderId
      });
      this.getOrderDetail();
    } else {
      this.initNewReport();
    }
  },

  async initNewReport() {
    try {
      const busiId = await buildFruitMarketId({});
      this.setData({
        busiId
      });

      await this.getVarietiesList();

    } catch (err) {
      console.error('初始化失败:', err);
      this.toast('初始化失败', 'error');
    }
  },
  onTextInput(e) {
    let value = e.detail.value;
    let type = e.currentTarget.dataset.type;
    this.setData({
      ['priceReportDetail.' + type]: value
    })
    switch (type) {
      case "farmerMobile":
        const {
          phoneError
        } = this.data;
        const isPhoneNumber = /^[1][3,4,5,7,8,9][0-9]{9}$/.test(e.detail.value);
        if (phoneError === isPhoneNumber) {
          this.setData({
            phoneError: !isPhoneNumber,
          });
        } else {
          this.setData({
            ['priceReportDetail.' + type]: value
          })
        }
        break;

      default:
        break;
    }
    console.log(this.data.priceReportDetail)
  },
  getFarmersAreaTree() {
    const params = {
      "condition": {
        "userMobile": wx.getStorageSync('userInfo').userMobile,
        "roleCode": wx.getStorageSync('userInfo').roleCode,
      }
    };
    getmarketFarmersAreaTree(params).then(res => {
      console.log(res, 'getFarmersAreaTree')
      this.setData({
        farmerAreaList: this.recursiveArrayProcess(res)
      })
    })
  },
  recursiveArrayProcess(arr ) {
    return arr.map(item => {
      if (Array.isArray(item.children) && item.children.length > 0) {
       item.children =  this.recursiveArrayProcess(item.children); // 递归处理嵌套数组
      }
      return {
        value:item.areacode,
        label:item.areaname,
        areaLevel:item.areaLevel,
        children:item.children.length > 0 ? item.children : null
      }
    });
  },
  showAddCategoryDialog() {
    console.log('打开添加品种小类对话框');

    // 获取当前品种大类的所有小类
    const currentVarietyId = this.data.priceReportDetail.varietyId;
    if (!currentVarietyId) {
      this.toast('请先选择品种大类', 'warning');
      return;
    }

    // this.toast('加载中...', 'loading');

    const currentVariety = this.data.varieties.find(v => v.varietyId === currentVarietyId);
    const allCategories = currentVariety ? currentVariety.categories || [] : [];

    const params = {
      "condition": {
        "fruitMarketId": this.data.busiId,
        "varietyId": currentVarietyId
      }
    };

    marketSelectCategories(params).then((existingCategories) => {
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
  onCheckboxChange(e) {
    this.setData({
      selectedCategories: e.detail.value
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
    const currentVarietyId = this.data.priceReportDetail.varietyId;

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
        "fruitMarketId": this.data.busiId,
        "items": items
      }
    };

    // this.toast('添加中...', 'loading');

    marketAddCollectCategory(params).then(() => {
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
  

  setTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    this.setData({
      today: formattedDate,
      start: `${year}-${month}-${day} 00:00:00`,
      'priceReportDetail.collectDate': now.format('YYYY-MM-DD')
    });
  },

  async getCurrentLocation() {
    console.log('获取当前位置');
    const that = this;
    try {
      const res = await wx.authorize({
        scope: 'scope.userLocation',
      });

      const appAuthorizeSetting = wx.getAppAuthorizeSetting();
      if (appAuthorizeSetting.locationAuthorized === 'authorized') {
        const systemSetting = wx.getSystemSetting();
        if (systemSetting.locationEnabled) {
          wx.getLocation({
            type: 'gcj02',
            success(res) {
              const params = {
                condition: {
                  latitude: res.latitude,
                  longitude: res.longitude,
                }
              };
              regeo(params).then((regeoRes) => {
                that.setData({
                  'priceReportDetail.latitude': res.latitude,
                  'priceReportDetail.longitude': res.longitude,
                  'priceReportDetail.reportingLocation': regeoRes.address,
                });
              });
            },
            fail(err) {
              console.log(err);
            }
          });
        }
      }
    } catch (err) {
      console.log('定位权限获取失败', err);
    }
  },

  async getVarietiesList(flag) {
    try {
      const params = {
        condition: {}
      };
      const varietiesRes = await selectButtomVarieties(params);

      this.setData({
        varieties: varietiesRes
      });

      if (varietiesRes.length > 0 && !flag) {
        const firstVariety = varietiesRes[0];
        this.setData({
          'priceReportDetail.varietyId': firstVariety.varietyId,
          'priceReportDetail.varietyName': firstVariety.varietyName,
          // categories: firstVariety.categories || []
        });
        this.fetchCategories(firstVariety.varietyId);
      }
    } catch (err) {
      console.error('获取品种列表失败:', err);
      this.toast('获取品种数据失败', 'error');
    }
  },




  async getOrderDetail() {
    const params = {
      condition: {
        primaryKey: this.data.orderId
      }
    };
    await this.getVarietiesList(true);

    getFruitMarket(params).then((res) => {
      this.setData({
        priceReportDetail: {
          ...this.data.priceReportDetail,
          ...res
        },
        areaText:res.areaname,
        categories:res.collectCategories,
        disabled: ['4', '5'].includes(res.priceStatus),
        busiId: res.fruitMarketId 
      });

    }).catch(err => {
      this.toast('获取详情失败', 'error');
    }).finally(() => {
      this.setData({
        refresherTriggered: false
      });
    });
  },

  bindRefresh() {
    this.getCurrentLocation();
    if (this.data.orderId) {
      this.getOrderDetail();
    } else {
      this.getVarietiesList();
    }
  },

  async getLocation() {
    if (this.data.disabled) return;

    const that = this;
    try {
      const res = await wx.authorize({
        scope: 'scope.userLocation',
      });

      const appAuthorizeSetting = wx.getAppAuthorizeSetting();
      if (appAuthorizeSetting.locationAuthorized === 'authorized') {
        const systemSetting = wx.getSystemSetting();
        if (systemSetting.locationEnabled) {
          wx.chooseLocation({
            success(res) {
              const params = {
                condition: {
                  latitude: res.latitude,
                  longitude: res.longitude,
                }
              };
              regeo(params).then((regeoRes) => {
                that.setData({
                  'priceReportDetail.latitude': res.latitude,
                  'priceReportDetail.longitude': res.longitude,
                });
              });
            },
            fail(err) {
              console.log(err);
            }
          });
        }
      }
    } catch (err) {
      console.log('定位权限获取失败', err);
    }
  },

  onDateChange(e) {
    if (this.data.disabled) return;

    this.setData({
      'priceReportDetail.collectDate': e.detail,
    });
  },
  selectArea() {
    if (!this.data.farmerAreaList?.length) {
      wx.showToast({
        icon:'none',
        title: '暂无区县数据',
      })
      return
    }
    let citys = this.data.farmerAreaList[0].children;
    let counties = citys.length ? citys[0].children : []
    this.setData({
      areaVisible: true,
      pickerKay: 'areacode',
      cities:citys,
      counties
    });
  },
  onPickerChange(e,level) {
    const {
      value,
      label
    } = e.detail;
    console.log('picker confirm:', e);
    if(value[2] && label[2]){
      this.setData({
        areaVisible: false,
        'priceReportDetail.areacode': value[2],
        areaText: label.join("-"),
      });
    } else {
      wx.showToast({
        icon:'none',
        title: '请选择区县',
      })
    }
  },
  getCities(provinceValue) {
    const cities = provinceValue.children;
    const counties = cities[0].children;

    return { cities, counties };
  },
  getCounties(cityValue) {
    return getOptions(areaList.counties, (county) => match(county.value, cityValue, 4));
  },
  onColumnChange(e) {
    console.log('pick:', e.detail);
    const { column, index } = e.detail;
    const {  cities } = this.data;

    if (column === 0) {
      // 更改省份
      const { cities, counties } = this.getCities(this.data.farmerAreaList[index]);

      this.setData({ cities, counties });
    }

    if (column === 1) {
      // 更改城市
      const counties = cities[index].children;

      this.setData({ counties });
    }

    // if (column === 2) {
    //   // 更改区县
    // }
  },

  selectPriceType() {
    if (this.data.disabled) return;

    const priceTypeOptions = Object.entries(this.data.priceTypes).map(([value, label]) => {
      return {
        value: value,
        label: label
      };
    });

    this.setData({
      pickerOptions: priceTypeOptions,
      pickerValue: this.data.priceReportDetail.priceType,
      pickerTitle: "价格类型",
      pickerVisible: true,
      pickerKay: 'priceType'
    });
  },

  async tagClick(e) {
    if (this.data.disabled) return;
    this.setData({
      pickerOptions: this.data.varieties.map(v => {
        return {
          value: v.varietyId,
          label: v.varietyName,
        }
      }),
      pickerValue: this.data.priceReportDetail.varietyId,
      pickerTitle: "品种大类",
      pickerVisible: true,
      pickerKay: 'varietyId'
    });

  },

  categoryTagClick(e) {
    if (this.data.disabled) return;

    const categoryId = e.currentTarget.dataset.categoryid;
    const categoryName = e.currentTarget.dataset.categoryname;

    this.setData({
      'priceReportDetail.categoryId': categoryId,
      'priceReportDetail.categoryName': categoryName,
    });
  },







  fetchCategories(varietyId) {
    if (!varietyId) return;
    const params = {
      "condition": {
        "fruitMarketId": this.data.busiId ,
        "varietyId": varietyId
      }
    };
    
    marketSelectCategories(params).then((res) => {
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
  handleCategoryClick(e) {
    const categoryId = e.currentTarget.dataset.id;
    const categoryName = e.currentTarget.dataset.name;
    const fruitmarketid = e.currentTarget.dataset.fruitmarketid;
    const collectCategoryId = e.currentTarget.dataset.collectcategoryid;
    const collectstatus = e.currentTarget.dataset.collectstatus
    console.log('点击品种小类, collectCategoryId:', collectCategoryId);

    wx.navigateTo({
      url: `/subPackage/marketcategoryDetail/categoryDetail?categoryId=${categoryId}&categoryName=${categoryName}&varietyId=${this.data.priceReportDetail.varietyId}&varietyName=${this.data.priceReportDetail.varietyName}&stallId=${this.data.priceReportDetail.stallId}&collectCategoryId=${collectCategoryId}&fruitmarketid=${fruitmarketid}&collectStatus=${collectstatus}&priceStatus=${this.data.priceReportDetail.priceStatus}`
    });
  },
  deleteCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    const collectCategoryId = e.currentTarget.dataset.collectcategoryid;
    const varietyId = this.data.priceReportDetail.varietyId;
    console.log('删除品种小类', collectCategoryId);
    this.toast('正在删除...', 'loading');
    const params = {
      "condition": {
        "primaryKey": collectCategoryId
      }
    };

    marketRemoveCollectCategory(params).then((res) => {
      this.toast('删除成功', 'success');

      this.fetchCategories(varietyId);
    }).catch(err => {
      console.error('Error deleting category:', err);
    });
  },
  onPickerConfirm(e) {
    const section = this.data.currentSection;
    const index = this.data.specssIndex;
    const key = this.data.pickerKay;
    if (key == 'varietyId') {
      const varietyId = e.detail.value[0];
      const varietyName = e.detail.label[0];

      const selectedVariety = this.data.varieties.find(v => v.varietyId === varietyId);
      const categories = selectedVariety ? selectedVariety.categories || [] : [];

      this.setData({
        'priceReportDetail.varietyId': varietyId,
        'priceReportDetail.varietyName': varietyName,
        'priceReportDetail.categoryId': '',
        'priceReportDetail.categoryName': '',
        categories: categories,
        pickerVisible: false
      });
      this.fetchCategories(varietyId)
    } else {
      this.setData({
        [`priceReportDetail.${this.data.pickerKay}`]: e.detail.value[0],
        pickerVisible: false
      });
    }

  },
  onPickerCancel() {
    this.setData({
      pickerVisible: false
    });
  },

  chooseMedia(e) {
    if (this.data.disabled) return;

    const sourceType = e.currentTarget.dataset.type;
    const key = e.currentTarget.dataset.key;
    const that = this;

    wx.chooseMedia({
      count: 9,
      mediaType: ['image', 'video'],
      sourceType: [sourceType],
      camera: 'back',
      success(res) {
        res.tempFiles.forEach((temp) => {
          if (temp.tempFilePath) that.uploadFile(temp.tempFilePath, key);
        });
      }
    });
  },

  chooseMessageFile(e) {
    if (this.data.disabled) return;

    const key = e.currentTarget.dataset.key;
    const that = this;

    wx.chooseMessageFile({
      count: 10,
      type: 'all',
      success(res) {
        res.tempFiles.forEach((temp) => {
          if (temp.path) that.uploadFile(temp.path, key);
        });
      }
    });
  },

  uploadFile(tempFilePath, key) {
    const that = this;

    wx.uploadFile({
      url: `${env.baseURL || ''}/file/uploadFile`,
      filePath: tempFilePath,
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
        } = JSON.parse(res.data);

        if (retCode === 200) {
          that.setData({
            [key]: that.data[key].concat(retData)
          });
          console.log(that.data[key])
          that.toast('上传成功', 'success');
        } else {
          that.toast(retMsg || '上传失败', 'warning');
        }
      },
      fail() {
        that.toast('上传失败', 'error');
      }
    });
  },

  fileDelete(e) {
    if (this.data.disabled) return;

    const key = e.currentTarget.dataset.key;
    const index = e.currentTarget.dataset.index;
    const id = e.currentTarget.dataset.id;

    let files = [...this.data[key]];
    files.splice(index, 1);

    this.setData({
      [key]: files
    });

    this.toast('删除成功', 'success');
  },

  preview(e) {
    console.log(e);
    const id = e.currentTarget.dataset.id;
    const key = e.currentTarget.dataset.key;
    const index = e.currentTarget.dataset.index;

    const fs = wx.getFileSystemManager();
    if (['image', 'video'].includes(isImageVideoUrl(id))) {
      let fileIds = this.data[key].filter((v, i) => i === index);
      const sources = fileIds.map(item => {
        let params = {
          condition: {
            primaryKey: item,
          },
        };
        return filepreview(params);
      });

      wx.showLoading({
        title: '加载中',
      });

      Promise.all(sources).then(list => {
        const sourcesList = fileIds.map((item, i) => {
          let filePath = wx.env.USER_DATA_PATH + "/" + item;
          fs.writeFileSync(
            filePath,
            list[i].data,
            "binary"
          );
          return {
            url: filePath,
            type: isImageVideoUrl(item)
          };
        });

        wx.hideLoading();
        wx.previewMedia({
          sources: sourcesList,
          fail: (err) => {
            console.log(err);
          }
        });
      }).catch(err => {
        wx.hideLoading();
        console.error('预览失败:', err);
        this.toast('预览失败', 'error');
      });
    } else {
      this.toast('不支持的文件类型', 'warning');
    }
  },

  isImageVideoUrl(url) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'flv'];
    const ext = (url || '').split('.').pop().toLowerCase();

    if (imageExtensions.includes(ext)) {
      return 'image';
    } else if (videoExtensions.includes(ext)) {
      return 'video';
    }
    return 'other';
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

  staging() {
    this.setData({
      stagingLoading: true
    });
    this.saveData("0");
  },

  submit() {
    if (!this.validateData()) {
      return;
    }

    this.setData({
      submitLoading: true
    });
    this.saveData("1");
  },

  validateData() {
    if (!this.data.priceReportDetail.varietyId) {
      this.toast('请选择品种大类', 'warning');
      return false;
    }
    if (!this.data.priceReportDetail.areacode) {
      this.toast('请选择所属区县', 'warning');
      return false;
    }
    if (!this.data.priceReportDetail.collectDate) {
      this.toast('请选择行情价格日期', 'warning');
      return false;
    }
    return true;
  },

  hasValidPriceData() {
    const hasDiameterData = this.data.showDiameter && this.data.diameterData.some(item =>
      item.saleChannelCode && item.specsId && item.unitPrice && item.weight);

    const hasWeightData = this.data.showWeight && this.data.weightData.some(item =>
      item.saleChannelCode && item.specsId && item.unitPrice && item.weight);

    const hasBulkData = this.data.showBulk && this.data.bulkData.price && this.data.bulkData.weight;

    return hasDiameterData || hasWeightData || hasBulkData;
  },

  saveData(submitType) {
    const params = {
      condition: {
        ...this.data.priceReportDetail,
        submitType: submitType,
        fruitMarketId:this.data.priceReportDetail.fruitMarketId || this.data.busiId
      }
    };

    console.log('保存数据参数:', params);

    saveFruitMarket(params).then((res) => {
      this.toast('保存成功', 'success');
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }).catch(err => {
      this.toast(err.message || '保存失败', 'error');
    }).finally(() => {
      this.setData({
        stagingLoading: false,
        submitLoading: false
      });
    });
  },

  filterValidData(dataArray) {
    return dataArray.filter(item =>
      item.saleChannelCode && item.specsId && item.unitPrice && item.weight);
  }
});