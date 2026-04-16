import zh from './zh.js'
import en from './en.js'

// 语言映射表
const messages = {
  zh,
  en
}

// 获取当前语言，默认中文
function getLocale() {
  // 优先从本地存储读取
  try {
    const saved = uni.getStorageSync('locale')
    if (saved && messages[saved]) {
      return saved
    }
  } catch (e) {
    console.log('Get locale from storage failed:', e)
  }

  // 默认使用中文
  return 'zh'
}

// 设置语言
function setLocale(locale) {
  if (messages[locale]) {
    try {
      uni.setStorageSync('locale', locale)
    } catch (e) {
      console.log('Set locale to storage failed:', e)
    }
  }
}

// 获取翻译文本
function t(key, params = {}) {
  const locale = getLocale()
  const lang = messages[locale]

  // 支持点号分隔的路径，如 'weather.loading'
  const keys = key.split('.')
  let value = lang

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      // 找不到时返回 key
      return key
    }
  }

  // 如果是函数，传入参数
  if (typeof value === 'function') {
    value = value(params)
  }

  return value
}

// 获取当前语言代码
function getCurrentLocale() {
  return getLocale()
}

// 获取可用语言列表
function getAvailableLocales() {
  return [
    { code: 'zh', name: '中文' },
    { code: 'en', name: 'English' }
  ]
}

// 切换语言
function switchLocale(locale) {
  if (messages[locale]) {
    setLocale(locale)
    // 通知页面刷新
    uni.$emit('localeChanged', locale)
  }
}

export default {
  getLocale,
  setLocale,
  t,
  getCurrentLocale,
  getAvailableLocales,
  switchLocale,
  messages
}