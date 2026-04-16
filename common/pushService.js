/**
 * 微信小程序推送服务模块
 * 用于处理订阅消息相关功能
 */

import i18n from '../i18n/index.js'

// 存储键名
const SUBSCRIBE_STATUS_KEY = 'subscribe_status'
const PUSH_TIME_KEY = 'push_time'

// 模板消息ID需要替换为真实的模板消息ID
const TEMPLATE_ID = 'CzDG2lqRT2JnoKiTVvpmEYSlq0eg8R2JwLXEIoaVeLA'

/**
 * 获取订阅状态
 * @returns {Object} 订阅状态对象
 */
export function getSubscribeStatus() {
  try {
    const data = uni.getStorageSync(SUBSCRIBE_STATUS_KEY)
    return data ? JSON.parse(data) : {
      subscribed: false,      // 是否已订阅
      lastSubscribeTime: 0,   // 最后订阅时间
      pushTime: '08:00',       // 推送时间
      city: ''                // 城市
    }
  } catch (e) {
    console.error('Get subscribe status failed:', e)
    return {
      subscribed: false,
      lastSubscribeTime: 0,
      pushTime: '08:00',
      city: ''
    }
  }
}

/**
 * 保存订阅状态
 * @param {Object} status 订阅状态对象
 */
function saveSubscribeStatus(status) {
  try {
    uni.setStorageSync(SUBSCRIBE_STATUS_KEY, JSON.stringify(status))
  } catch (e) {
    console.error('Save subscribe status failed:', e)
  }
}

/**
 * 请求订阅消息权限
 * @returns {Promise<Object>} 订阅结果
 */
export async function requestSubscription() {
  return new Promise((resolve, reject) => {
    const status = getSubscribeStatus()

    uni.requestSubscribeMessage({
      tmplIds: [TEMPLATE_ID],
      success: (res) => {
        console.log('[Push] Subscribe request success:', res)

        if (res[TEMPLATE_ID] === 'accept') {
          status.subscribed = true
          status.lastSubscribeTime = Date.now()
          saveSubscribeStatus(status)
          
          // 调用云函数保存订阅信息
          if (wx.cloud) {
            wx.cloud.callFunction({
              name: 'saveSubscription',
              data: {
                pushTime: status.pushTime || '08:00',
                city: status.city || ''
              },
              success: (cloudRes) => {
                console.log('[Push] Cloud function success:', cloudRes)
              },
              fail: (err) => {
                console.error('[Push] Cloud function error:', err)
              }
            })
          }
          
          resolve({ success: true, message: '订阅成功' })
        } else if (res[TEMPLATE_ID] === 'reject') {
          resolve({ success: false, message: i18n.t('push.rejected') })
        } else if (res[TEMPLATE_ID] === 'ban') {
          resolve({ success: false, message: i18n.t('push.banned') })
        } else {
          resolve({ success: false, message: i18n.t('push.unknown') })
        }
      },
      fail: (err) => {
        console.error('[Push] Subscribe request failed:', err)
        reject({ success: false, message: err.errMsg || i18n.t('push.fail') })
      }
    })
  })
}

/**
 * 格式化推送消息内容
 * @param {Object} weatherData 天气数据
 * @param {string} locale 当前语言
 * @returns {Object} 消息内容对象
 */
export function formatPushMessage(weatherData, locale = 'zh') {
  const lang = locale === 'zh' ? 'zh' : 'en'
  const weatherDesc = weatherData?.friendlyDescription || i18n.t('description.clear sky')
  const clothingAdvice = weatherData?.clothingAdvice || i18n.t('clothing.comfortable')
  const message = locale === 'zh'
    ? `今日天气：${weatherDesc}，${Math.round(weatherData?.temperature || 0)}°C\n${clothingAdvice}`
    : `Today: ${weatherDesc}, ${Math.round(weatherData?.temperature || 0)}°C\n${clothingAdvice}`

  return {
    title: locale === 'zh' ? '每日天气提醒' : 'Daily Weather Reminder',
    content: message,
    city: weatherData?.cityName || ''
  }
}

/**
 * 设置推送时间
 * @param {string} time 推送时间，格式 HH:MM
 */
export function setPushTime(time) {
  const status = getSubscribeStatus()
  status.pushTime = time
  saveSubscribeStatus(status)
  console.log('[Push] Push time set to:', time)
}

/**
 * 获取推送时间
 * @returns {string} 推送时间 HH:MM
 */
export function getPushTime() {
  const status = getSubscribeStatus()
  return status.pushTime || '08:00'
}

/**
 * 检查是否到达推送时间
 * @returns {boolean}
 */
function isPushTime() {
  const status = getSubscribeStatus()
  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  return currentTime === status.pushTime
}

/**
 * 检查今天是否已经推送过
 * @returns {boolean}
 */
function hasPushedToday() {
  const status = getSubscribeStatus()
  if (!status.lastPushDate) return false
  const today = formatDate(new Date())
  return status.lastPushDate === today
}

/**
 * 格式化日期
 * @param {Date} date 日期对象
 * @returns {string} YYYY-MM-DD 格式
 */
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 定时推送任务
 * @param {Object} weatherData 天气数据
 * @param {Function} onPush 推送回调函数
 */
export function schedulePush(weatherData, onPush) {
  const status = getSubscribeStatus()
  if (!status.subscribed) {
    console.log('[Push] Not subscribed, skip push')
    return
  }

  if (hasPushedToday()) {
    console.log('[Push] Already pushed today, skip')
    return
  }

  if (!isPushTime()) {
    console.log('[Push] Not push time yet, skip')
    return
  }

  console.log('[Push] Executing scheduled push...')

  status.lastPushDate = formatDate(new Date())
  saveSubscribeStatus(status)

  if (onPush) {
    const message = formatPushMessage(weatherData, status.locale || 'zh')
    onPush(message)
  }
}

