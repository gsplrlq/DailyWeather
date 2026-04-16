const dbName = 'daily_weather_images'  // 数据库集合名称

/**
 * 从云数据库获取今日天气图片
 */
async function getDailyWeatherImages() {
  try {
    const today = new Date().toISOString().split('T')[0]

    // 查询今日记录（小程序端API）
    const result = await wx.cloud.database().collection(dbName)
      .where({ date: today })
      .get()

    if (result.data && result.data.length > 0) {
      const record = result.data[0]
      return {
        success: true,
        images: {
          sunny: record.sunny?.url || '',
          cloudy: record.cloudy?.url || '',
          rainy: record.rainy?.url || '',
          snowy: record.snowy?.url || ''
        },
        date: record.date,
        createdAt: record.createdAt
      }
    }

    return { success: false, message: '今日图片尚未生成' }
  } catch (error) {
    console.error('获取每日天气图片失败:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 根据天气图标代码获取对应的天气类型
 */
function getWeatherType(iconCode) {
  if (iconCode === '01d' || iconCode === '01n') return 'sunny'
  if (iconCode.startsWith('09') || iconCode.startsWith('10')) return 'rainy'
  if (iconCode.startsWith('13')) return 'snowy'
  return 'cloudy'
}

/**
 * 获取今日指定天气的图片URL
 */
async function getTodayWeatherImage(iconCode) {
  const weatherType = getWeatherType(iconCode)

  try {
    const result = await getDailyWeatherImages()
    if (result.success) {
      return {
        success: true,
        imageUrl: result.images[weatherType],
        prompt: result.images[`${weatherType}Prompt`] || '',
        date: result.date,
        weatherType
      }
    }
    return { success: false, message: result.message }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export default {
  getDailyWeatherImages,
  getWeatherType,
  getTodayWeatherImage
}