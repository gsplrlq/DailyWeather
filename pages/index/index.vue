<template>
  <view class="weather-page" :style="gradientStyle">
    <!-- Top Section -->
    <view class="top-section">
      <view class="date-location">
        <text class="date-icon">&#x1F4C5;</text>
        <text class="date-text">{{ formattedDate }}</text>
        <text class="location-icon">&#x1F4CD;</text>
        <text class="city-name">{{ weatherData?.cityName || t('common.loading') }}</text>
      </view>
      <view class="actions">
        <!-- Language Switch -->
        <view class="action-btn lang-btn" @tap="switchLanguage">
          <text class="btn-icon">&#x1F310;</text>
          <text class="btn-text">{{ currentLangName }}</text>
        </view>
        <!-- Refresh Button -->
        <view class="action-btn refresh-btn" @tap="refreshWeather">
          <text class="btn-icon" :class="{ spinning: loading }">&#x1F504;</text>
          <text class="btn-text">{{ t('common.refresh') }}</text>
        </view>
      </view>
    </view>

    <!-- Weather Icon with Animation -->
    <view class="weather-icon-wrapper">
      <view class="weather-icon-main" :class="weatherIconClass">
        <text class="weather-icon-emoji">{{ currentWeatherEmoji }}</text>
      </view>
      <!-- Floating decorations -->
      <view class="decoration decoration-1">*</view>
      <view class="decoration decoration-2">&#x2728;</view>
      <view class="decoration decoration-3">&#x2728;</view>
    </view>

    <!-- Temperature -->
    <view class="temperature-section">
      <view class="temperature-bubble">
        <text class="temperature-value">{{ Math.round(weatherData?.temperature || 0) }}</text>
        <text class="temperature-unit">&#x2103;</text>
      </view>
    </view>

    <!-- Description -->
    <view class="description-section">
      <text class="description-icon">&#x2728;</text>
      <text class="description-text">{{ weatherData?.friendlyDescription || t('common.loading') }}</text>
    </view>

    <!-- Cute Message -->
    <view class="cute-message-card">
      <text class="cute-icon">&#x1F4A4;</text>
      <text class="cute-text">{{ weatherData?.cuteMessage || t('default.checkWeather') }}</text>
    </view>

    <!-- Weather Details -->
    <view class="details-card">
      <view class="detail-item">
        <text class="detail-icon">&#x1F321;</text>
        <text class="detail-label">{{ t('weather.feelsLike') }}</text>
        <text class="detail-value">{{ Math.round(weatherData?.feelsLike || 0) }}&#x00B0;</text>
      </view>
      <view class="detail-separator">
        <text class="separator-dot">&#x2022;</text>
      </view>
      <view class="detail-item">
        <text class="detail-icon">&#x1F4A7;</text>
        <text class="detail-label">{{ t('weather.humidity') }}</text>
        <text class="detail-value">{{ weatherData?.humidity || 0 }}%</text>
      </view>
      <view class="detail-separator">
        <text class="separator-dot">&#x2022;</text>
      </view>
      <view class="detail-item">
        <text class="detail-icon">&#x1F32C;</text>
        <text class="detail-label">{{ t('weather.wind') }}</text>
        <text class="detail-value">{{ weatherData?.windSpeed || 0 }} m/s</text>
      </view>
      <view class="detail-separator">
        <text class="separator-dot">&#x2022;</text>
      </view>
      <view class="detail-item">
        <text class="detail-icon">{{ weatherData?.pollenLevel === 'high' ? '😷' : weatherData?.pollenLevel === 'medium' ? '🤧' : '🌸' }}</text>
        <text class="detail-label">花粉</text>
        <text class="detail-value">{{ weatherData?.pollenLevelText?.split(' ')[1] || '低' }}</text>
      </view>
    </view>

    <!-- Weather Image Card -->
    <view class="weather-image-card" v-if="dailyWeatherImageUrl && !imageLoadFailed">
      <view class="image-header">
        <text class="image-icon">🐕</text>
        <text class="image-title">今日天气萌犬</text>
      </view>
      <view class="image-wrapper">
        <image
          class="weather-image"
          :src="dailyWeatherImageUrl"
          mode="aspectFit"
          @error="onImageError"
          @load="onImageLoad"
        />
      </view>
      <view class="image-prompt" v-if="dailyWeatherImagePrompt">
        <text class="prompt-text">提示词：{{ dailyWeatherImagePrompt }}</text>
      </view>
      <view class="image-date" v-if="dailyWeatherImageDate">
        <text class="date-text-small">更新于：{{ dailyWeatherImageDate }}</text>
      </view>
    </view>

    <!-- 图片加载失败或没有每日图片时显示备用图片 -->
    <view class="weather-image-card" v-else-if="!dailyWeatherImageUrl && weatherData?.weatherImageUrl">
      <view class="image-header">
        <text class="image-icon">🐕</text>
        <text class="image-title">今日天气萌犬</text>
      </view>
      <view class="image-wrapper">
        <image
          class="weather-image"
          :src="weatherData.weatherImageUrl"
          mode="aspectFit"
          @error="onBackupImageError"
        />
      </view>
    </view>

    <!-- Clothing Advice -->
    <view class="clothing-card">
      <view class="clothing-header">
        <text class="clothing-icon">&#x1F457;</text>
        <text class="clothing-title">{{ t('weather.outfitTip') }}</text>
      </view>
      <text class="clothing-text">{{ weatherData?.clothingAdvice || t('default.checkWeather') }}</text>
    </view>

    <!-- Subscribe Section -->
    <view class="subscribe-card">
      <view class="subscribe-info">
        <text class="subscribe-icon">🤔</text>
        <view class="subscribe-text-wrapper">
          <text class="subscribe-title">{{ t('default.todayWeather') }}</text>
          <text class="subscribe-desc">{{ t('default.subscribeDesc') }}</text>
        </view>
      </view>
      <view class="subscribe-btn-wrapper">
        <button
          v-if="!isSubscribed"
          class="subscribe-btn"
          @tap="handleSubscribe"
        >
          ✨ {{ t('push.subscribe') }}
        </button>
        <view v-else class="subscribed-wrapper">
          <view class="subscribed-badge" @tap="handleUnsubscribe">
            ✅ {{ t('push.subscribed') }}
          </view>
