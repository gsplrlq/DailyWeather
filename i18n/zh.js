export default {
  // 通用
  common: {
    loading: '加载中...',
    refresh: '刷新',
    retry: '重试',
    error: '出错了',
    close: '关闭',
    checkWeather: '查看天气',
    failedToLoad: '加载失败，请检查定位权限和API密钥',
    failedToRefresh: '刷新失败'
  },

  // 天气页面
  weather: {
    loading: '加载天气中...',
    city: '未知城市',
    feelsLike: '体感温度',
    humidity: '湿度',
    wind: '风速',
    outfitTip: '穿衣建议'
  },

  // 天气描述
  description: {
    'clear sky': '晴朗',
    'few clouds': '少云',
    'scattered clouds': '多云',
    'broken clouds': '阴',
    'overcast clouds': '阴天',
    'shower rain': '阵雨',
    'rain': '下雨',
    'thunderstorm': '雷暴',
    'snow': '下雪',
    'mist': '薄雾',
    'haze': '霾',
    'fog': '雾'
  },

  // 天气图标文字
  weatherIcon: {
    '01d': '晴天',
    '01n': '月亮',
    '02d': '多云',
    '02n': '多云',
    '03d': '阴天',
    '03n': '阴天',
    '04d': '阴天',
    '04n': '阴天',
    '09d': '雨天',
    '09n': '雨天',
    '10d': '雨天',
    '10n': '雨天',
    '11d': '雷暴',
    '11n': '雷暴',
    '13d': '雪天',
    '13n': '雪天',
    '50d': '雾',
    '50n': '雾'
  },

  // 可爱消息
  messages: {
    morning: {
      sunny: '阳光明媚，适合户外活动~',
      cloudy: '云朵像棉花糖一样~',
      rainy: '雨天，听雨声很治愈~',
      default: '新的一天，新的开始~'
    },
    afternoon: {
      sunny: '天气正好，享受美好时光！',
      cloudy: '多云天也很舒适~',
      rainy: '记得带伞哦~',
      default: '下午好，注意休息~'
    },
    evening: {
      sunny: '夕阳西下，散步时光~',
      cloudy: '晚霞满天，心情美美~',
      rainy: '雨天宅家，温馨舒适~',
      default: '傍晚好，准备回家了吗~'
    },
    night: {
      sunny: '星空璀璨，晚安好梦~',
      cloudy: '夜空如画，做个好梦~',
      rainy: '雨声伴眠，睡个好觉~',
      default: '夜深了，注意休息~'
    }
  },

  // 穿衣建议
  clothing: {
    veryCold: '天寒地冻，全副武装！',
    cold: '外面很冷，穿上外套！',
    cool: '有点凉，记得加件外套',
    comfortable: '温度宜人，轻装即可~',
    warm: '暖和舒适，春装正合适~',
    hot: '有点热，穿凉爽点~',
    veryHot: '酷热难耐，注意防暑！'
  },

  // 花粉浓度
  pollen: {
    low: '低',
    medium: '中等',
    high: '高'
  },

  // 花粉建议
  pollenAdvice: {
    low: '空气质量良好，适合户外活动',
    medium: '花粉浓度中等，外出记得戴口罩',
    high: '花粉浓度较高，建议减少户外活动'
  },

  // 订阅消息
  push: {
    title: '订阅每日天气',
    description: '每天 8:00 收到天气推送，不错过重要天气变化',
    subscribe: '订阅天气',
    subscribed: '已订阅',
    unsubscribe: '取消订阅',
    testPush: '测试推送',
    success: '订阅成功！',
    rejected: '你拒绝了订阅',
    banned: '订阅功能暂不可用',
    fail: '订阅失败，请重试',
    unknown: '订阅状态未知',
    notSubscribed: '请先订阅',
    confirmUnsubscribe: '确定要取消订阅吗？',
    cancelUnsubscribe: '取消',
    unsubscribedSuccess: '已取消订阅',
    unsubscribedFailed: '取消订阅失败',
    testSuccess: '测试推送成功！请检查微信服务通知',
    testFailed: '测试推送失败',
    sending: '发送中...'
  },

  // 错误消息
  error: {
    locationFailed: '定位失败，请授权位置权限',
    networkError: '网络错误，请检查网络连接',
    apiError: '天气数据获取失败',
    default: '加载天气失败，请检查定位权限和API密钥',
    refreshFailed: '刷新失败'
  },

  // 页面文本
  page: {
    checkWeather: '查看天气',
    failedToLoad: '加载失败，请检查定位权限和API密钥',
    failedToRefresh: '刷新失败'
  },

  // 默认消息
  default: {
    loading: '加载中...',
    checkWeather: '查看天气',
    todayWeather: '今天天气行不行？',
    subscribeDesc: '点击订阅，每天早上告诉你答案 ☀️🌧️'
  }
}
