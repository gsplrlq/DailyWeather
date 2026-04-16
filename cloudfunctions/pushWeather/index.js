const cloud = require('wx-server-sdk')
const https = require('https')

cloud.init({ env: 'cloud1-4g4pgi0p302de70d', traceUser: true })

const db = cloud.database()

// 从配置文件加载密钥
const config = require('@/config/config.json')
const APPID = config.WECHAT_APP_ID
const APPSECRET = config.WECHAT_APP_SECRET
const TEMPLATE_ID = config.TEMPLATE_ID

// access_token 缓存
let cachedAccessToken = null
let tokenExpireTime = 0

// 温馨提示文案
const PUSH_MESSAGES = [
  '☀️ 点击查看今日天气，开启美好一天！',
  '🌤️ 今日天气已更新，快来看看吧~',
  '🌈 新的一天，点击查看天气情况！',
  '🌧️ 天气变化早知道，点击查看~',
  '❄️ 今日天气提醒，点击了解详情！'
]

/**
 * 通过 HTTP GET 请求获取 access_token
 * 不依赖云调用权限
 */
function getAccessTokenHttp() {
  return new Promise((resolve, reject) => {
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`
    
    console.log('[token] 正在通过 HTTP 获取 access_token...')
    
    https.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const result = JSON.parse(data)
          if (result.access_token) {
            console.log('[token] HTTP 获取成功')
            resolve(result)
          } else {
            console.error('[token] HTTP 获取失败:', result.errmsg)
            reject(new Error(result.errmsg || '获取 access_token 失败'))
          }
        } catch (err) {
          reject(err)
        }
      })
    }).on('error', (err) => {
      console.error('[token] HTTP 请求失败:', err.message)
      reject(err)
    })
  })
}

/**
 * 通过 HTTP POST 请求发送订阅消息
 * 不依赖云调用权限
 */
function sendSubscribeMessageHttp(accessToken, touser, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      touser,
      template_id: TEMPLATE_ID,
      page: 'pages/index/index',
      data,
      miniprogram_state: 'formal'
    })

    const options = {
      hostname: 'api.weixin.qq.com',
      port: 443,
      path: `/cgi-bin/message/subscribe/send?access_token=${accessToken}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }

    console.log(`[push] 通过 HTTP 发送订阅消息给: ${touser}`)

    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        try {
          const result = JSON.parse(body)
          resolve(result)
        } catch (err) {
          reject(err)
        }
      })
    })

    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

/**
 * 获取有效的 access_token
 * 支持缓存和自动刷新
 */
async function getAccessToken() {
  const now = Date.now()

  // 检查缓存是否有效（提前5分钟刷新）
  if (cachedAccessToken && now < tokenExpireTime - 300000) {
    console.log('[token] 使用缓存的 access_token')
    return cachedAccessToken
  }

  try {
    // 使用 HTTP 方式获取 access_token
    const result = await getAccessTokenHttp()

    if (result.access_token) {
      cachedAccessToken = result.access_token
      tokenExpireTime = now + (result.expires_in || 7200) * 1000

      console.log('[token] 获取成功，有效期:', result.expires_in, '秒')
      return cachedAccessToken
    }

    throw new Error('获取 access_token 失败')
  } catch (err) {
    console.error('[token] 获取 access_token 失败:', err)

    // 如果失败，尝试使用环境变量中的凭证
    const envAccessToken = process.env.WX_ACCESS_TOKEN
    if (envAccessToken) {
      console.log('[token] 使用环境变量中的 access_token')
      return envAccessToken
    }

    throw err
  }
}

/**
 * 发送订阅消息（HTTP 方式）
 */
async function sendSubscribeMessage(user) {
  const data = {
    date1: { value: getTodayDate() },
    thing5: { value: getRandomMessage() }
  }

  console.log('[push] 准备发送给用户:', user.openId)

  try {
    // 获取有效的 access_token
    const accessToken = await getAccessToken()

    // 使用 HTTP 方式发送订阅消息
    const result = await sendSubscribeMessageHttp(accessToken, user.openId, data)

    if (result.errcode === 0) {
      console.log('[push] 发送成功，用户:', user._id || user.openId)
      return { success: true, userId: user._id }
    }

    // 处理错误码
    const errorInfo = parseWxError(result.errcode, result.errmsg)
    console.error('[push] 发送失败:', errorInfo.message)

    return { 
      success: false, 
      userId: user._id, 
      error: errorInfo.message,
      errcode: result.errcode,
      needPermission: errorInfo.needPermission
    }

  } catch (err) {
    console.error('[push] 发送异常:', err.message)
    return handleSendError(user._id, err)
  }
}