<!--          <view class="action-buttons">
            <button class="test-push-btn" @tap="handleTestPush">
              📤 {{ t('push.testPush') }}
            </button>
            <button class="unsubscribe-btn" @tap="handleUnsubscribe">
              {{ t('push.unsubscribe') }}
            </button>
          </view> -->
        </view>
      </view>
    </view>

    <!-- Error Message -->
    <view v-if="errorMsg" class="error-card">
      <text class="error-icon">&#x1F625;</text>
      <text class="error-text">{{ errorMsg }}</text>
      <button class="retry-btn" @tap="refreshWeather">{{ t('common.retry') }}</button>
    </view>
  </view>
</template>

<script>
import weatherService from '../../common/weatherService.js'
import weatherImageService from '../../common/weatherImageService.js'
import i18n from '../../i18n/index.js'
import { trackPage, trackClick, trackWeatherLoaded, trackWeatherError, trackLanguageSwitch } from '../../common/analytics.js'
import { requestSubscription, getSubscribeStatus, trackSubscribe, unsubscribeAsync, sendTestPush } from '../../common/pushService.js'

export default {
  data() {
    return {
      weatherData: null,
      dailyWeatherImages: null,  // 从数据库获取的4张图片
      dailyWeatherImageUrl: '',  // 当前天气对应的图片URL
      dailyWeatherImagePrompt: '', // 当前图片的提示词
      loading: false,
      errorMsg: '',
      currentLocale: 'zh',
      isSubscribed: false,
      imageLoadFailed: false
    }
  },
  computed: {
    formattedDate() {
      if (!this.weatherData) return ''
      return this.weatherData.formattedDate
    },
    gradientStyle() {
      if (!this.weatherData) {
        return {
          background: 'linear-gradient(135deg, #FFB6C1 0%, #FFA07A 50%, #FFD700 100%)'
        }
      }
      const bg = this.weatherData.backgroundStyle
      return {
        background: `linear-gradient(135deg, ${bg.start} 0%, ${bg.end} 100%)`
      }
    },
    currentLangName() {
      return i18n.getCurrentLocale() === 'zh' ? '中文' : 'EN'
    },
    // Get weather emoji by icon code
    currentWeatherEmoji() {
      const iconMap = {
        '01d': '\u2600\uFE0F',  // sunny
        '01n': '\uD83C\uDF19',  // moon
        '02d': '\u26C5',         // cloudy
        '02n': '\u26C5',
        '03d': '\u2601\uFE0F',   // overcast
        '03n': '\u2601\uFE0F',
        '04d': '\u2601\uFE0F',
        '04n': '\u2601\uFE0F',
        '09d': '\uD83C\uDF27\uFE0F',  // light rain
        '09n': '\uD83C\uDF27\uFE0F',
        '10d': '\uD83C\uDF26\uFE0F',  // heavy rain
        '10n': '\uD83C\uDF26\uFE0F',
        '11d': '\u26C8\uFE0F',   // thunder
        '11n': '\u26C8\uFE0F',
        '13d': '\u2744\uFE0F',   // snow
        '13n': '\u2744\uFE0F',
        '50d': '\uD83C\uDF2B\uFE0F',  // fog
        '50n': '\uD83C\uDF2B\uFE0F'
      }
      return iconMap[this.weatherData?.iconCode] || '\u2600\uFE0F'
    },
    // Weather icon animation class
    weatherIconClass() {
      const iconCode = this.weatherData?.iconCode || '01d'
      if (iconCode.startsWith('01')) return 'icon-sunny'
      if (iconCode.startsWith('09') || iconCode.startsWith('10')) return 'icon-rainy'
      if (iconCode.startsWith('13')) return 'icon-snowy'
      return 'icon-cloudy'
    },
    // 从数据库获取的天气图片
    dailyWeatherImage() {
      if (!this.dailyWeatherImages || !this.weatherData) return null
      const weatherType = this.getWeatherType(this.weatherData.iconCode)
      const typeMap = {
        sunny: 'sunny',
        cloudy: 'cloudy',
        rainy: 'rainy',
        snowy: 'snowy'
      }
      return this.dailyWeatherImages[typeMap[weatherType]] || null
    },
    // 当前天气对应的图片URL（计算属性）
    dailyWeatherImageUrl() {
      return this.dailyWeatherImage || ''
    },
    // 当前图片提示词（从天气数据中获取）
    dailyWeatherImagePrompt() {
      return this.weatherData?.weatherImagePrompt || ''
    },
    // 图片更新日期
    dailyWeatherImageDate() {
      if (!this.weatherData) return ''
      return this.weatherData.formattedDate
    }
  },
  onLoad() {
    this.currentLocale = i18n.getCurrentLocale()
    // ????????????
    trackPage('index')
    // ???F????
    this.checkSubscribeStatus()
    this.loadWeather()
  },
  onShow() {
    // ?????????????F????
    this.checkSubscribeStatus()
  },
  onPullDownRefresh() {
    this.refreshWeather()
  },
  methods: {
    // 获取天气类型
    getWeatherType(iconCode) {
      if (iconCode === '01d' || iconCode === '01n') return 'sunny'
      if (iconCode.startsWith('09') || iconCode.startsWith('10')) return 'rainy'
      if (iconCode.startsWith('13')) return 'snowy'
      return 'cloudy'
    },

    // 从云数据库加载每日天气图片
    async loadDailyWeatherImages() {
      try {
        const result = await weatherImageService.getDailyWeatherImages()
        if (result.success) {
          this.dailyWeatherImages = result.images
          console.log('✅ 加载每日天气图片成功:', result.images)
        } else {
          console.warn('⚠️ 今日图片尚未生成:', result.message)
          this.dailyWeatherImages = null
        }
      } catch (error) {
        console.error('❌ 加载每日天气图片失败:', error)
        this.dailyWeatherImages = null
      }
    },

    // ???F????
    checkSubscribeStatus() {
      const status = getSubscribeStatus()
      this.isSubscribed = status.subscribed
    },
    // Translation method
    t(key) {
      return i18n.t(key)
    },
    // Language switch
    switchLanguage() {
      const oldLocale = this.currentLocale
      const newLocale = this.currentLocale === 'zh' ? 'en' : 'zh'
      i18n.switchLocale(newLocale)
      this.currentLocale = newLocale
      // ??????????????
      trackLanguageSwitch(oldLocale, newLocale)
      // Refresh weather data to update translations
      if (this.weatherData) {
        this.refreshWeather()
      }
    },
    async handleSubscribe() {
      trackClick('subscribe', 'index')
      trackSubscribe('click')
      try {
        const result = await requestSubscription()
        if (result.success) {
          trackSubscribe('success')
          this.isSubscribed = true
          uni.showToast({
            title: i18n.t('push.success'),
            icon: 'success'
          })
        } else {
          trackSubscribe('fail')
          uni.showToast({
            title: result.message,
            icon: 'none'
          })
        }
      } catch (e) {
        trackSubscribe('fail')
        uni.showToast({
          title: i18n.t('push.fail'),
          icon: 'none'
        })
      }
    },
    async handleUnsubscribe() {
      uni.showModal({
        title: this.t('push.unsubscribe'),
        content: this.t('push.confirmUnsubscribe'),
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await unsubscribeAsync()
              if (result.success) {
                this.isSubscribed = false
                uni.showToast({
                  title: this.t('push.unsubscribedSuccess'),
                  icon: 'success'
                })
              } else {
                uni.showToast({
                  title: this.t('push.unsubscribedFailed'),
                  icon: 'none'
                })
              }
            } catch (e) {
              uni.showToast({
                title: this.t('push.unsubscribedFailed'),
                icon: 'none'
              })
            }
          }
        }
      })
    },
    async handleTestPush() {
      if (!this.isSubscribed) {
        uni.showToast({
          title: this.t('push.notSubscribed'),
          icon: 'none'
        })
        return
      }

      if (!this.weatherData) {
        uni.showToast({
          title: '请先加载天气数据',
          icon: 'none'
        })
        return
      }

      uni.showLoading({ title: this.t('push.sending') })
      try {
        const result = await sendTestPush(this.weatherData)
        console.log('[Index] Test push result:', result)
        if (result.success) {
          uni.showToast({
            title: this.t('push.testSuccess'),
            icon: 'success'
          })
        } else {
          // 显示详细错误信息
          uni.showModal({
            title: '推送失败',
            content: result.message || this.t('push.testFailed'),
            showCancel: false
          })
        }
      } catch (e) {
        console.error('[Index] Test push error:', e)
        uni.showModal({
          title: '推送失败',
          content: e.message || this.t('push.testFailed'),
          showCancel: false
        })
      } finally {
        uni.hideLoading()
      }
    },
    async loadWeather() {
      this.loading = true
      this.errorMsg = ''
      try {
        const data = await weatherService.getCurrentWeather()
        this.weatherData = data
        trackWeatherLoaded(data)
        // 天气数据加载后，加载对应的每日天气图片
        await this.loadDailyWeatherImages()
      } catch (error) {
        console.error('Load weather error:', error)
        trackWeatherError(error.message || 'Unknown error')
        this.errorMsg = this.t('common.failedToLoad')
      } finally {
        this.loading = false
      }
    },
    async refreshWeather() {
      if (this.loading) return
      trackClick('refresh', 'index')
      uni.showLoading({ title: i18n.t('common.loading') })
      try {
        const data = await weatherService.refreshWeather()
        this.weatherData = data
        this.errorMsg = ''
        this.imageLoadFailed = false
        // 刷新天气后重新加载每日天气图片
        await this.loadDailyWeatherImages()
      } catch (error) {
        console.error('Refresh weather error:', error)
        this.errorMsg = this.t('common.failedToRefresh')
      } finally {
        uni.hideLoading()
        uni.stopPullDownRefresh()
      }
    },
    onImageError() {
      this.imageLoadFailed = true
      console.log('Weather image failed to load')
    }
  }
}
</script>

