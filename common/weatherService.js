import { parseWeatherResponse } from './weather.js'
import CONFIG_DATA from './config/config.json'

const API_KEY = CONFIG_DATA.OPENWEATHER_API_KEY
const QQ_MAP_KEY = CONFIG_DATA.QQ_MAP_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'
const GEOCODER_URL = 'https://apis.map.qq.com/ws/geocoder/v1/'

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

  /**
   * 地理编码：将中文城市名转换为经纬度
   * @param {string} cityName - 城市名
   * @returns {Promise<{latitude: number, longitude: number}>}
   */
  async getCoordsByCity(cityName) {
    return new Promise((resolve, reject) => {
      // 调用腾讯位置服务地理编码API
      const url = `https://apis.map.qq.com/ws/geocoder/v1/?address=${encodeURIComponent(cityName)}&key=${QQ_MAP_KEY}`

      uni.request({
        url: url,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200 && res.data?.status === 0) {
            const location = res.data.result?.location
            if (location) {
              resolve({
                latitude: location.lat,
                longitude: location.lng
              })
            } else {
              reject(new Error('未找到该城市'))
            }
          } else {
            reject(new Error(res.data?.message || '地理编码失败'))
          }
        },
        fail: (err) => {
          console.error('Geocoder request failed:', err)
          reject(new Error('地理编码请求失败'))
        }
      })
    })
  }

  /**
   * 根据城市名获取天气（通过经纬度查询）
   */
  async getWeatherByCity(cityName) {
    try {
      // 1. 通过腾讯地图API获取城市经纬度
      const coords = await this.getCoordsByCity(cityName)
      // 2. 获取中文城市名（可选，用于显示）
      const chineseCityName = await this.getChineseCityName(coords.latitude, coords.longitude)
      // 3. 使用经纬度查询天气
      const weatherData = await this.fetchWeatherByCoords(coords.latitude, coords.longitude, chineseCityName || cityName)

      this.cache = weatherData
      this.cacheTime = Date.now()
      return weatherData
    } catch (error) {
      console.error('Get weather by city error:', error)
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