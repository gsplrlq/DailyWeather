import i18n from '../i18n/index.js'

export class WeatherData {
  constructor(data) {
    this.cityName = data.cityName || i18n.t('weather.city')
    this.temperature = data.temperature || 0
    this.description = data.description || 'Unknown'
    this.iconCode = data.iconCode || '01d'
    this.humidity = data.humidity || 0
    this.windSpeed = data.windSpeed || 0
    this.feelsLike = data.feelsLike || 0
    this.mainWeather = data.mainWeather || 'Unknown'
    this.pollenLevel = data.pollenLevel || 'low'
    this.pollenLevelText = data.pollenLevelText || '花粉浓度：低'
    this.weatherImage = data.weatherImage || ''
  }

  // 获取友好化的天气描述（已国际化）
  get friendlyDescription() {
    return i18n.t('description.' + this.description.toLowerCase())
  }

  // 获取天气图标文字（已国际化）
  get weatherIconText() {
    return i18n.t('weatherIcon.' + this.iconCode)
  }

  // 获取可爱消息（已国际化）
  get cuteMessage() {
    const hour = new Date().getHours()
    const isMorning = hour >= 5 && hour < 12
    const isAfternoon = hour >= 12 && hour < 18
    const isEvening = hour >= 18 && hour < 22
    const isNight = hour >= 22 || hour < 5

    // 根据天气类型获取正确消息库
    const weatherType = this.getWeatherType()

    let timeKey
    if (isMorning) timeKey = 'morning'
    else if (isAfternoon) timeKey = 'afternoon'
    else if (isEvening) timeKey = 'evening'
    else timeKey = 'night'

    const messages = i18n.t('messages.' + timeKey)
    return messages[weatherType] || messages.default
  }

  // 获取穿衣建议（已国际化）
  get clothingAdvice() {
    if (this.temperature < 5) {
      return i18n.t('clothing.veryCold')
    } else if (this.temperature < 10) {
      return i18n.t('clothing.cold')
    } else if (this.temperature < 15) {
      return i18n.t('clothing.cool')
    } else if (this.temperature < 20) {
      return i18n.t('clothing.comfortable')
    } else if (this.temperature < 25) {
      return i18n.t('clothing.warm')
    } else if (this.temperature < 30) {
      return i18n.t('clothing.hot')
    } else {
      return i18n.t('clothing.veryHot')
    }
  }

  // 获取天气类型分类
  getWeatherType() {
    const code = this.iconCode
    if (code === '01d' || code === '01n') return 'sunny'
    if (code.startsWith('09') || code.startsWith('10')) return 'rainy'
    if (code.startsWith('13')) return 'snowy'
    return 'cloudy'
  }

  // 获取花粉浓度信息
  getPollenInfo() {
    const temp = this.temperature
    const humidity = this.humidity
    const windSpeed = this.windSpeed
    const month = new Date().getMonth() + 1

    // 春季（3-5月）花粉浓度较高
    const isSpring = month >= 3 && month <= 5
    // 夏季高温天（6-8月）花粉相对较低
    const isSummer = month >= 6 && month <= 8
    // 秋季（9-11月）又是花粉高峰期
    const isAutumn = month >= 9 && month <= 11

    let level = 'low'
    let levelText = i18n.t('pollen.low')
    let levelIcon = '🌸'

    // 基础判断逻辑
    let riskScore = 0
    if (isSpring) riskScore += 3
    if (isAutumn) riskScore += 2
    if (temp >= 15 && temp <= 28) riskScore += 2
    if (humidity >= 40 && humidity <= 70) riskScore += 1
    if (windSpeed > 3) riskScore += 1
    if (isSummer) riskScore -= 2

    if (riskScore >= 5) {
      level = 'high'
      levelText = i18n.t('pollen.high')
      levelIcon = '😷'
    } else if (riskScore >= 3) {
      level = 'medium'
      levelText = i18n.t('pollen.medium')
      levelIcon = '🤧'
    }

    return {
      level,
      levelText,
      levelIcon,
      advice: i18n.t('pollenAdvice.' + level)
    }
  }