<style lang="scss" scoped>
/* ?????????? - ???????? */
.weather-page {
  min-height: 100vh;
  padding: 80rpx 40rpx 40rpx;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

/* ???????? - ????????? */
.top-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  margin-top: 20rpx;
  margin-bottom: 20rpx;
}

.date-location {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 20rpx;
}

.date-icon, .location-icon {
  font-size: 28rpx;
  margin-right: 10rpx;
}

.date-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.95);
  margin-right: 30rpx;
  background: rgba(255, 255, 255, 0.2);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

.city-name {
  font-size: 38rpx;
  font-weight: bold;
  color: white;
  text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

/* ??????????? */
.actions {
  display: flex;
  gap: 16rpx;
  margin-top: 10rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  padding: 12rpx 24rpx;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 30rpx;
  backdrop-filter: blur(10px);
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.action-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.35);
}

.btn-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.btn-text {
  font-size: 24rpx;
  color: white;
  font-weight: 500;
}

/* ??????????? - ????????? */
.weather-icon-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30rpx 0;
}

/* Logo样式 */
.weather-logo {
  width: 120rpx;
  height: 120rpx;
  position: absolute;
  top: -60rpx;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.weather-icon-main {
  font-size: 160rpx;
  text-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 2;
}

/* ????????? */
.icon-sunny {
  animation: float 3s ease-in-out infinite;
}

.icon-rainy {
  animation: rainBounce 2s ease-in-out infinite;
}

.icon-snowy {
  animation: snowFloat 4s ease-in-out infinite;
}

.icon-cloudy {
  animation: cloudDrift 5s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15rpx); }
}

