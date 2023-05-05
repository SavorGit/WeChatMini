const ci = require('miniprogram-ci');
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
const { buildId = '', notifyRobotWebHook = '' } = getEnvParams(process.argv);

console.log(process.argv);

const previewPath = path.resolve(appDirectory, `./qrcode-${buildId}.jpg`);

// 向企业微信群发通知
if (typeof (notifyRobotWebHook) === 'string' && notifyRobotWebHook.trim().length > 1) {
  (async () => {
    try {
      const imageData = fs.readFileSync(previewPath);
      const hash = md5File.sync(previewPath)
      const imageBase64 = imageData.toString("base64");
      const sendNoticeResult = await sendQrCode(notifyRobotWebHook, imageBase64, hash);
      console.log(sendNoticeResult);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}

function sendQrCode(url, imageBase64, hash) {
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
 * 获取node命令行参数
 * @param {array} options 命令行数组
 */
function getEnvParams(options) {
  let envParams = {};
  // 从第三个参数开始,是自定义参数
  for (let i = 2, len = options.length; i < len; i++) {
    // let arg = options[i].split('=');
    // envParams[arg[0]] = arg[1];
    let eqIndex = options[i].indexOf('=');
    let key = options[i].substring(0, eqIndex);
    let value = options[i].substring(eqIndex + 1);
    envParams[key] = value;
  }
  return envParams;
}