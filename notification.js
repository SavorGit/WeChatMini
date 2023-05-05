const ci = require('miniprogram-ci');
const md5File = require('md5-file');
const axios = require('axios');
const path = require('path');
const fs = require("fs");
const appDirectory = fs.realpathSync(process.cwd());


/**
 * 获取环境参数
 * type 操作类型 preview | publish
 * version:版本号 上传操作必填
 * desc:版本描述  上传操作必填
 * appid:应用id,测试人员有时需要切换应用Id
 * buildId: 构建id
 */
const { appid = '', buildId = '', notifyRobotWebHook = '' } = getEnvParams(process.argv);

console.log(process.argv);

if (!appid || typeof (appid) !== 'string' || appid.trim().length < 1) {
  console.error('appid不能为空!!!');
  process.exit(1);
}

const previewPath = path.resolve(appDirectory, `./qrcode-${buildId}.jpg`);

// 向企业微信群发通知
if (typeof (notifyRobotWebHook) === 'string' && notifyRobotWebHook.trim().length > 1) {
  (async () => {
    try {
      const imageData = fs.readFileSync(previewPath);
      const hash = md5File.sync(previewPath)
      const imageBase64 = imageData.toString("base64");
      const sendNoticeResult = await sendQrCode(imageBase64, hash);
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
    let arg = options[i].split('=');
    envParams[arg[0]] = arg[1];
  }
  return envParams;
}