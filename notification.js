const md5File = require('md5-file');
const axios = require('axios');
const path = require('path');
const fs = require("fs");
const appDirectory = fs.realpathSync(process.cwd());


/**
 * 获取环境参数
 * buildId: 构建id
 * notifyRobotWebHook: 企业群聊机器人的WebHook
 */
const { buildId = '', notifyRobotWebHook = '', version = '', desc = '' } = getEnvParams(process.argv);
console.log(process.argv);

const previewPath = path.resolve(appDirectory, `./qrcode-${buildId}.jpg`);

// 向企业微信群发通知
if (typeof (notifyRobotWebHook) === 'string' && notifyRobotWebHook.trim().length > 1) {
  (async () => {
    try {
      const imageData = fs.readFileSync(previewPath);
      const hash = md5File.sync(previewPath)
      const imageBase64 = imageData.toString("base64");
      const sendNoticeResult = await sendImage(notifyRobotWebHook, imageBase64, hash);
      console.log(sendNoticeResult);
      const sendNoticeResult2 = await sendText(notifyRobotWebHook, `极简版代码已经提交到体验版。版本：${version}；修改内容：${desc}`);
      console.log(sendNoticeResult2);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}

/**
 * 发送图片消息。
 * 注：图片（base64编码前）最大不能超过2M，支持JPG,PNG格式
 * @param {String} url 企业微信机器人 WebHook 地址
 * @param {String} imageBase64 图片内容的 Base64 编码字符串
 * @param {String} hash 图片内容（Base64编码前）的md5值
 * @returns {String} 响应 Json 字符串
 */
function sendImage(url, imageBase64, hash) {
  return axios({
    headers: { "Content-Type": 'application/json' },
    method: 'post',
    url: url,
    data: {
      "msgtype": "image",
      "image": {
        "base64": imageBase64,
        "md5": hash
      }
    }
  });
}

/**
 * 发送文本消息
 * @param {String} url 企业微信机器人 WebHook 地址
 * @param {String} content 文本内容，最长不超过2048个字节，必须是utf8编码
 * @returns {String} 响应 Json 字符串
 */
function sendText(url, content) {
  return axios({
    headers: { "Content-Type": 'application/json' },
    method: 'post',
    url: url,
    data: {
      "msgtype": "text",
      "text": {
        "content": content,
        "mentioned_list": ["@all"],
        // "mentioned_mobile_list": ["18611368229", "@all"]
      }
    }
  });
}

/**
 * 获取node命令行参数
 * @param {Array} options 命令行数组
 * @returns {Object} 参数对象
 */
function getEnvParams(options) {
  let envParams = {};
  // 从第三个参数开始,是自定义参数
  for (let i = 2, len = options.length; i < len; i++) {
    let eqIndex = options[i].indexOf('=');
    let key = options[i].substring(0, eqIndex);
    let value = options[i].substring(eqIndex + 1);
    envParams[key] = value;
  }
  return envParams;
}