import {
  selectVarietySpecss,
  queryTypeDicts
} from "../../utils/api"
Component({
  properties: {
    // 接收父组件传递的数据
    varietyId: {
      type: String,
      value: ''
    },
    diameterData: {
      type: Array,
      value: []
    },
    weightData: {
      type: Array,
      value: []
    },
    bulkData: {
      type: Object,
      value: {
        unitPrice: '',
        weight: ''
      }
    },
    channel: {
      type: Array,
      value: []
    },
    diameterSpecs: {
      type: Array,
      value: []
    },
    weightSpecs: {
      type: Array,
      value: []
    },
    disabled: {
      type: Boolean,
      value: false
    },
    varietyUnit: {
      type: Object,
      value: {
        "UG": "元/斤",
        "UKG": "元/公斤"
      }
    },
    showDiameterSection: {
      type: Boolean,
      value: false
    },
    showWeightSection: {
      type: Boolean,
      value: false
    },
    showBulkSection: {
      type: Boolean,
      value: false
    }
  },

  data: {
    pickerOptions: [],
    pickerVisible: false,
    pickerTitle: '',
    pickerType: '',
    pickerKay: '',
    pickerValue: null,
    showDiameter: false,
    showWeight: false,
    showBulk: false,
    showWithInput: false,
    unitPrice: null,
    weight: null,
    unit: '',
    specssList: [],
    specssIndex: null,
    inputType: '', // price 或 weight
    inputSection: '', // diameter, weight 或 bulk
    varietyUnitWeight: {
      "UG": "斤",
      "UKG": "公斤",
    },
  },
  observers: {
    'showDiameterSection, showWeightSection, showBulkSection': function (showDiameter, showWeight, showBulk) {
      console.log(this.data.diameterData,'diameterData')
      console.log(this.data.weightData,'weightData')
      console.log(this.data.bulkData,'bulkData')
      this.setData({
        showDiameter,
        showWeight,
        showBulk,
      });

    },
    "varietyId": function (varietyId) {
      console.log(this.data.varietyId, varietyId, 'this.data.varietyId')
      // this.getSpecsList(this.data.varietyId)
    }
  },

  methods: {
    async getSpecsList(varietyId) {
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
      } catch (err) {
        console.error('获取规格列表失败:', err);
        this.toast('获取规格列表失败', 'error');
      }
    },
    toggleSection(e) {
      const section = e.currentTarget.dataset.section;
      this.setData({
        [`show${section}`]: !this.data[`show${section}`]
      });

      this.triggerEvent('sectionToggle', {
        section: section,
        show: this.data[`show${section}`]
      });
    },

    // 添加规格行
    addSpecs(e) {
      const section = e.currentTarget.dataset.section;
      let data = [...this.data[`${section}Data`]];
      data.push({
        fvSpecsMax: 0,
        fvSpecsMin: 0,
        fvSpecsUnit: "",
        saleChannelCode: "SCH_JXS",
        specsId: 0,
        specsType: section === "diameter" ? "DIAMETER" : "WEIGHT",
        unitPrice: 0,
        weight: 0,
        varietyUnit: "UG",
      });

      this.triggerEvent('update', {
        type: section,
        data: data
      });
    },

    // 删除规格行
    removeSpecs(e) {
      const section = e.currentTarget.dataset.section;
      const index = e.currentTarget.dataset.index;
      let data = [...this.data[`${section}Data`]];

      if (data.length <= 1) return;

      data.splice(index, 1);
      this.triggerEvent('update', {
        type: section,
        data: data
      });
    },

    // 显示输入对话框
    showInputDialog(e) {
      if(this.data.disabled){ return}
      const value = e.currentTarget.dataset.value;
      const index = e.currentTarget.dataset.index;
      const unit = e.currentTarget.dataset.unit;
      const type = e.currentTarget.dataset.type;
      const section = e.currentTarget.dataset.section;

      this.setData({
        showWithInput: true,
        unitPrice: value,
        unit,
        specssIndex: Number(index),
        inputType: type,
        inputSection: section
      });
    },

    // 处理输入变化
    onInput(e) {
      this.setData({
        [this.data.inputType === 'unitPrice' ? 'unitPrice' : 'weight']: e.detail.value
      });
    },

    // 清除输入
    onInputClear() {
      this.setData({
        [this.data.inputType === 'unitPrice' ? 'unitPrice' : 'weight']: null
      });
    },

    // 关闭对话框
    closeDialog(e) {
      if (e.type === "confirm") {
        const type = this.data.inputType;
        const section = this.data.inputSection;
        const value = type === 'unitPrice' ? this.data.unitPrice : this.data.weight;

        if (!value) {
          this.triggerEvent('toast', {
            message: `请输入${type === 'unitPrice' ? '价格' : '重量'}`,
            theme: 'warning'
          });
          return;
        }

        if (!/^\d+(\.\d+)?$/.test(value)) {
          this.triggerEvent('toast', {
            message: '请输入有效的数字',
            theme: 'warning'
          });
          return;
        }

        if (section === 'bulk') {
          // 更新统果数据
          let bulkData = {
            ...this.data.bulkData
          };
          bulkData[type === 'unitPrice' ? 'unitPrice' : 'weight'] = value;

          this.triggerEvent('update', {
            type: 'bulk',
            data: bulkData
          });
        } else {
          // 更新规格数据
          let data = [...this.data[`${section}Data`]];
          data[this.data.specssIndex][type === 'unitPrice' ? 'unitPrice' : 'weight'] = value;
          console.log(data,'data')
          this.triggerEvent('update', {
            type: section,
            data: data
          });
        }
      }

      this.setData({
        showWithInput: false,
        unitPrice: null,
        weight: null
      });
    },
    onPickerConfirm(e) {
      console.log(this.data.pickerKay, 'primaryKey')
      let pckerBase = {
        saleChannelCode: 'diameterData',
        specsId: 'weightData',
      }
      let pickerData = this.data[`${this.data.pickerType}Data`]
      pickerData.forEach((item, index) => {
        if (index !== this.data.specssIndex) return;
        item[this.data.pickerKay] = e.detail.value[0];
        if (this.data.pickerKay !== 'specsId') return;
        const label = e.detail.label[0];
        const {
          fvSpecsMin,
          fvSpecsMax,
          fvSpecsUnit
        } = this.parseSpecsLabel(label);
        let specssItem = this.data[`${this.data.pickerType}Data`]
        const varietyUnit = specssItem.find(v => v.specsId == e.detail.value[0]) ? specssItem.find(v => v.specsId == e.detail.value[0]).varietyUnit : item.varietyUnit
        Object.assign(item, {
          fvSpecsMin,
          fvSpecsMax,
          fvSpecsUnit,
          varietyUnit
        });
      });
      console.log(pickerData, 'pickerData')
      this.triggerEvent('update', {
        type: this.data.pickerType,
        data: pickerData
      });

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
    // 选择渠道
    selectChannel(e) {
      if(this.data.disabled){ return}
      const section = e.currentTarget.dataset.section;
      const index = e.currentTarget.dataset.index;
      const key = e.currentTarget.dataset.key
      const params = {
        condition: {
          dictType: 'SALE_CHANNEL'
        }
      }
      queryTypeDicts(params).then((res) => {
        this.setData({
          pickerType: section,
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
      // this.triggerEvent('selectItem', {
      //   type: 'channel',
      //   section: section,
      //   index: index
      // });
    },

    // 选择规格
    selectSpecs(e) {
      if(this.data.disabled){ return}
      const section = e.currentTarget.dataset.section;
      const index = e.currentTarget.dataset.index;
      const key = e.currentTarget.dataset.key
      console.log(section,'section')
      let pickerData = {
        "weight":'weightSpecs',
        "diameter":'diameterSpecs'
      }
      this.setData({
        pickerKay: key,
        pickerType: section,
        specssIndex: Number(index),
        pickerTitle: '规格',
        pickerValue: e.currentTarget.dataset.id,
        pickerOptions: this.data[pickerData[section]].map(item => {
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
      // this.triggerEvent('selectItem', {
      //   type: 'specs',
      //   section: section,
      //   index: index
      // });
    }
  }
});