/**
 * 立即发送一条推送消息（演示用）
 * @param {Object} weatherData 天气数据
 */
export async function pushNow(weatherData) {
  const status = getSubscribeStatus()
  if (!status.subscribed) {
    return { success: false, message: i18n.t('push.notSubscribed') }
  }

  const message = formatPushMessage(weatherData, status.locale || 'zh')
  console.log('[Push] Push message now:', message)

  uni.showModal({
    title: status.locale === 'zh' ? '今天天气行不行？' : 'Weather Check',
    content: message.content,
    showCancel: false
  })

  return { success: true, message: message }
}

/**
 * 发送测试推送（调用云函数）
 * @param {Object} weatherData 天气数据
 * @returns {Promise<Object>} 发送结果
 */
export async function sendTestPush(weatherData) {
  const status = getSubscribeStatus()
  if (!status.subscribed) {
    return { success: false, message: i18n.t('push.notSubscribed') }
  }

  try {
    if (!wx.cloud) {
      return { success: false, message: '云开发未初始化' }
    }

    const result = await wx.cloud.callFunction({
      name: 'sendPush',
      data: {
        testMode: true,  // 测试模式：只给当前用户发送
        weatherData: {
          temperature: weatherData?.temperature,
          friendlyDescription: weatherData?.friendlyDescription,
          cityName: weatherData?.cityName
        }
      }
    })

    console.log('[Push] Test push result:', result)

    if (result.result && result.result.success) {
      return {
        success: true,
        message: result.result.message || i18n.t('push.testSuccess'),
        data: result.result.data
      }
    } else {
      return {
        success: false,
        message: result.result?.message || i18n.t('push.testFailed')
      }
    }
  } catch (err) {
    console.error('[Push] Test push error:', err)
    return { success: false, message: err.message || i18n.t('push.testFailed') }
  }
}

/**
 * 取消订阅（本地清理）
 */
export function unsubscribe() {
  const status = getSubscribeStatus()
  status.subscribed = false
  saveSubscribeStatus(status)
  console.log('[Push] Unsubscribed locally')

  // 同时调用云函数清理云端状态
  cancelCloudSubscription()
}

/**
 * 异步取消订阅（完整版）
 */
export async function unsubscribeAsync() {
  const status = getSubscribeStatus()
  status.subscribed = false
  saveSubscribeStatus(status)

  const result = await cancelCloudSubscription()
  return result
}

// 订阅i18n key常量
export const PUSH_I18N = {
  TITLE: 'push.title',
  BUTTON_TEXT: 'push.subscribe',
  SUCCESS: 'push.success',
  NOT_SUBSCRIBED: 'push.notSubscribed'
}

/**
 * 追踪订阅行为
 * @param {string} action - 订阅行为类型：'click' | 'success' | 'fail'
 */
export function trackSubscribe(action) {
  const actions = {
    click: '订阅按钮点击',
    success: '订阅成功',
    fail: '订阅失败'
  }
  console.log(`[Analytics] Track subscribe: ${action} - ${actions[action] || action}`)
  if (typeof uni !== 'undefined' && uni.reportAnalytics) {
    uni.reportAnalytics('subscribe_action', { action })
  }
}

/**
 * 保存订阅状态到云数据库（调用云函数）
 * @param {string} pushTime 推送时间
 * @param {string} city 城市
 * @returns {Promise<Object>} 保存结果
 */
export async function saveSubscriptionToCloud(pushTime = '08:00', city = '') {
  try {
    if (!wx.cloud) {
      console.warn('[Cloud] wx.cloud not available')
      return { success: false, message: '云开发未初始化' }
    }
    
    const result = await wx.cloud.callFunction({
      name: 'saveSubscription',
      data: { pushTime, city }
    })
    
    if (result.result && result.result.success) {
      console.log('[Cloud] Subscription saved:', result.result.data)
      return { success: true, data: result.result.data }
    } else {
      console.error('[Cloud] Save failed:', result)
      return { success: false, error: result.result?.message || 'Unknown error' }
    }
  } catch (err) {
    console.error('[Cloud] Save subscription failed:', err)
    return { success: false, error: err.message }
  }
}

/**
 * 从云数据库获取订阅状态（调用云函数）
 * @returns {Promise<Object>} 订阅状态
 */
export async function getSubscriptionFromCloud() {
  try {
    if (!wx.cloud) {
      return { success: false, message: '云开发未初始化' }
    }
    
    const result = await wx.cloud.callFunction({
      name: 'getSubscription'
    })
    
    if (result.result && result.result.success) {
      return { success: true, data: result.result.data }
    }
    
    return { success: false, message: result.result?.message || 'No subscription found' }
  } catch (err) {
    console.error('[Cloud] Get subscription failed:', err)
    return { success: false, error: err.message }
  }
}

/**
 * 取消云端订阅（调用云函数）
 * @returns {Promise<Object>} 取消结果
 */
export async function cancelCloudSubscription() {
  try {
    if (!wx.cloud) {
      return { success: false, message: '云开发未初始化' }
    }

    const result = await wx.cloud.callFunction({
      name: 'cancelSubscription'
    })

    if (result.result && result.result.success) {
      // 清除本地订阅状态
      const status = getSubscribeStatus()
      status.subscribed = false
      saveSubscribeStatus(status)

      return { success: true }
    }

    return { success: false, error: result.result?.message || 'Cancel failed' }
  } catch (err) {
    console.error('[Cloud] Cancel subscription failed:', err)
    return { success: false, error: err.message }
  }
}
