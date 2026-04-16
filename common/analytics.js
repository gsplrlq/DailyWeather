/**
 * ������ģ�� - ��¼�û���Ϊ�����ش洢
 * ����ͳ�Ʒ����û�ʹ�����
 */

// �洢����
const STORAGE_KEY = 'weather_analytics'

// ���洢����
const MAX_EVENTS = 500

/**
 * ��ȡ�����¼���¼
 * @returns {Array} �¼��б�
 */
function getEvents() {
  try {
    const data = uni.getStorageSync(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('Get analytics events failed:', e)
    return []
  }
}

/**
 * �����¼��б�
 * @param {Array} events �¼��б�
 */
function saveEvents(events) {
  try {
    // �����������������������µ�
    if (events.length > MAX_EVENTS) {
      events = events.slice(-MAX_EVENTS)
    }
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(events))
  } catch (e) {
    console.error('Save analytics events failed:', e)
  }
}

/**
 * ��¼�¼�
 * @param {string} eventName �¼�����
 * @param {Object} params �¼�����
 */
export function trackEvent(eventName, params = {}) {
  const event = {
    event: eventName,
    params: params,
    timestamp: Date.now(),
    date: formatDate(new Date())
  }
  const events = getEvents()
  events.push(event)
  saveEvents(events)
  console.log('[Analytics]', eventName, params)
}

/**
 * ��¼ҳ�����
 * @param {string} pageName ҳ������
 */
export function trackPage(pageName) {
  trackEvent('page_view', { page: pageName })
}

/**
 * ��¼��ť���
 * @param {string} btnName ��ť����
 * @param {string} page ����ҳ��
 */
export function trackClick(btnName, page = 'index') {
  trackEvent('click', { btn: btnName, page: page })
}

/**
 * ��¼�������سɹ�
 * @param {Object} weatherData ��������
 */
export function trackWeatherLoaded(weatherData) {
  trackEvent('weather_loaded', {
    city: weatherData.cityName,
    temp: weatherData.temperature,
    desc: weatherData.description
  })
}

/**
 * ��¼��������ʧ��
 * @param {string} errorMsg ������Ϣ
 */
export function trackWeatherError(errorMsg) {
  trackEvent('weather_error', { error: errorMsg })
}

/**
 * ��¼�����л�
 * @param {string} fromLang ԭ����
 * @param {string} toLang Ŀ������
 */
export function trackLanguageSwitch(fromLang, toLang) {
  trackEvent('language_switch', { from: fromLang, to: toLang })
}

/**
 * ��¼���Ĳ���
 * @param {string} action �������� click/success/fail
 */
export function trackSubscribe(action) {
  trackEvent('subscribe_' + action, {})
}

/**
 * ��ʽ������
 * @param {Date} date ���ڶ���
 * @returns {string} YYYY-MM-DD ��ʽ
 */
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * ��ȡ����ͳ��ժҪ
 * @returns {Object} ͳ��ժҪ
 */
export function getAnalyticsSummary() {
  const events = getEvents()
  const summary = {
    totalEvents: events.length,
    byEvent: {},
    byDate: {}
  }

  events.forEach(e => {
    // ���¼�����ͳ��
    if (!summary.byEvent[e.event]) {
      summary.byEvent[e.event] = 0
    }
    summary.byEvent[e.event]++

    // ������ͳ��
    if (!summary.byDate[e.date]) {
      summary.byDate[e.date] = 0
    }
    summary.byDate[e.date]++
  })

  return summary
}

/**
 * ��������������
 */
export function clearAnalytics() {
  try {
    uni.removeStorageSync(STORAGE_KEY)
    console.log('[Analytics] Data cleared')
  } catch (e) {
    console.error('Clear analytics failed:', e)
  }
}

/**
 * ����������ݣ����ڵ��ԣ�
 * @returns {Array} �¼��б�
 */
export function exportAnalytics() {
  return getEvents()
}

// �����¼����Ƴ���
export const EVENT_NAMES = {
  PAGE_VIEW: 'page_view',
  WEATHER_LOADED: 'weather_loaded',
  WEATHER_ERROR: 'weather_error',
  LANGUAGE_SWITCH: 'language_switch',
  REFRESH: 'refresh',
  SUBSCRIBE_CLICK: 'subscribe_click',
  SUBSCRIBE_SUCCESS: 'subscribe_success',
  SUBSCRIBE_FAIL: 'subscribe_fail'
}