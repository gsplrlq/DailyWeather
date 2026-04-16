const express = require('express')
const axios = require('axios')

const app = express()
app.use(express.json())

// 从配置文件加载密钥
const config = require('@/config/config.json')
const APPID = config.WECHAT_APP_ID
const APPSECRET = config.WECHAT_APP_SECRET
const TEMPLATE_ID = config.TEMPLATE_ID

// access_token 缓存
let cachedAccessToken = null
let tokenExpireTime = 0

/**
 * 获取微信 access_token
 */
async function getAccessToken() {
  const now = Date.now()

  if (cachedAccessToken && now < tokenExpireTime - 300000) {
    console.log('[token] 使用缓存')
    return cachedAccessToken
  }

  try {
    console.log('[token] 获取新 token...')
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`
    const res = await axios.get(url)
    const data = res.data

    if (data.access_token) {
      cachedAccessToken = data.access_token
      tokenExpireTime = now + (data.expires_in || 7200) * 1000
      console.log('[token] 获取成功')
      return cachedAccessToken
    }

    throw new Error(data.errmsg || '获取 token 失败')
  } catch (err) {
    console.error('[token] 获取失败:', err.message)
    throw err
  }
}

/**
 * 发送订阅消息
 */
async function sendSubscribeMessage(openId, data) {
  const accessToken = await getAccessToken()
  const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`

  const payload = {
    touser: openId,
    template_id: TEMPLATE_ID,
    page: 'pages/index/index',
    data: {
      date1: { value: data.date },
      thing5: { value: data.message }
    },
    miniprogram_state: 'formal'
  }

  const res = await axios.post(url, payload)
  const result = res.data

  if (result.errcode === 0) {
    return { success: true }
  }

  return { success: false, error: result.errmsg, errcode: result.errcode }
}

/**
 * 健康检查
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

/**
 * 发送推送消息
 * POST /push
 * Body: { openId: string, date: string, message: string }
 */
app.post('/push', async (req, res) => {
  const { openId, date, message } = req.body

  if (!openId) {
    return res.status(400).json({ success: false, error: '缺少 openId' })
  }

  try {
    console.log(`[push] 发送给: ${openId}`)
    const result = await sendSubscribeMessage(openId, {
      date: date || new Date().toLocaleDateString('zh-CN'),
      message: message || '☀️ 点击查看今日天气，开启美好一天！'
    })

    if (result.success) {
      res.json({ success: true, message: '发送成功' })
    } else {
      res.json({ success: false, error: result.error, errcode: result.errcode })
    }
  } catch (err) {
    console.error('[push] 发送失败:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * 批量推送
 * POST /batch-push
 * Body: { users: [{ openId, city }] }
 */
app.post('/batch-push', async (req, res) => {
  const { users } = req.body

  if (!users || users.length === 0) {
    return res.json({ success: true, message: '没有用户' })
  }

  const results = {
    total: users.length,
    success: 0,
    failed: 0,
    errors: []
  }

  const PUSH_MESSAGES = [
    '☀️ 点击查看今日天气，开启美好一天！',
    '🌤️ 今日天气已更新，快来看看吧~',
    '🌈 新的一天，点击查看天气情况！',
    '🌧️ 天气变化早知道，点击查看~',
    '❄️ 今日天气提醒，点击了解详情！'
  ]

  const getRandomMessage = () => PUSH_MESSAGES[Math.floor(Math.random() * PUSH_MESSAGES.length)]
  const getTodayDate = () => new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })

  for (const user of users) {
    try {
      const result = await sendSubscribeMessage(user.openId, {
        date: getTodayDate(),
        message: getRandomMessage()
      })

      if (result.success) {
        results.success++
      } else {
        results.failed++
        results.errors.push({ openId: user.openId, error: result.error })
      }
    } catch (err) {
      results.failed++
      results.errors.push({ openId: user.openId, error: err.message })
    }

    // 避免频率限制
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  console.log(`[batch] 完成: 成功 ${results.success}/${results.total}`)
  res.json({ success: true, results })
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`[server] 云托管服务启动，端口: ${PORT}`)
  console.log(`[server] 健康检查: /health`)
  console.log(`[server] 推送接口: /push`)
  console.log(`[server] 批量推送: /batch-push`)
})

module.exports = app
