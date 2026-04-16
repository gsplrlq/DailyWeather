const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

/**
 * 获取用户订阅状态
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
    const { data } = await db.collection('subscriptions')
      .where({ openId: openId })
      .get()
    
    if (data && data.length > 0) {
      return {
        success: true,
        data: data[0]
      }
    }
    
    return {
      success: false,
      message: '未找到订阅记录'
    }
  } catch (err) {
    console.error('[getSubscription] Error:', err)
    return {
      success: false,
      message: '查询失败: ' + err.message,
      error: err
    }
  }
}