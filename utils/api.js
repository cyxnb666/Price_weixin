import instance from '../utils/request'

/**
 * @description 获取n信息
 * @returns Promise
 */
export const filepreview = (data) => instance.post(`/file/preview`,data,{responseType: "arraybuffer"})
/**
 * @description 获取n信息
 * @returns Promise
 */
export const selectHome = () => instance.post(`/home/selectHome`)
/**
 * @description 获取用户信息
 * @returns Promise
 */
export const getFarmerByCode = (code) => instance.get(`/auth/getFarmerByCode?code=${code}`)
/**
 * @description 小程序登录接口
 * @param {Object} data
 * @returns Promise
 */
export const mobileLogin = (data) => instance.post('/auth/loginByMiniorogramCode', data)
/**
 * @description 分页查询采价任务列表
 * @param {Object} data
 * @returns Promise
 */
export const selectICollectPriceTasks = (data) => instance.post('/collect/selectICollectPriceTasks', data)
/**
 * @description 采价点任务详情
 * @param {Object} data
 * @returns Promise
 */
export const getWxCollecpriceTask = (data) => instance.post('/collect/getWxCollecpriceTask', data)
/**
 * @description 提交采价任务
 * @param {Object} data
 * @returns Promise
 */
export const submitCollectPriceTask = (data) => instance.post('/collect/submitCollectPriceTask', data)
/**
 * @description 删除关联采价点
 * @param {Object} data
 * @returns Promise
 */
export const removeStall = (data) => instance.post('/collect/removeStall', data)
/**
 * @description 查询当前采价员可选则采价点
 * @param {Object} data
 * @returns Promise
 */
export const selectChooseStalls = (data) => instance.post('/collect/selectChooseStalls', data)
/**
 * @description 新增采价任务采价点
 * @param {Object} data
 * @returns Promise
 */
export const addTaskStalls = (data) => instance.post('/collect/addTaskStalls', data)
/**
 * @description 新增采价任务采价点
 * @param {Object} data
 * @returns Promise
 */
export const calcCollectTaskRate = (data) => instance.post('/collect/calcCollectTaskRate', data)

/**
 * @description 采价任务详情
 * @param {Object} data
 * @returns Promise
 */
export const getCollectPrice = (data) => instance.post('/collect/getCollectPrice', data)
/**
 * @description 采价任务详情
 * @param {Object} data
 * @returns Promise
 */
export const ownersaveCollectPrice = (data) => instance.post('/owner/saveCollectPrice', data)
/**
 * @description 采价占比
 * @param {Object} data
 * @returns Promise
 */
export const actualCollectRate = (data) => instance.post('/collect/calcCollectTaskRate', data)

/**
 * @description 查询采价点联系人信息
 * @param {Object} data
 * @returns Promise
 */
export const selectStallLinkers = (data) => instance.post('/stall/selectStallLinkers', data)


/**
 * @description 大额出售计划分页查询
 * @param {Object} data
 * @returns Promise
 */
export const selectILargeSalePlans = (data) => instance.post('/large/selectILargeSalePlans', data)
/**
 * @description 认领任务
 * @param {Object} data
 * @returns Promise
 */
export const recvSalePlans = (data) => instance.post('/large/recv', data)
/**
 * @description 逆解析地址
 * @param {Object} data
 * @returns Promise
 */
export const regeo = (data) => instance.post('/geo/regeo', data)
/**
 * @description 查询可用果蔬品种品类
 * @param {Object} data
 * @returns Promise
 */
export const selectButtomVarieties = (data) => instance.post('/large/selectButtomVarieties', data)
/**
 * @description 查询果蔬规格
 * @param {Object} data
 * @returns Promise
 */
export const selectVarietySpecss = (data) => instance.post('/large/selectVarietySpecss', data)
/**
 * @description 数据字典
 * @param {Object} data
 * @returns Promise
 */
export const queryTypeDicts = (data) => instance.post('/dict/queryTypeDicts', data)
/**
 * @description 大额出售计划详情
 * @param {Object} data
 * @returns Promise
 */
export const getLargePlan = (data) => instance.post('/large/getLargePlan', data)
/**
 * @description 大额出售计划详情
 * @param {Object} data
 * @returns Promise
 */
export const getLargeCollectPrice = (data) => instance.post('/large/getLargeCollectPrice', data)
export const getStall = (data) => instance.post('/stall/getStall', data)
/**
 * @description 大额出售计划详情
 * @param {Object} data
 * @returns Promise
 */
export const selectStallFruiveggies = (data) => instance.post('/stall/selectStallFruiveggies', data)
/**
 * @description 大额出售计划详情
 * @param {Object} data
 * @returns Promise
 */
export const selectTaskChooseStalls = (data) => instance.post('/collect/selectTaskChooseStalls', data)


/**
 * @description 软删除附件基础信息表
 * @param {Object} data
 * @returns Promise
 */
export const softRemoveFile = (data) => instance.post('/file/softRemoveFile', data)

