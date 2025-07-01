// components/categoriesSelect/categoriesSelect.js
import {
  largeSelectCategories,
  largeSaleAddCollectCategory,
  ownerSelectCategories,
  largeSaleSelectCategories,
  collectSelectCategories,
  collectaddCollectCategory,
  largeAddCollectCategory,
  ownerAddCollectCategory
} from "../../utils/api"
import {
  Toast
} from "tdesign-miniprogram";
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    varietyId: {
      type: String,
      value: ''
    },
    stallId:{
      type:String,
      value:''
    },
    varietyName:{
      type:String,
      value:''
    },
    taskId: {
      type: String,
      value: ''
    },
    planId:{
      type:String,
      value:""
    },
    varieties:{
      type:Array,
      value:[]
    },
    jumpUrl:{
      type:String,
      value:'/subPackage/salePlan/minPrice/largePriceDetail/largePriceDetail'
    },
    tasktype:{
      type:String,
      value:''
    },
    disabled: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showCategoryDialog: false,
    selectedCategories: [],
    availableCategories: [],
    categories:[]
  },
  observers: {
    "varietyId": function (varietyId) {
      this.fetchCategories(varietyId)
    }
  },
  attached() {},
  /**
   * 组件的方法列表
   */
  methods: {
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
    showAddCategoryDialog() {
      console.log('打开添加品种小类对话框');

      // 获取当前品种大类的所有小类
      const currentVarietyId = this.data.varietyId;
      if (!currentVarietyId) {
        this.toast('请先选择品种大类', 'warning');
        return;
      }

      // this.toast('加载中...', 'loading');
      console.log(this.data.varieties,'varieties')
      const currentVariety = this.data.varieties.find(v => v.varietyId == currentVarietyId);
      const allCategories = currentVariety ? currentVariety.categories || [] : [];
      if(!this.data.taskId) return
      const params = {
        "condition": {
          "collectPriceId": this.data.taskId,
          "varietyId": currentVarietyId,
          "planId":this.data.tasktype == 'largeSale' ? this.data.planId : undefined
        }
      };
      let obj = {
        "collect":collectSelectCategories,
        "large":largeSelectCategories,
        "largeSale":largeSaleSelectCategories,
        "owner":ownerSelectCategories
      }
      console.log(this.data.tasktype,'type')
      obj[this.data.tasktype](params).then((existingCategories) => {
        const addedCategoryIds = existingCategories.map(item => item.categoryId);
        console.log(allCategories,'allCategories')
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
    deleteCategory(e) {
      const collectCategoryId = e.currentTarget.dataset.collectcategoryid;
      const params = {
        "condition": {
          "primaryKey": collectCategoryId
        }
      };
      this.triggerEvent('deleteCategory', {
        params
      });
    },

    fetchCategories(varietyId) {
      if (!varietyId) return;
      const params = {
        "condition": {
          "collectPriceId": this.data.taskId,
          "varietyId": varietyId,
          "planId":this.data.tasktype == 'largeSale' ? this.data.planId : undefined
        }
      };
      let obj = {
        "collect":collectSelectCategories,
        "large":largeSelectCategories,
        "largeSale":largeSaleSelectCategories,
        "owner":ownerSelectCategories
      }
      obj[this.data.tasktype](params).then((res) => {
        this.setData({
          categories: res.map(item => ({
            ...item,
            collectCategoryId: item.collectCategoryId,
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
      const collectCategoryId = e.currentTarget.dataset.collectcategoryid;
      const collectstatus = e.currentTarget.dataset.collectstatus
      console.log('点击品种小类, collectCategoryId:', collectCategoryId);
  
      wx.navigateTo({
        url: `${this.data.jumpUrl}?categoryId=${categoryId}&categoryName=${categoryName}&varietyId=${this.data.varietyId}&varietyName=${this.data.varietyName}&stallId=${this.data.stallId}&collectCategoryId=${collectCategoryId}&collectStatus=${collectstatus}&collectPriceId=${this.data.taskId}`
      });
    },
    confirmAddCategory() {
      const selectedIds = this.data.selectedCategories;
      const currentVarietyId = this.data.varietyId;

      if (selectedIds.length === 0) {
        this.toast('请至少选择一个品种小类', 'warning');
        return;
      }

      console.log('确认添加品种小类：', selectedIds);

      const items = selectedIds.map(categoryId => {
        return {
          categoryId: categoryId,
          varietyId: currentVarietyId,
          "planId":this.data.tasktype == 'largeSale' ? this.data.planId : undefined
        };
      });

      const params = {
        "condition": {
          "collectPriceId": this.data.taskId,
          "items": items
        }
      };

      // this.toast('添加中...', 'loading');
      let obj = {
        collectaddCollectCategory
      }
      let requestobj = {
        "collect":collectaddCollectCategory,
        "large":largeAddCollectCategory,
        "largeSale":largeSaleAddCollectCategory,
        "owner":ownerAddCollectCategory,
      }
      requestobj[this.data.tasktype](params).then(() => {
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

  }
})