@keyframes rainBounce {
  0%, 100% { transform: translateY(0) rotate(0); }
  25% { transform: translateY(-8rpx) rotate(-3deg); }
  75% { transform: translateY(-8rpx) rotate(3deg); }
}

@keyframes snowFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10rpx) rotate(180deg); }
}

@keyframes cloudDrift {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(10rpx); }
}

/* ??????? */
.decoration {
  position: absolute;
  font-size: 40rpx;
  opacity: 0.6;
  animation: sparkle 2s ease-in-out infinite;
}

.decoration-1 {
  top: 0;
  left: 20%;
  animation-delay: 0s;
}

.decoration-2 {
  top: 30%;
  right: 15%;
  animation-delay: 0.5s;
}

.decoration-3 {
  bottom: 10%;
  left: 30%;
  animation-delay: 1s;
}

@keyframes sparkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 0.8; transform: scale(1.2); }
}

/* ??????? */
.temperature-section {
  display: flex;
  justify-content: center;
  margin: 20rpx 0;
}

.temperature-bubble {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 40rpx;
  padding: 30rpx 60rpx;
  display: flex;
  align-items: flex-start;
  backdrop-filter: blur(15px);
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
}

.temperature-value {
  font-size: 160rpx;
  font-weight: 200;
  color: white;
  line-height: 1;
  text-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.15);
}

