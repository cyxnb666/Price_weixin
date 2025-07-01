// priceReportDetail.js
import {
  selectButtomVarieties,
  regeo,
  getFarmersAreaTree,
  buildRecordId,
  saveOrEditOrderRecord,
  getOrderRecordorecord,
  selectVarietySpecss,
  queryTypeDicts,
  filepreview,
  softRemoveFile,
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
    userInfo: wx.getStorageSync('userInfo'),
    monthVisible: false,
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
    specssIndex: null,
    currentSection: '',
    today: '',
    areaVisible: false,
    areaValue: '',
    provinces: [],
    cities: [],
    counties: [],
    priceTypes: {
      'FARMER_SALE_PRICE': '离地价',
      'BUY_PRICE': '收购价'
    },
    phoneError: false,
    priceReportDetail: {
      collectAddress: '',
      longitude: '',
      latitude: '',
      collectMonth: '',
      areacode:"",
      priceType: 'BUY_PRICE',
      varietyId: '',
      varietyName: '',
      categoryId: '',
      categoryName: ''
    },
    pickerProp:{
      value:'areacode',
      label:'areaname'
    },
    varieties: [],
    categories: [],
    farmerAreaList: [],
    diameterData: [{
      fvSpecsMax: 0,
      fvSpecsMin: 0,
      fvSpecsUnit: "",
      saleChannelCode: "SCH_JXS",
      specsId: 0,
      specsType: "DIAMETER",
      unitPrice: 0,
      weight: 0,
      varietyUnit: "UG",
    }],
    weightData: [{
      fvSpecsMax: 0,
      fvSpecsMin: 0,
      fvSpecsUnit: "",
      saleChannelCode: "SCH_JXS",
      specsId: 0,
      specsType: "WEIGHT",
      unitPrice: 0,
      weight: 0,
      varietyUnit: "UG",
    }],
    bulkData: {
      price: '',
      specsId: 0,
      saleChannelCode: "SCH_JXS",
      varietyUnit: "UG",
      unitPrice: 0,
      weight: ''
    },

    cardFileIds: [],
    agreementFileIds: [],
    channel: [],
    specssList: {},

    showDiameter: true,
    showWeight: false,
    showBulk: false,
    priceTypeOptions: [{
        label: '一月',
        value: '1'
      },
      {
        label: '二月',
        value: '2'
      },
      {
        label: '三月',
        value: '3'
      },
      {
        label: '四月',
        value: '4'
      },
      {
        label: '五月',
        value: '5'
      },
      {
        label: '六月',
        value: '6'
      },
      {
        label: '七月',
        value: '7'
      },
      {
        label: '八月',
        value: '8'
      },
      {
        label: '九月',
        value: '9'
      },
      {
        label: '十月',
        value: '10'
      },
      {
        label: '十一月',
        value: '11'
      },
      {
        label: '十二月',
        value: '12'
      },
    ],
    varietyUnit: {
      "UG": "元/斤",
      "UKG": "元/公斤",
    }
  },

  onLoad(options) {
    this.setTodayDate();
    this.getCurrentLocation();
    this.getChannelList();
    this.getFarmersAreaTree()
    if(wx.getStorageSync('userInfo').secondRoleCode == 'MARKET'){
      this.setData({
        "priceReportDetail.priceType":"BUY_PRICE"
      })
    } else {
      this.setData({
        "priceReportDetail.priceType":"FARMER_SALE_PRICE"
      })
    }
    if (options.orderId) {
      this.setData({
        orderId: options.orderId
      });
      this.getOrderDetail();
    } else {
      this.initNewReport();
    }
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

  async initNewReport() {
    try {
      const busiId = await buildRecordId({});
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
    getFarmersAreaTree(params).then(res => {
      this.setData({
        farmerAreaList: this.recursiveArrayProcess(res),
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
  hidePicker() {
    this.setData({
      monthVisible: false
    });
  },
  onConfirm(e) {
    const {
      value
    } = e.detail;
    this.setData({
      ['priceReportDetail.collectMonth']: value,
      monthVisible: false
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
      'priceReportDetail.collectMonth': now.format('YYYY-MM')
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
                  'priceReportDetail.collectAddress': regeoRes.address,
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

  async getVarietiesList() {
    try {
      const params = {
        condition: {}
      };
      const varietiesRes = await selectButtomVarieties(params);

      this.setData({
        varieties: varietiesRes
      });

      if (varietiesRes.length > 0) {
        if(this.data.orderId){
          this.setData({
            categories: varietiesRes.find(v=>v.varietyId == this.data.priceReportDetail.varietyId)?.categories || []
          });
        } else {
          const firstVariety = varietiesRes[0];
          this.setData({
            'priceReportDetail.varietyId': firstVariety.varietyId,
            'priceReportDetail.varietyName': firstVariety.varietyName,
            categories: firstVariety.categories || [],
            "priceReportDetail.categoryId":firstVariety.categories[0]?.categoryId
          });
  
          await this.getSpecsList(firstVariety.varietyId);
        }

      }
    } catch (err) {
      console.error('获取品种列表失败:', err);
      this.toast('获取品种数据失败', 'error');
    }
  },

  async getSpecsList(varietyId, flag) {
    if (!varietyId) {
      console.warn('无法获取规格列表: 品种ID为空');
      return;
    }

    const params = {
      primaryKey: varietyId
    };

    try {
      const res = await selectVarietySpecss(params);
      this.setData({
        specssList: res
      });
      if (!flag) {
        this.setData({
          diameterData: res['diameterSpecsVos'].map(v => {
            v.saleChannelCode = 'SCH_JXS'
            return v
          }),
          weightData: res['weightSpecsVos'].map(v => {
            v.saleChannelCode = 'SCH_JXS'
            return v
          }),
          bulkData: res['wholeSpecsVos'].length ? res['wholeSpecsVos'][0] : {
            fvSpecsMax: 0,
            fvSpecsMin: 0,
            fvSpecsUnit: null,
            specsId: '',
            specsType: "WHOLE",
            varietyId: '',
            varietyUnit: "UG",
          },
        })
      }
    } catch (err) {
      console.error('获取规格列表失败:', err);
      this.toast('获取规格列表失败', 'error');
    }
  },

  getChannelList() {
    const params = {
      condition: {
        dictType: 'SALE_CHANNEL'
      }
    };

    queryTypeDicts(params).then((res) => {
      console.log('获取渠道列表成功:', res);
      this.setData({
        channel: res
      });
    }).catch(err => {
      console.error('获取渠道列表失败:', err);
      this.toast('获取渠道列表失败', 'error');
    });
  },

  getOrderDetail() {
    const params = {
      condition: {
        primaryKey: this.data.orderId
      }
    };

    getOrderRecordorecord(params).then((res) => {
      console.log(res,'cardFileIds')
      this.setData({
        priceReportDetail: {
          ...this.data.priceReportDetail,
          ...res
        },
        areaText:res.areaname,
        disabled: ['5', '4'].includes(res.priceStatus),
        busiId: res.recordId,
        cardFileIds:res.cardFiles.map(v=>v.fileId),
        agreementFileIds:res.agreementFiles.map(v=>v.fileId),
        showBulk:!!res.specss.find(v=>v.specsType == 'WHOLE'),
        showDiameter:!!res.specss.find(v=>v.specsType == 'DIAMETER'),
        showWeight:!!res.specss.find(v=>v.specsType == 'WEIGHT'),
        weightData:res.specss.filter(v=>v.specsType  == 'WEIGHT' ),
        bulkData:res.specss.filter(v=>v.specsType  == 'WHOLE' ).length ? res.specss.filter(v=>v.specsType  == 'WHOLE' )[0] : this.data.bulkData ,
        diameterData:res.specss.filter(v=>v.specsType  == 'DIAMETER' ),
        
      });
      console.log(this.data.diameterData,'diameterData')
      console.log(this.data.weightData,'weightData')
      console.log(this.data.bulkData,'bulkData')
      this.getVarietiesList()
      if (res.varietyId) {
        this.getSpecsList(res.varietyId, true);
      }
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
                  'priceReportDetail.collectAddress': regeoRes.address,
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
      'priceReportDetail.collectMonth': e.detail,
    });
  },
  selectArea() {
    if(this.data.disabled) return
    let citys = this.data.farmerAreaList[0] && this.data.farmerAreaList[0].children;
    let counties = citys.length ? citys[0].children : []
    this.setData({
      areaVisible: true,
      pickerKay: 'areacode',
      cities:citys,
      counties
    });
  },
  selectMonth() {
    if (this.data.disabled) return;
    this.setData({
      monthVisible: true,
      pickerKay: 'collectMonth'
    });
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

    const varietyId = e.currentTarget.dataset.varietyid;
    const varietyName = e.currentTarget.dataset.varietyname;

    const selectedVariety = this.data.varieties.find(v => v.varietyId === varietyId);
    const categories = selectedVariety ? selectedVariety.categories || [] : [];

    this.setData({
      'priceReportDetail.varietyId': varietyId,
      'priceReportDetail.varietyName': varietyName,
      'priceReportDetail.categoryId': '',
      'priceReportDetail.categoryName': '',
      categories: categories
    });

    await this.getSpecsList(varietyId);
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

  handleUpdate(e) {
    const {
      type,
      data
    } = e.detail;
    this.setData({
      [`${type}Data`]: data
    });
    console.log(`${type}数据已更新:`, data);
  },

  handleSelectItem(e) {
    const {
      type,
      section,
      index
    } = e.detail;

    this.setData({
      currentSection: section,
      specssIndex: index,
      pickerKay: type === 'channel' ? 'saleChannelCode' : 'specsId'
    });

    if (type === 'channel') {
      this.setData({
        pickerOptions: this.data.channel.map(item => {
          return {
            label: item.dictValue,
            value: item.dictCode
          };
        }),
        pickerTitle: '渠道',
        pickerValue: this.data[`${section}Data`][index].saleChannelCode,
        pickerVisible: true
      });
    } else {
      const specType = section === 'diameter' ? 'diameterSpecsVos' : 'weightSpecsVos';

      if (!this.data.specssList[specType] || this.data.specssList[specType].length === 0) {
        this.toast('暂无规格数据', 'warning');
        return;
      }

      const specsList = this.data.specssList[specType];

      this.setData({
        pickerOptions: specsList.map(item => {
          let label = `${item.fvSpecsMin} ${item.fvSpecsUnit}-${item.fvSpecsMax} ${item.fvSpecsUnit}`;
          if (item.fvSpecsMin === null) {
            label = `${item.fvSpecsMax} ${item.fvSpecsUnit} 以下`;
          }
          if (item.fvSpecsMax === null) {
            label = `${item.fvSpecsMin} ${item.fvSpecsUnit} 以上`;
          }
          return {
            label,
            value: item.specsId
          };
        }),
        pickerTitle: '规格',
        pickerValue: this.data[`${section}Data`][index].specsId,
        pickerVisible: true
      });
    }
  },

  handleToast(e) {
    const {
      message,
      theme
    } = e.detail;
    this.toast(message, theme);
  },

  handleSectionToggle(e) {
    const {
      section,
      show
    } = e.detail;
    this.setData({
      [`show${section}`]: show
    });
    console.log(`${section}显示状态已更新为: ${show}`);
  },

  onPickerConfirm(e) {
    if (this.data.currentSection && this.data.specssIndex !== null) {
      const section = this.data.currentSection;
      const index = this.data.specssIndex;
      const key = this.data.pickerKay;
      const data = [...this.data[`${section}Data`]];

      data[index][key] = e.detail.value[0];

      if (key === 'specsId') {
        const specsType = section === 'diameter' ? 'diameterSpecsVos' : 'weightSpecsVos';
        const specs = this.data.specssList[specsType]
          .find(item => item.specsId === e.detail.value[0]);
        if (specs) {
          data[index].fvSpecsMin = specs.fvSpecsMin;
          data[index].fvSpecsMax = specs.fvSpecsMax;
          data[index].fvSpecsUnit = specs.fvSpecsUnit;
          data[index].varietyUnit = specs.varietyUnit;

          let specsName = `${specs.fvSpecsMin} ${specs.fvSpecsUnit}-${specs.fvSpecsMax} ${specs.fvSpecsUnit}`;
          if (specs.fvSpecsMin === null) {
            specsName = `${specs.fvSpecsMax} ${specs.fvSpecsUnit} 以下`;
          }
          if (specs.fvSpecsMax === null) {
            specsName = `${specs.fvSpecsMin} ${specs.fvSpecsUnit} 以上`;
          }
          data[index].specsName = specsName;
        }
      } else if (key === 'saleChannelCode') {
        const channel = this.data.channel.find(item => item.dictCode === e.detail.value[0]);
        if (channel) {
          data[index].saleChannelName = channel.dictValue;
        }
      }

      this.setData({
        [`${section}Data`]: data,
        pickerVisible: false
      });

      console.log(`${section}数据已更新:`, data);
    } else {
      this.setData({
        [`priceReportDetail.${this.data.pickerKay}`]: e.detail.value[0],
        pickerVisible: false
      });
    }
  },

  onPickerCancel() {
    this.setData({
      areaVisible: false
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
    if (!this.data.priceReportDetail.areacode) {
      this.toast('请选择所属区县', 'warning');
      return false;
    }
    if (!this.data.priceReportDetail.varietyId) {
      this.toast('请选择品种大类', 'warning');
      return false;
    }
    if (!this.data.priceReportDetail.categoryId) {
      this.toast('请选择品种小类', 'warning');
      return false;
    }

    if (!this.hasValidPriceData()) {
      this.toast('请至少填写一种规格类型的数据', 'warning');
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
    let specss = [];
    console.log(this.data, 'data')
    if (this.data.showDiameter) {
      const validDiameterData = this.filterValidData(this.data.diameterData);
      if (validDiameterData.length > 0) {
        validDiameterData.forEach(item => {
          item.specsType = "DIAMETER";
        });
        specss = specss.concat(validDiameterData);
      }
    }

    if (this.data.showWeight) {
      const validWeightData = this.filterValidData(this.data.weightData);
      if (validWeightData.length > 0) {
        validWeightData.forEach(item => {
          item.specsType = "WEIGHT";
        });
        specss = specss.concat(validWeightData);
      }
    }

    if (this.data.showBulk && this.data.bulkData.weight) {
      specss.push(this.data.bulkData);
    }

    const params = {
      condition: {
        ...this.data.priceReportDetail,
        recordId: this.data.busiId,
        specss: specss,
        cardFileIds: this.data.cardFileIds,
        agreementFileIds: this.data.agreementFileIds,
        submitType: submitType
      }
    };

    console.log('保存数据参数:', params);

    saveOrEditOrderRecord(params).then((res) => {
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