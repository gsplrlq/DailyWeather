const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

/**
 * 取消用户订阅状态
 */
exports.main = async (event, context) => {
  const openId = cloud.getWXContext().OPENID

  if (!openId) {
    return {
      success: false,
      message: '无法获取用户身份'
    }
  }

  try {
    // 查询并更新订阅状态
    const { data: existing } = await db.collection('subscriptions')
      .where({ openId: openId })
      .get()

    if (existing && existing.length > 0) {
      // 更新为取消订阅状态
      await db.collection('subscriptions').doc(existing[0]._id).update({
        data: {
          subscribed: false,
          unsubscribeTime: new Date(),
          lastUpdateTime: new Date()
        }
      })

      console.log('[cancelSubscription] Canceled:', openId)

      return {
        success: true,
        message: '取消订阅成功'
      }
    }

    return {
      success: false,
      message: '未找到订阅记录'
    }
  } catch (err) {
    console.error('[cancelSubscription] Error:', err)
    return {
      success: false,
      message: '取消订阅失败: ' + err.message,
      error: err
    }
  }
}