/**
 * 解析微信错误码
 */
function parseWxError(errcode, errmsg) {
  const errorMessages = {
    40001: { message: 'access_token 无效', needPermission: false },
    40003: { message: '用户 openId 无效', needPermission: false },
    43101: { message: '用户拒绝接收消息', needPermission: false },
    48002: { message: '订阅消息权限未开通', needPermission: true },
    48004: { message: '模板 ID 不正确', needPermission: false },
    40014: { message: '不合法的 access_token', needPermission: false }
  }

  const info = errorMessages[errcode] || { message: errmsg || '未知错误', needPermission: false }
  return info
}

/**
 * 处理发送错误
 */
function handleSendError(userId, err) {
  const errMsg = err.message || ''

  return {
    success: false,
    userId,
    error: errMsg
  }
}

/**
 * 获取当前日期
 */
function getTodayDate() {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * 随机获取温馨提示文案
 */
function getRandomMessage() {
  const index = Math.floor(Math.random() * PUSH_MESSAGES.length)
  return PUSH_MESSAGES[index]
}

/**
 * 云函数入口
 */
exports.main = async (event, context) => {
  console.log('========== 定时推送任务开始 ==========')
  console.log('触发时间:', new Date().toLocaleString('zh-CN'))

  const results = {
    total: 0,
    success: 0,
    failed: 0,
    errors: []
  }

  // 检查 AppSecret 是否已配置
  if (APPSECRET === 'YOUR_APPSECRET' || !APPSECRET) {
    console.error('[push] ⚠️ 错误: 请先配置 AppSecret!')
    return {
      success: false,
      message: '请在云函数代码中配置 AppSecret',
      needConfig: true
    }
  }

  try {
    // 获取所有订阅用户
    const { data: subscribers } = await db.collection('subscriptions')
      .where({ subscribed: true })
      .field({
        openId: true,
        city: true,
        pushTime: true
      })
      .get()

    results.total = subscribers.length
    console.log(`[push] 找到 ${subscribers.length} 个订阅用户`)

    if (subscribers.length === 0) {
      console.log('[push] 没有订阅用户，任务结束')
      return { success: true, message: '没有订阅用户', results }
    }

    // 预热 access_token
    console.log('[push] 初始化 access_token...')
    await getAccessToken()

    // 遍历每个用户发送消息
    for (const subscriber of subscribers) {
      try {
        console.log(`[push] 正在向用户 ${subscriber._id} 发送天气推送...`)
        const sendResult = await sendSubscribeMessage(subscriber)

        if (sendResult.success) {
          results.success++
        } else {
          results.failed++
          results.errors.push({
            userId: sendResult.userId,
            error: sendResult.error,
            errcode: sendResult.errcode,
            needPermission: sendResult.needPermission
          })
        }
      } catch (err) {
        results.failed++
        results.errors.push(`用户 ${subscriber._id}: ${err.message}`)
        console.error(`[push] 处理用户 ${subscriber._id} 失败:`, err)
      }

      // 避免触发频率限制
      await new Promise(resolve => setTimeout(resolve, 200))
    }

  } catch (err) {
    console.error('[push] 定时推送任务执行失败:', err)
    return {
      success: false,
      message: '任务执行失败',
      error: err.message,
      results
    }
  }

  console.log('========== 定时推送任务结束 ==========')
  console.log(`结果: 成功 ${results.success}/${results.total}`)

  if (results.errors.some(e => e.needPermission)) {
    console.log('[push] ⚠️ 提示: 请在微信公众平台开通订阅消息权限')
  }

  return {
    success: true,
    message: `推送完成: 成功 ${results.success}, 失败 ${results.failed}`,
    results
  }
}