.temperature-unit {
  font-size: 50rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 25rpx;
}

/* ???????? */
.description-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 25rpx 0;
}

.description-icon {
  font-size: 32rpx;
  margin-right: 15rpx;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.description-text {
  font-size: 42rpx;
  color: white;
  font-weight: 600;
  text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

/* ????????? */
.cute-message-card {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 35rpx 20rpx;
  padding: 30rpx 40rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 35rpx;
  backdrop-filter: blur(10px);
  box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.1);
}

.cute-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.cute-text {
  font-size: 30rpx;
  color: white;
  text-align: center;
  line-height: 1.5;
}

/* ????????? */
.details-card {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 35rpx;
  padding: 25rpx 10rpx;
  margin: 40rpx 0;
  backdrop-filter: blur(15px);
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 140rpx;
}

.detail-icon {
  font-size: 36rpx;
  margin-bottom: 10rpx;
}

.detail-label {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 6rpx;
}

.detail-value {
  font-size: 32rpx;
  color: white;
  font-weight: bold;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.detail-separator {
  padding: 0 5rpx;
}

.separator-dot {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.4);
}

/* ???????? */
.clothing-card {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 35rpx;
  padding: 30rpx 35rpx;
  margin-top: 30rpx;
  backdrop-filter: blur(10px);
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.1);
}

