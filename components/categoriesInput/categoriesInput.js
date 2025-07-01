// components/categoriesSelect/categoriesSelect.js
import {
  largeSelectCategories,
  collectSelectCategories,
  collectaddCollectCategory,
  largeAddCollectCategory
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
    categoryList:{
      type:Array,
      value:[]
    },
    categoryes:{
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
    specssIndex:"",
    showCategoryDialog: false,
    selectedCategories: [],
    availableCategories: [],
    unit:'',
    weight:''
  },
  observers: {
    "varietyId": function (varietyId) {
    },
    "categoryList":function(categories){
      console.log(categories,'categories')
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
    closeCategoryDialog() {
      this.setData({
        showCategoryDialog: false,
        weight:null
      });
    },
    selectCategory(e){
      if(this.data.disabled) return 
      const index = e.currentTarget.dataset.index;

      this.triggerEvent('selectItem', {
        type: 'category',
        index: index
      });
    },
    addCategory(){
      if(this.data.disabled) return 
      this.triggerEvent('addCategory');
    },
    deleteCategory(e) {
      const collectCategoryId = e.currentTarget.dataset.collectcategoryid;
      const index = e.currentTarget.dataset.index;
      const params = {
        index
      };
      this.triggerEvent('deleteCategory', {
        params
      });
    },


    handleCategoryClick(e) {
      const categoryId = e.currentTarget.dataset.id;
      const index = e.currentTarget.dataset.index;
  
      this.setData({
        showCategoryDialog:true,
        specssIndex:index,
        categoryId
      })
    },
    
    // 清除输入
    onInputClear() {
      this.setData({
        weight: null
      });
    },
       // 处理输入变化
       onInput(e) {
        this.setData({
          weight: e.detail.value
        });
      },
    confirmAddCategory() {
      let value = this.data.weight;
      if (!/^\d+(\.\d+)?$/.test(value)) {
        this.triggerEvent('toast', {
          message: '请输入有效的数字',
          theme: 'warning'
        });
        return;
      }
      let data = this.data.categoryes;
      data[this.data.specssIndex].planSaleWeight = value;
      this.setData({
        showCategoryDialog:false,
        weight:null
      })
      this.triggerEvent('update', {
        type: 'category',
        data: data
      });
    },

  }
})