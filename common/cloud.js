/**
 * 云开发统一封装
 * 支持云函数和前端两种环境自动适配
 */

// 根据环境选择不同的 SDK
let cloud = null
let isCloudEnv = false

try {
  // 云函数环境
  cloud = require('wx-server-sdk')
  cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV,
    traceUser: true
  })
  isCloudEnv = true
} catch (e) {
  // 前端环境
  if (typeof wx !== 'undefined' && wx.cloud) {
    cloud = wx.cloud
    isCloudEnv = false
  }
}

/**
 * 获取数据库集合
 * @param {string} collectionName - 集合名称
 */
function getDB(collectionName) {
  if (isCloudEnv) {
    return cloud.database().collection(collectionName)
  } else {
    return cloud.database().collection(collectionName)
  }
}

// 云函数环境专用 - 数据库操作
const db = {
  add(collection, data) {
    return cloud.database().collection(collection).add({ data })
  },
  get(collection, where, options = {}) {
    const query = cloud.database().collection(collection)
    if (where) query = query.where(where)
    if (options.fields) query = query.field(options.fields)
    if (options.limit) query = query.limit(options.limit)
    if (options.skip) query = query.skip(options.skip)
    if (options.orderBy) query = query.orderBy(options.orderBy.field, options.orderBy.order)
    return query.get()
  },
  getById(collection, id) {
    return cloud.database().collection(collection).doc(id).get()
  },
  update(collection, id, data) {
    return cloud.database().collection(collection).doc(id).update({ data })
  },
  remove(collection, id) {
    return cloud.database().collection(collection).doc(id).remove()
  },
  count(collection, where) {
    const query = cloud.database().collection(collection)
    if (where) query = query.where(where)
    return query.count()
  }
}

// 云函数调用
const cloudFunction = {
  call(name, data = {}) {
    if (isCloudEnv) {
      return cloud.callFunction({ name, data })
    } else {
      return wx.cloud.callFunction({ name, data })
    }
  },
  async callWithError(name, data = {}) {
    try {
      const res = isCloudEnv
        ? await cloud.callFunction({ name, data })
        : await wx.cloud.callFunction({ name, data })
      return { success: true, data: res.result }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }
}

// 云存储操作
const storage = {
  async uploadFile(filePath, cloudPath) {
    try {
      const result = isCloudEnv
        ? await cloud.uploadFile({ cloudPath, filePath })
        : await wx.cloud.uploadFile({ cloudPath, filePath })
      return { success: true, fileID: result.fileID }
    } catch (err) {
      return { success: false, error: err.message }
    }
  },
  async deleteFile(fileID) {
    try {
      if (isCloudEnv) {
        await cloud.deleteFile({ fileList: [fileID] })
      } else {
        await wx.cloud.deleteFile({ fileList: [fileID] })
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }
}

// 获取当前环境信息
function getEnvInfo() {
  return {
    isCloudEnv,
    version: '1.0.0'
  }
}

// 默认导出
export default {
  cloud,
  getDB,
  db,
  cloudFunction,
  storage,
  getEnvInfo,

  // 便捷方法
  getDatabase: getDB,
  call: cloudFunction.call,
  callWithError: cloudFunction.callWithError
}

export { cloud, getDB, db, cloudFunction, storage, getEnvInfo }