.clothing-header {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.clothing-icon {
  font-size: 36rpx;
  margin-right: 15rpx;
}

.clothing-title {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.95);
  font-weight: bold;
}

.clothing-text {
  font-size: 28rpx;
  color: white;
  line-height: 1.5;
}

/* Subscribe card */
.subscribe-card {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 35rpx;
  padding: 30rpx 35rpx;
  margin-top: 30rpx;
  backdrop-filter: blur(10px);
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Pollen Card */
.pollen-card {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 35rpx;
  padding: 30rpx 35rpx;
  margin-top: 30rpx;
  backdrop-filter: blur(10px);
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.1);
}

.pollen-header {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.pollen-icon {
  font-size: 36rpx;
  margin-right: 15rpx;
}

.pollen-title {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.95);
  font-weight: bold;
}

.pollen-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.pollen-level {
  font-size: 36rpx;
  color: white;
  font-weight: bold;
}

.pollen-advice {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* Weather Image Card */
.weather-image-card {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 35rpx;
  padding: 30rpx 35rpx;
  margin-top: 30rpx;
  backdrop-filter: blur(10px);
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.1);
}

.image-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.image-icon {
  font-size: 36rpx;
  margin-right: 15rpx;
}

.image-title {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.95);
  font-weight: bold;
}

.image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 25rpx;
  padding: 20rpx;
}

.weather-image {
  width: 280rpx;
  height: 280rpx;
  border-radius: 20rpx;
}

.image-prompt {
  margin-top: 15rpx;
  padding: 15rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15rpx;
}

.image-date {
  margin-top: 15rpx;
  padding: 15rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15rpx;
}

.prompt-text {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.7);
  display: block;
  text-align: center;
}

.date-text-small {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.7);
  display: block;
  text-align: center;
}

.subscribe-info {
  display: flex;
  align-items: flex-start;
  flex: 1;
}

.subscribe-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.subscribe-text-wrapper {
  display: flex;
  flex-direction: column;
}

.subscribe-title {
  font-size: 28rpx;
  color: white;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.subscribe-desc {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

.subscribe-btn-wrapper {
  flex-shrink: 0;
  margin-left: 20rpx;
}

.subscribe-btn {
  padding: 16rpx 30rpx;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  color: white;
  border-radius: 30rpx;
  border: none;
  font-size: 26rpx;
  font-weight: bold;
  box-shadow: 0 6rpx 20rpx rgba(255, 107, 107, 0.4);
}

.subscribe-btn:active {
  transform: scale(0.95);
}

.subscribed-badge {
  padding: 16rpx 30rpx;
  background: rgba(76, 175, 80, 0.3);
  color: #90EE90;
  border-radius: 30rpx;
  font-size: 26rpx;
  font-weight: bold;
  border: 2rpx solid rgba(76, 175, 80, 0.5);
}

.subscribed-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  align-items: flex-end;
}

.action-buttons {
  display: flex;
  gap: 10rpx;
  align-items: center;
}

.test-push-btn {
  padding: 14rpx 24rpx;
  background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
  color: white;
  border-radius: 30rpx;
  border: none;
  font-size: 24rpx;
  font-weight: 500;
  box-shadow: 0 4rpx 15rpx rgba(76, 175, 80, 0.4);
}

.test-push-btn:active {
  transform: scale(0.95);
  opacity: 0.9;
}

.unsubscribe-btn {
  padding: 16rpx 24rpx;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 30rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.unsubscribe-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.3);
}

/* Error card */
.error-card {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 50rpx 40rpx;
  border-radius: 30rpx;
  text-align: center;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
  width: 80%;
}

.error-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 20rpx;
}

.error-text {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 30rpx;
  line-height: 1.5;
}

.retry-btn {
  margin-top: 20rpx;
  padding: 20rpx 50rpx;
  background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%);
  color: white;
  border-radius: 35rpx;
  border: none;
  font-size: 28rpx;
  font-weight: bold;
  box-shadow: 0 6rpx 20rpx rgba(255, 154, 158, 0.4);
}

.retry-btn:active {
  transform: scale(0.95);
}

/* ?????????? */
.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>