  // 获取AI生成的可爱天气图片URL
  getWeatherImagePrompt() {
    const weatherType = this.getWeatherType()
    const hour = new Date().getHours()
    const isNight = hour >= 19 || hour < 6
    const temp = Math.round(this.temperature)

    // 根据天气类型生成AI图片提示词
    const prompts = {
      sunny: isNight
        ? 'cute corgi puppy sleeping under moonlight, stars twinkling, cozy dreams, kawaii anime style, pastel colors'
        : `cute corgi puppy enjoying warm sunshine, playing in flower field, happy smile, ${temp > 25 ? "wearing tiny sunglasses" : "chasing butterflies"}, kawaii anime style, soft pastel colors`,
      cloudy: 'cute corgi puppy sitting on fluffy cloud, looking at the sky curiously, dreaming, kawaii anime style, soft pastel colors',
      rainy: 'cute corgi puppy wearing yellow raincoat, holding red umbrella, splashing in puddles, happy expression, kawaii anime style, soft pastel colors',
      snowy: 'cute corgi puppy wearing red scarf, building snowman, catching snowflakes on tongue, cozy winter sweater, kawaii anime style, soft pastel colors'
    }

    return prompts[weatherType] || prompts.sunny
  }

  // 获取天气类型对应的AI生成图片URL（从数据库读取）
  // 注意: 实际使用中会在首页通过云函数从数据库读取每日图片
  // 这里保留getWeatherImage()方法供备用
  getWeatherImage() {
    return {
      prompt: this.getWeatherImagePrompt(),
      imageUrl: '',
      weatherType: this.getWeatherType()
    }
  }

  // 获取渐变色样式
  get backgroundStyle() {
    const colorMap = {
      '01d': { start: '#FFB347', end: '#FFCC33' },
      '01n': { start: '#1A1A2E', end: '#16213E' },
      '02d': { start: '#74B9FF', end: '#A29BFE' },
      '02n': { start: '#74B9FF', end: '#A29BFE' },
      '03d': { start: '#636E72', end: '#B2BEC3' },
      '03n': { start: '#636E72', end: '#B2BEC3' },
      '04d': { start: '#636E72', end: '#B2BEC3' },
      '04n': { start: '#636E72', end: '#B2BEC3' },
      '09d': { start: '#5F6CAF', end: '#A8B5E3' },
      '09n': { start: '#5F6CAF', end: '#A8B5E3' },
      '10d': { start: '#5F6CAF', end: '#A8B5E3' },
      '10n': { start: '#5F6CAF', end: '#A8B5E3' },
      '11d': { start: '#6C5CE7', end: '#A29BFE' },
      '11n': { start: '#6C5CE7', end: '#A29BFE' },
      '13d': { start: '#D4F1F4', end: '#FFFFFF' },
      '13n': { start: '#D4F1F4', end: '#FFFFFF' },
      '50d': { start: '#B8B8B8', end: '#E0E0E0' },
      '50n': { start: '#B8B8B8', end: '#E0E0E0' }
    }
    return colorMap[this.iconCode] || { start: '#74B9FF', end: '#0984E3' }
  }

  // 获取格式化日期
  get formattedDate() {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()

    // 根据语言环境获取星期
    const locale = i18n.getCurrentLocale()
    const weekDayNames = locale === 'zh'
      ? ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    const weekDay = weekDayNames[now.getDay()]

    if (locale === 'zh') {
      return `${month}月${day}日 ${weekDay}`
    }
    return `${month}/${day} ${weekDay}`
  }
}

// 解析 API 响应数据
export function parseWeatherResponse(data) {
  if (!data || !data.weather || !data.main) {
    return null
  }

  const weatherData = new WeatherData({
    cityName: data.name || 'Unknown City',
    temperature: data.main.temp || 0,
    description: data.weather[0]?.description || 'Unknown',
    iconCode: data.weather[0]?.icon || '01d',
    humidity: data.main.humidity || 0,
    windSpeed: data.wind?.speed || 0,
    feelsLike: data.main.feels_like || 0,
    mainWeather: data.weather[0]?.main || 'Unknown'
  })

  // 获取花粉浓度信息
  const pollenInfo = weatherData.getPollenInfo()
  weatherData.pollenLevel = pollenInfo.level
  weatherData.pollenLevelText = `${pollenInfo.levelIcon} ${pollenInfo.levelText}`

  // 获取AI天气图片（包含提示词和URL）
  const weatherImageInfo = weatherData.getWeatherImage()
  weatherData.weatherImagePrompt = weatherImageInfo.prompt
  weatherData.weatherImageUrl = weatherImageInfo.imageUrl
  weatherData.weatherImage = weatherImageInfo.imageUrl

  return weatherData
}