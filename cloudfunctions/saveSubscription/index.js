const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

/**
 * 保存用户订阅状态
 */
exports.main = async (event, context) => {
  const { pushTime = '08:00', city = '' } = event
  
  // 获取用户的 openId（由微信自动注入）
  const openId = cloud.getWXContext().OPENID
  
  if (!openId) {
    return {
      success: false,
      message: '无法获取用户身份'
    }
  }
  
  const now = new Date()
  
  try {
    // 先查询是否已存在
    const { data: existing } = await db.collection('subscriptions')
      .where({ openId: openId })
      .get()
    
    if (existing && existing.length > 0) {
      // 更新
      await db.collection('subscriptions').doc(existing[0]._id).update({
        data: {
          subscribed: true,
          pushTime: pushTime,
          city: city,
          lastUpdateTime: now,
          lastSubscribeTime: now
        }
      })
      
      console.log('[saveSubscription] Updated:', openId)
      
      return {
        success: true,
        message: '订阅状态已更新',
        data: { ...existing[0], pushTime, city }
      }
    } else {
      // 新增
      const res = await db.collection('subscriptions').add({
        data: {
          openId: openId,
          subscribed: true,
          pushTime: pushTime,
          city: city,
          createTime: now,
          lastUpdateTime: now,
          lastSubscribeTime: now
        }
      })
      
      console.log('[saveSubscription] Created:', openId, res._id)
      
      return {
        success: true,
        message: '订阅成功',
        data: { _id: res._id, openId, pushTime, city, subscribed: true }
      }
    }
  } catch (err) {
    console.error('[saveSubscription] Error:', err)
    return {
      success: false,
      message: '保存失败: ' + err.message,
      error: err
    }
  }
}
