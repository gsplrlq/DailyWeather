const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const dbName = 'daily_weather_images'

/**
 * 天气图片提示词 Map
 * 每种天气类型有多个提示词，运行时会随机选择
 */
const WEATHER_PROMPTS = {
  sunny: [
    'cute West Highland White Terrier puppy enjoying warm spring sunshine, playing in blooming flower field, cherry blossoms falling, happy smile, kawaii anime style, soft pastel colors, high quality',
    'cute West Highland White Terrier puppy wearing tiny sunglasses, enjoying hot summer sunshine on tropical beach, palm trees around, happy expression, kawaii anime style, vibrant colors, high quality',
    'cute West Highland White Terrier puppy playing in golden autumn leaves, warm sunlight through orange leaves, cozy sweater, kawaii anime style, warm colors, high quality',
    'cute West Highland White Terrier puppy in soft winter sunlight, snowy landscape, cozy warm sweater, kawaii anime style, soft colors, high quality',
    'cute West Highland White Terrier puppy running happily in bright sunshine meadow, butterflies and flowers around, joyful expression, kawaii anime style, bright colors, high quality',
    'cute West Highland White Terrier puppy sunbathing on comfortable wooden deck, lazy afternoon sunshine, peaceful smile, kawaii anime style, warm pastel, high quality',
    'cute West Highland White Terrier puppy with flower crown, dancing in morning sunshine, rainbow in background, kawaii anime style, dreamy colors, high quality'
  ],

  cloudy: [
    'cute West Highland White Terrier puppy sitting on fluffy cloud, looking at the sky curiously with dreamy eyes, floating gently, soft clouds all around, kawaii anime style, pastel colors, high quality',
    'cute West Highland White Terrier puppy resting on big soft cloud pillow, gentle breeze, peaceful expression, cloudy sky background, kawaii anime style, muted tones, high quality',
    'cute West Highland White Terrier puppy sitting on rainbow cloud, watching colorful sky, dreamy atmosphere, kawaii anime style, soft gradient colors, high quality',
    'cute West Highland White Terrier puppy wrapped in fluffy blanket on cloud, cozy nap time, gentle wind, kawaii anime style, warm colors, high quality',
    'cute West Highland White Terrier puppy dancing on floating clouds, cotton candy sky, playful expression, kawaii anime style, dreamy pastel colors, high quality'
  ],

  rainy: [
    'cute West Highland White Terrier puppy wearing bright yellow raincoat with hood, holding red umbrella, happily splashing in rain puddles, raindrops and splashes around, playful expression, kawaii anime style, soft colors, high quality',
    'cute West Highland White Terrier puppy wearing blue rain boots, jumping in puddle, happy smile with rain drops on fur, cozy indoor window background, kawaii anime style, cool blue tones, high quality',
    'cute West Highland White Terrier puppy under big mushroom umbrella, watching rain from cozy spot, tiny snail nearby, kawaii anime style, fresh green colors, high quality',
    'cute West Highland White Terrier puppy wearing tiny waterproof cape, playing with rubber duck in rain, rainbow appearing, kawaii anime style, vibrant colors, high quality',
    'cute West Highland White Terrier puppy wrapped in towel by window, watching rain with hot cocoa, cozy indoor scene, kawaii anime style, warm tones, high quality'
  ],

  snowy: [
    'cute West Highland White Terrier puppy wearing red knitted scarf and cozy winter sweater, playing in fresh snow, catching snowflakes on tongue, building a tiny snowman, winter forest background, kawaii anime style, cool colors, high quality',
    'cute West Highland White Terrier puppy wearing earmuffs and mittens, rolling in snowy yard, happy expression, snow angels in background, kawaii anime style, white and blue tones, high quality',
    'cute West Highland White Terrier puppy inside cozy snow globe, tiny cabin and pine trees, magical snow falling, kawaii anime style, sparkle effects, high quality',
    'cute West Highland White Terrier puppy pulling tiny sled loaded with presents, snowy village background, Christmas atmosphere, kawaii anime style, festive colors, high quality',
    'cute West Highland White Terrier puppy warming by fireplace with hot chocolate, snow visible through window, cozy winter scene, kawaii anime style, warm orange tones, high quality'
  ]
}

/**
 * 根据季节调整提示词权重（可选季节性提示词）
 */
const SEASONAL_PROMPTS = {
  spring: [
    'cute West Highland White Terrier puppy surrounded by cherry blossoms, spring festival, kawaii anime style, pink petals floating, soft spring colors, high quality',
    'cute West Highland White Terrier puppy playing in blooming tulip garden, butterflies around, fresh spring morning, kawaii anime style, vibrant flower colors, high quality'
  ],
  summer: [
    'cute West Highland White Terrier puppy at summer beach party, wearing flower lei, coconut drinks, tropical flowers, kawaii anime style, bright summer colors, high quality',
    'cute West Highland White Terrier puppy cooling in swimming pool, inflatable flamingo, summer vacation vibes, kawaii anime style, tropical blue tones, high quality'
  ],
  autumn: [
    'cute West Highland White Terrier puppy in pumpkin patch, autumn harvest, falling leaves, warm harvest moon, kawaii anime style, orange and brown tones, high quality',
    'cute West Highland White Terrier puppy making apple pie with family, cozy kitchen, autumn baking, kawaii anime style, warm golden colors, high quality'
  ],
  winter: [
    'cute West Highland White Terrier puppy in magical winter wonderland, ice crystals and snow sparkles, northern lights, kawaii anime style, magical blue tones, high quality',
    'cute West Highland White Terrier puppy celebrating winter holidays, cozy fireplace, gift boxes, kawaii anime style, festive warm colors, high quality'
  ]
}

