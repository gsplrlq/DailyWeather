# 今天天气行不行 ☀️

一个可爱的微信小程序天气预报应用，基于 uni-app 框架开发。

## 功能特性

- 🌍 基于位置获取天气信息
- 🌤️ 实时天气数据展示（温度、湿度、风速等）
- 🎨 动态渐变背景，天气状态可视化
- 👔 智能穿衣建议和温馨小贴士
- 🔄 下拉刷新获取最新天气
- 📱 适配微信小程序和 H5
- 🔔 订阅消息推送（需配置云函数）

## 技术栈

| 技术 | 说明 |
|------|------|
| 框架 | uni-app (Vue 3) |
| 样式 | SCSS |
| 天气 API | OpenWeatherMap |
| 地图服务 | 腾讯地图逆地理编码 |
| 云开发 | 微信云开发 / 腾讯云 |

## 项目结构

```
wechat_miniapp/
├── config/                    # 配置文件目录
│   ├── config.json            # 密钥配置（不提交）
│   └── config.json.example    # 配置示例
├── pages/
│   └── index/                 # 首页
│       └── index.vue
├── common/                    # 公共模块
│   ├── weather.js            # 天气数据模型
│   └── weatherService.js     # 天气服务
├── cloudfunctions/            # 云函数
│   ├── pushWeather/          # 订阅消息推送
│   └── saveSubscription/    # 保存订阅
├── cloudbase/                # 云托管服务
├── static/                   # 静态资源
├── App.vue                   # 应用入口
├── main.js                   # 主入口
├── manifest.json             # 应用配置
├── pages.json                # 页面配置
└── package.json             # 依赖配置
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置密钥

复制配置文件并填写你的密钥：

```bash
# 复制示例配置
cp config/config.json.example config/config.json
```

编辑 `config/config.json`，填入以下密钥：

| 配置项 | 说明 | 获取方式 |
|--------|------|----------|
| `WECHAT_APP_ID` | 微信小程序 AppID | 微信公众平台 |
| `WECHAT_APP_SECRET` | 微信小程序 AppSecret | 微信公众平台 |
| `TEMPLATE_ID` | 订阅消息模板 ID | 微信公众平台 |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API Key | [openweathermap.org](https://openweathermap.org/api) |
| `QQ_MAP_KEY` | 腾讯地图 Key | [腾讯位置服务](https://lbs.qq.com/) |

配置示例 `config/config.json`：

```json
{
  "WECHAT_APP_ID": "wx1234567890abcdef",
  "WECHAT_APP_SECRET": "your_secret_here",
  "TEMPLATE_ID": "CzDG2lqRT2JnoKiTVvpmEYSlq0eg8R2JwLXEIoaVeLA",
  "OPENWEATHER_API_KEY": "your_api_key_here",
  "QQ_MAP_KEY": "your_map_key_here"
}
```

### 3. 运行项目

```bash
# 微信小程序开发
npm run dev:mp-weixin

# H5 开发
npm run dev
```

### 4. 微信开发者工具导入

1. 打开微信开发者工具
2. 选择项目目录 `dist/dev/mp-weixin`
3. 填入 AppID 并确认

### 5. 构建生产版本

```bash
# 微信小程序
npm run build:mp-weixin

# H5
npm run build:h5
```

## 云函数部署

### pushWeather（订阅消息推送）

```bash
cd cloudfunctions/pushWeather
npm install
```

在微信开发者工具中：
1. 右键 `cloudfunctions/pushWeather` 文件夹
2. 选择「上传并部署：云端安装依赖」

### 定时触发配置

在微信公众平台的「云开发控制台」→「触发器」中添加定时触发：

```yaml
名称: pushWeather
触发方式: 定时触发
触发周期: 每天 07:00-09:00
Cron 表达式: 0 0 7 * * * *
```

## 环境变量说明

| 变量名 | 说明 | 是否必填 |
|--------|------|----------|
| `WECHAT_APP_ID` | 小程序 AppID | 是 |
| `WECHAT_APP_SECRET` | 小程序 AppSecret | 是 |
| `OPENWEATHER_API_KEY` | 天气 API 密钥 | 是 |
| `QQ_MAP_KEY` | 地图服务密钥 | 是 |

## 常见问题

### Q: 配置文件不存在？
确保已创建 `config/config.json` 文件，可复制 `config/config.json.example` 作为模板。

### Q: 天气数据获取失败？
1. 检查 `OPENWEATHER_API_KEY` 是否有效
2. 检查网络连接
3. 查看控制台错误信息

### Q: 订阅消息发送失败？
1. 检查 `WECHAT_APP_SECRET` 是否配置正确
2. 确保用户已授权订阅消息
3. 在微信公众平台开通订阅消息权限

## 开发说明

### API 配置路径

| 文件 | 密钥变量 |
|------|----------|
| `common/weatherService.js` | `OPENWEATHER_API_KEY`, `QQ_MAP_KEY` |
| `cloudfunctions/pushWeather/index.js` | `WECHAT_APP_ID`, `WECHAT_APP_SECRET` |
| `cloudbase/index.js` | `WECHAT_APP_ID`, `WECHAT_APP_SECRET` |

### 微信开发者工具配置

1. 勾选「不校验合法域名」
2. 确保已开启云开发服务
3. 配置正确的 AppID

## License

MIT License

---

Made with ❤️ for weather lovers