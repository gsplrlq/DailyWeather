import { parseWeatherResponse } from './weather.js'
import md5 from 'md5'

// 从配置文件加载密钥
const config = getConfig()
const API_KEY = config.OPENWEATHER_API_KEY
const QQ_MAP_KEY = config.QQ_MAP_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'
const GEOCODER_URL = 'https://apis.map.qq.com/ws/geocoder/v1/'

function getConfig() {
  try {
    const configPath = process.env.UNI_APP_ENV === 'mp-weixin' 
      ? '/config/config.json' 
      : '../../config/config.json'
    const configData = require(configPath)
    return configData
  } catch (e) {
    console.error('[config] 配置文件不存在，请创建 config/config.json 并填入密钥')
    return {
      OPENWEATHER_API_KEY: '',
      QQ_MAP_KEY: ''
    }
  }
}

export class WeatherService {
  constructor() {
    this.cache = null
    this.cacheTime = 0
    this.cacheDuration = 30 * 60 * 1000
  }

  getLocation() {
    return new Promise((resolve, reject) => {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude
          })
        },
        fail: (err) => {
          console.error('Location failed:', err)
          reject(new Error('Failed to get location'))
        }
      })
    })
  }

  /**
   * 逆地理编码：将坐标转换为中文城市名
   */
  async getChineseCityName(lat, lon) {
    //  a. 首先对参数进行排序：按参数名升序
    //  b. 签名计算(sig)： 请求路径+”?”+请求参数+SK进行拼接，并计算拼接后字符串md5值（字符必须为小写），即为签名(sig)：
    //  c. 生成最终请求：将计算得到的签名sig，放到请求中（参数名即为：sig）：
    // const sig = md5(`${GEOCODER_URL}?get_poi_address=0&key=${QQ_MAP_KEY}&location=${lat},${lon}${SK}`)
    try {
      const url = `${GEOCODER_URL}?location=${lat},${lon}&key=${QQ_MAP_KEY}&get_poi_address=0`
      const response = await uni.request({
        url: url,
        method: 'GET'
      })

      if (response.statusCode === 200 && response.data?.status === 0) {
        const ad_info = response.data.result?.ad_info
        if (ad_info) {
          // 返回省/市/区格式，优先显示城市
          const city = ad_info.city || ''
          const district = ad_info.district || ''
          // 如果城市名包含"市"，去掉它
          return city.replace(/市$/, '') || district.replace(/市$/, '') || '未知地区'
        }
      }
      console.warn('Geocoder failed, using original city name')
      return null
    } catch (error) {
      console.error('Geocoder error:', error)
      return null
    }
  }

  async fetchWeatherByCoords(lat, lon, chineseCityName = null) {
    try {
      const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=en`
      const response = await uni.request({
        url: url,
        method: 'GET'
      })

      if (response.statusCode === 200 && response.data) {
        const weatherData = parseWeatherResponse(response.data)
        // 如果提供了中文城市名，替换掉英文城市名
        if (chineseCityName && weatherData) {
          weatherData.cityName = chineseCityName
        }
        return weatherData
      } else {
        throw new Error('Failed to fetch weather data')
      }
    } catch (error) {
      console.error('Weather fetch error:', error)
      throw error
    }
  }

  async fetchWeatherByCity(cityName) {
    try {
      const url = `${BASE_URL}?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric&lang=zh_cn`
      const response = await uni.request({
        url: url,
        method: 'GET'
      })

      if (response.statusCode === 200 && response.data) {
        return parseWeatherResponse(response.data)
      } else {
        throw new Error('Failed to fetch weather data')
      }
    } catch (error) {
      console.error('Weather fetch error:', error)
      throw error
    }
  }

  async getCurrentWeather() {
    if (this.cache && (Date.now() - this.cacheTime) < this.cacheDuration) {
      return this.cache
    }

    try {
      const location = await this.getLocation()
      // 先获取中文城市名
      const chineseCityName = await this.getChineseCityName(location.latitude, location.longitude)
      const weatherData = await this.fetchWeatherByCoords(location.latitude, location.longitude, chineseCityName)
      this.cache = weatherData
      this.cacheTime = Date.now()
      return weatherData
    } catch (error) {
      console.error('Get current weather error:', error)
      throw error
    }
  }

  async refreshWeather() {
    this.cache = null
    this.cacheTime = 0
    return this.getCurrentWeather()
  }

  clearCache() {
    this.cache = null
    this.cacheTime = 0
  }
}

export default new WeatherService()