/**
 * 从数组中随机选择一个元素
 * @param {Array} arr - 数组
 * @returns {*} 随机元素
 */
function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * 获取当前季节
 * @returns {string} spring | summer | autumn | winter
 */
function getSeason() {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

/**
 * 生成随机的4种天气提示词
 */
function generateWeatherPrompts() {
  const season = getSeason()

  return {
    sunny: randomPick(WEATHER_PROMPTS.sunny),
    cloudy: randomPick(WEATHER_PROMPTS.cloudy),
    rainy: randomPick(WEATHER_PROMPTS.rainy),
    snowy: randomPick(WEATHER_PROMPTS.snowy),
    _meta: {
      season,
      generatedAt: new Date().toISOString(),
      versions: {
        sunny: WEATHER_PROMPTS.sunny.length,
        cloudy: WEATHER_PROMPTS.cloudy.length,
        rainy: WEATHER_PROMPTS.rainy.length,
        snowy: WEATHER_PROMPTS.snowy.length
      }
    }
  }
}

/**
 * 调用AI生成图片（使用免费服务）
 */
async function generateImage(prompt) {
  try {
    const encodedPrompt = encodeURIComponent(prompt)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true`

    console.log('Generated image URL:', imageUrl)

    return {
      success: true,
      url: imageUrl,
      prompt: prompt
    }
  } catch (error) {
    console.error('Image generation failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 保存4张图片到云数据库
 */
async function saveToDatabase(imagesData) {
  const now = new Date()
  const year = now.getFullYear(); // 获取完整的年份 (4位, 2026) [4, 5]
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 获取当前月份 (0-11, 需要+1, 并补0) [5, 11]
  const day = String(now.getDate()).padStart(2, '0'); // 获取当前日 (1-31, 并补0) [5, 11]

  const today = `${year}-${month}-${day}`;

  try {
    const { data: existing } = await db.collection(dbName)
      .where({ date: today })
      .get()

    if (existing && existing.length > 0) {
      await db.collection(dbName)
        .doc(existing[0]._id)
        .update({
          data: {
            sunny: imagesData.sunny,
            cloudy: imagesData.cloudy,
            rainy: imagesData.rainy,
            snowy: imagesData.snowy,
            updatedAt: now.toISOString()
          }
        })
      console.log('Updated existing record for today')
      return { success: true, action: 'update', id: existing[0]._id }
    } else {
      const result = await db.collection(dbName)
        .add({
          data: {
            date: today,
            sunny: imagesData.sunny,
            cloudy: imagesData.cloudy,
            rainy: imagesData.rainy,
            snowy: imagesData.snowy,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
          }
        })
      console.log('Created new record:', result.id)
      return { success: true, action: 'create', id: result.id }
    }
  } catch (error) {
    console.error('Database save failed:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 云函数入口：每天生成4种天气的图片
 */
exports.main = async (event, context) => {
  console.log('========== 开始生成天气图片 ==========')
  console.log('触发时间:', new Date().toLocaleString('zh-CN'))

  const result = {
    success: false,
    message: '',
    data: null
  }

  try {
    // 生成4种天气的提示词（随机选择）
    const prompts = generateWeatherPrompts()
    console.log('当前季节:', prompts._meta.season)
    console.log('随机选择的提示词:', {
      sunny: prompts.sunny.substring(0, 50) + '...',
      cloudy: prompts.cloudy.substring(0, 50) + '...',
      rainy: prompts.rainy.substring(0, 50) + '...',
      snowy: prompts.snowy.substring(0, 50) + '...'
    })

    const weatherTypes = ['sunny', 'cloudy', 'rainy', 'snowy']
    const images = {}

    for (const type of weatherTypes) {
      console.log(`正在生成 ${type} 类型的图片...`)
      const imageResult = await generateImage(prompts[type])

      if (!imageResult.success) {
        throw new Error(`生成 ${type} 图片失败: ${imageResult.error}`)
      }

      images[type] = {
        url: imageResult.url,
        prompt: imageResult.prompt
      }
    }

    const saveResult = await saveToDatabase({
      sunny: images.sunny,
      cloudy: images.cloudy,
      rainy: images.rainy,
      snowy: images.snowy
    })

    if (!saveResult.success) {
      throw new Error('保存数据库失败: ' + saveResult.error)
    }

    result.success = true
    result.message = saveResult.action === 'update' ? '今日4张天气图片已更新' : '今日4张天气图片已生成并保存'
    result.data = {
      date: new Date().toISOString().split('T')[0],
      images: images,
      dbAction: saveResult.action,
      dbId: saveResult.id
    }

  } catch (error) {
    console.error('云函数执行失败:', error)
    result.success = false
    result.message = error.message
  }

  console.log('========== 生成天气图片结束 ==========')
  console.log('结果:', result)

  return result
}