// 城市管理服务（无保存，选择后直接查询）
const POPULAR_CITIES = [
  { name: '北京', id: 'beijing', latitude: 39.9042, longitude: 116.4074 },
  { name: '上海', id: 'shanghai', latitude: 31.2304, longitude: 121.4737 },
  { name: '广州', id: 'guangzhou', latitude: 23.1291, longitude: 113.2644 },
  { name: '深圳', id: 'shenzhen', latitude: 22.5431, longitude: 113.9444 },
  { name: '杭州', id: 'hangzhou', latitude: 30.2741, longitude: 120.1551 },
  { name: '成都', id: 'chengdu', latitude: 30.5728, longitude: 104.0668 },
  { name: '重庆', id: 'chongqing', latitude: 29.5630, longitude: 106.5516 },
  { name: '武汉', id: 'wuhan', latitude: 30.5928, longitude: 114.3055 },
  { name: '西安', id: 'xian', latitude: 34.3416, longitude: 108.9398 },
  { name: '南京', id: 'nanjing', latitude: 32.0603, longitude: 118.7969 },
  { name: '苏州', id: 'suzhou', latitude: 31.2989, longitude: 120.5853 },
  { name: '天津', id: 'tianjin', latitude: 39.0842, longitude: 117.2010 },
  { name: '长沙', id: 'changsha', latitude: 28.2282, longitude: 112.9388 },
  { name: '郑州', id: 'zhengzhou', latitude: 34.7466, longitude: 113.6254 },
  { name: '青岛', id: 'qingdao', latitude: 36.0671, longitude: 120.3826 },
  { name: '沈阳', id: 'shenyang', latitude: 41.8057, longitude: 123.4315 },
  { name: '大连', id: 'dalian', latitude: 38.9140, longitude: 121.6147 },
  { name: '厦门', id: 'xiamen', latitude: 24.4798, longitude: 118.0894 },
  { name: '济南', id: 'jinan', latitude: 36.6512, longitude: 117.1200 },
  { name: '福州', id: 'fuzhou', latitude: 26.0745, longitude: 119.2965 },
  { name: '哈尔滨', id: 'haerbin', latitude: 45.8038, longitude: 126.5340 },
  { name: '长春', id: 'changchun', latitude: 43.8868, longitude: 125.3245 },
  { name: '昆明', id: 'kunming', latitude: 25.0389, longitude: 102.7183 },
  { name: '贵阳', id: 'guiyang', latitude: 26.6470, longitude: 106.6302 },
  { name: '南宁', id: 'nanning', latitude: 22.8170, longitude: 108.3665 },
  { name: '石家庄', id: 'shijiazhuang', latitude: 38.0428, longitude: 114.5149 },
  { name: '太原', id: 'taiyuan', latitude: 37.8706, longitude: 112.5489 },
  { name: '南昌', id: 'nanchang', latitude: 28.6828, longitude: 115.8579 },
  { name: '合肥', id: 'hefei', latitude: 31.8206, longitude: 117.2272 },
  { name: '兰州', id: 'lanzhou', latitude: 36.0611, longitude: 103.8343 },
  { name: '乌鲁木齐', id: 'wulumuqi', latitude: 43.8256, longitude: 87.6168 },
  { name: '拉萨', id: 'lasa', latitude: 29.6525, longitude: 91.1401 },
  { name: '呼和浩特', id: 'huhehaote', latitude: 40.8414, longitude: 111.7519 },
  { name: '银川', id: 'yinchuan', latitude: 38.4872, longitude: 106.2309 },
  { name: '西宁', id: 'xining', latitude: 36.6171, longitude: 101.7782 },
  { name: '海口', id: 'haikou', latitude: 20.0440, longitude: 110.1996 },
  { name: '香港', id: 'xianggang', latitude: 22.3193, longitude: 114.1694 },
  { name: '澳门', id: 'aomen', latitude: 22.1987, longitude: 113.5439 },
  { name: '台北', id: 'taibei', latitude: 25.0330, longitude: 121.5654 }
]

class CityService {
  constructor() {
    this.currentCity = null
  }

  /**
   * 获取当前选中的城市
   */
  getCurrentCity() {
    return this.currentCity
  }

  /**
   * 设置当前城市（不保存）
   * @param {Object} city 城市对象 { name, id, latitude, longitude } 或 null 表示使用定位
   */
  setCurrentCity(city) {
    this.currentCity = city
    console.log('[CityService] 已设置当前城市:', city ? city.name : '使用定位')
    return true
  }

  /**
   * 获取热门城市列表
   */
  getPopularCities() {
    return POPULAR_CITIES
  }

  /**
   * 搜索城市
   */
  searchCities(keyword) {
    if (!keyword || keyword.trim() === '') {
      return []
    }
    const lowerKeyword = keyword.toLowerCase()
    return POPULAR_CITIES.filter(city =>
      city.name.toLowerCase().includes(lowerKeyword)
    )
  }

  /**
   * 根据城市ID获取城市信息（包含经纬度）
   */
  getCityById(cityId) {
    return POPULAR_CITIES.find(city => city.id === cityId)
  }
}

export default new CityService()