/**
 * @description
 * 新增采价信息
 * @param {Object} data
 * @returns Promise
 */
export const saveCollectPrice = (data) => instance.post('/collect/saveCollectPrice', data)


/**
 * @description
 * 发送短信
 * @param {Object} data
 * @returns Promise
 */
export const sendCollectPriceCooperSms = (data) => instance.post('/sms/sendCollectPriceCooperSms', data)

/**
 * @description
 * 生成任务号
 * @param {Object} data
 * @returns Promise
 */
export const buildCollectPriceId = (data) => instance.post('/collect/buildCollectPriceId', data)
/**
 * @description
 * 自主采集生成任务号
 * @param {Object} data
 * @returns Promise
 */
export const ownerbuildCollectPriceId = (data) => instance.post('/owner/buildCollectPriceId', data)
/**
 * @description
 * 查询自主采集价格任务详情
 * @param {Object} data
 * @returns Promise
 */
export const ownergetWxCollecpriceTask = (data) => instance.post('/owner/getWxCollecpriceTask', data)
/**
 * @description
 * 删除自主采集价格任务详情
 * @param {Object} data
 * @returns Promise
 */
export const withdrawCollectPrice = (data) => instance.post('/owner/withdrawCollectPrice', data)
export const getFarmersAreaTree = (data) => instance.post('/orecord/getFarmersAreaTree', data)
export const getmarketFarmersAreaTree = (data) => instance.post('/market/getFarmersAreaTree', data)

/**
 * @description
 * 删除自主采集价格任务详情
 * @param {Object} data
 * @returns Promise
 */
export const removeOwnerCollectPrice = (data) => instance.post('/owner/removeOwnerCollectPrice', data)
/**
 * @description
 * c端发送消息
 * @param {Object} data
 * @returns Promise
 */
export const callVideo = (data) => instance.post('/miniVideo/callVideo', data)

/**
 * @description 查询当前菜价点信息
 * @param {Object} date
 * @returns Promise
 */
export const largebuildCollectPriceId = (data) => instance.post('/large/buildCollectPriceId', data)
/**
 * @description 查询农户当前菜价点信息
 * @param {Object} date
 * @returns Promise
 */
export const selectCurrentStall = (data) => instance.post('/stall/selectCurrentStall', data)

/**
 * @description 新增大额出售计划
 * @param {Object} date
 * @returns Promise
 */
export const saveLargeSalePlan = (data) => instance.post('/large/saveLargeSalePlan', data)
export const saveLargeSaleCollectCategoryPrice = (data) => instance.post('/largesale/saveLargeCollectCategoryPrice', data)

/**
 * @description 编辑大额出售计划
 * @param {Object} date
 * @returns Promise
 */
export const editLargeSalePlan = (data) => instance.post('/large/editLargeSalePlan', data)

/**
 * @description 大额计划价格上报
 * @param {Object} date
 * @returns Promise
 */
export const reportLargePrice = (data) => instance.post('/large/reportLargePrice', data)
/**
 * @description 大额计划价格上报
 * @param {Object} date
 * @returns Promise
 */
export const ownerselectICollectPriceTasks = (data) => instance.post('/owner/selectICollectPriceTasks', data)
/**
 * @description 菜价点添加联系人
 * @param {Object} date
 * @returns Promise
 */
export const addStallLinker = (data) => instance.post('/stall/addStallLinker', data)


/**
 * @description 查询品种小类
 * @param {Object} data
 * @returns Promise
 */
export const ownerSelectCategories = (data) => instance.post('/owner/selectCategories', data)
export const marketSelectCategories = (data) => instance.post('/market/selectCategories', data)
export const largeSelectCategories = (data) => instance.post('/large2/selectCategories', data)
export const largeSaleSelectCategories = (data) => instance.post('/largesale/selectCategories', data)
export const collectSelectCategories = (data) => instance.post('/collect/selectCategories', data)

/**
 * @description 删除采价小类
 * @param {Object} data
 * @returns Promise
 */
export const ownerRemoveCollectCategory = (data) => instance.post('/owner/removeCollectCategory', data)
export const largeRemoveCollectCategory = (data) => instance.post('/large2/removeCollectCategory', data)
export const largesaleRemoveCollectCategory = (data) => instance.post('/largesale/removeCollectCategory', data)
export const collectremoveCollectCategory = (data) => instance.post('/collect/removeCollectCategory', data)

/**
 * @description 删除行情小类
 * @param {Object} data
 * @returns Promise
 */
export const marketRemoveCollectCategory = (data) => instance.post('/market/removeCollectCategory', data)
/**
 * @description 添加采价小类
 * @param {Object} data
 * @returns Promise
 */
export const ownerAddCollectCategory = (data) => instance.post('/owner/addCollectCategory', data)
export const largeAddCollectCategory = (data) => instance.post('/large2/addCollectCategory', data)
export const largeSaleAddCollectCategory = (data) => instance.post('/largesale/addCollectCategory', data)

export const collectaddCollectCategory = (data) => instance.post('/collect/addCollectCategory', data)

/**
 * @description 添加行情采价小类
 * @param {Object} data
 * @returns Promise
 */
export const marketAddCollectCategory = (data) => instance.post('/market/addCollectCategory', data)
export const getFruitMarket = (data) => instance.post('/market/getFruitMarket', data)

/**
 * @description 保存小类采价信息
 * @param {Object} data
 * @returns Promise
 */
export const saveOwnerCollectCategoryPrice = (data) => instance.post('/owner/saveOwnerCollectCategoryPrice', data)
/**
 * @description 保存行情小类采价信息
 * @param {Object} data
 * @returns Promise
 */
export const savemarketCollectCategoryPrice = (data) => instance.post('/market/saveOwnerCollectCategoryPrice', data)
export const saveLargeCollectCategoryPrice = (data) => instance.post('/large2/saveLargeCollectCategoryPrice', data)
export const savelargesaleCollectCategoryPrice = (data) => instance.post('/largesale/saveLargeCollectCategoryPrice', data)
export const saveCollectCollectCategoryPrice = (data) => instance.post('/collect/saveOwnerCollectCategoryPrice', data)
export const marketsoftRemoveFruitMarket = (data) => instance.post('/market/softRemoveFruitMarket', data)
export const getFruitMarketCategory = (data) => instance.post('/market/getFruitMarketCategory', data)

/**
 * @description 获取小类采价信息
 * @param {Object} data
 * @returns Promise
 */
export const getOwnerCollectCategory = (data) => instance.post('/owner/getOwnerCollectCategory', data)
export const geLargeCollectCategory = (data) => instance.post('/large2/geLargeCollectCategory', data)
export const gelargesaleCollectCategory = (data) => instance.post('/largesale/geLargeCollectCategory', data)
export const geCollectCollectCategory = (data) => instance.post('/collect/getOwnerCollectCategory', data)
/**
 * @description
 * 价格报送生成任务号
 * @param {Object} data
 * @returns Promise
 */
export const buildRecordId = (data) => instance.post('/orecord/buildRecordId', data)
/**
 * @description
 * 价格报送生成任务号
 * @param {Object} data
 * @returns Promise
 */
export const buildFruitMarketId = (data) => instance.post('/market/buildFruitMarketId', data)

/**
 * @description 分页查询订购记录列表
 * @param {Object} data
 * @returns Promise
 */
export const selectOrderRecords = (data) => instance.post('/orecord/selectIOrderRecords', data)
/**
 * @description 分页查询行情记录列表
 * @param {Object} data
 * @returns Promise
 */
export const selectIFruitMarkets = (data) => instance.post('/market/selectIFruitMarkets', data)








//下面随便写的等着用记得改--
/**
 * @description 获取订购记录详情
 * @param {Object} data
 * @returns Promise
 */
export const getOrderRecord = (data) => instance.post('/order/getOrderRecord', data)

/**
 * @description 新增订购记录
 * @param {Object} data
 * @returns Promise
 */
export const saveOrderRecord = (data) => instance.post('/order/saveOrderRecord', data)

/**
 * @description 删除订购记录
 * @param {Object} data
 * @returns Promise
 */
export const removeOrderRecord = (data) => instance.post('/order/removeOrderRecord', data)

/**
 * @description 更新订购记录状态
 * @param {Object} data
 * @returns Promise
 */
export const updateOrderStatus = (data) => instance.post('/order/updateOrderStatus', data)
/**
 * @description 更新订购记录状态
 * @param {Object} data
 * @returns Promise
 */
export const softRemoveOrderRecord = (data) => instance.post('/orecord/softRemoveOrderRecord', data)

/**
 * @description 生成价格报送任务号
 * @param {Object} data
 * @returns Promise
 */
export const buildPriceReportId = (data) => instance.post('/priceReport/buildPriceReportId', data)

/**
 * @description 保存价格报送信息
 * @param {Object} data
 * @returns Promise
 */
export const savePriceReport = (data) => instance.post('/priceReport/savePriceReport', data)

/**
 * @description 新增 暂存订购信息
 * @param {Object} data
 * @returns Promise
 */
export const saveOrEditOrderRecord = (data) => instance.post('/orecord/saveOrEditOrderRecord', data)

/**
 * @description 获取价格报送详情
 * @param {Object} data
 * @returns Promise
 */
export const getPriceReportDetail = (data) => instance.post('/priceReport/getPriceReportDetail', data)
/**
 * @description 获取订购记录详情
 * @param {Object} data
 * @returns Promise
 */
export const getOrderRecordorecord = (data) => instance.post('/orecord/getOrderRecord', data)
/**
 * @description 新增行情记录
 * @param {Object} data
 * @returns Promise
 */
export const saveFruitMarket = (data) => instance.post('/market/saveFruitMarket', data)
export const selectAreaTreeByParentCode = (data) => instance.post('/area/selectAreaTreeByParentCode', data)
export const saveTempCollectStall = (data) => instance.post('/stall/saveTempCollectStall', data)