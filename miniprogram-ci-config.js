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
const { type, version = '', desc = '', appid = '', buildId = '', notifyRobotWebHook = '' } = getEnvParams(process.argv);

console.log(process.argv);

if (!appid || typeof (appid) !== 'string' || appid.trim().length < 1) {
  console.error('appid不能为空!!!');
  process.exit(1);
}
// 微信小程序的私有key文件存储路径,每次新增appid时,需要找运维加私有key
const privateKeyPath = `/var/lib/jenkins/cert/private.${appid}.key`;

// 请求参数
const reqParams = {
  appid,
  type: 'miniProgram',
  projectPath: './',
  privateKeyPath,
  ignores: ['node_modules/**/*', 'yarn.lock', '.*'],
};
// 上传文件处理设置参数
const uploadParams = {
  es6: true, //  "es6 转 es5"
  es7: true, // "增强编译"
  minify: true, // "样式自动补全"
  codeProtect: true, // "代码保护"
  autoPrefixWXSS: true, // "样式自动补全"
};

const project = new ci.Project({ ...reqParams });
const previewPath = path.resolve(appDirectory, `./qrcode-${buildId}.jpg`);

// 任何时候都生成二维码
(async () => {
  const previewResult = await ci.preview({
    project,
    desc: '预览', // 此备注将显示在“小程序助手”开发版列表中
    setting: uploadParams,
    qrcodeFormat: 'image',
    //qrcodeOutputDest: `./qrcode-${buildId}.jpg`,
    qrcodeOutputDest: previewPath,
    onProgressUpdate: console.log,
    // pagePath: 'pages/index/index', // 预览页面
    // searchQuery: 'a=1&b=2',  // 预览参数 [注意!]这里的`&`字符在命令行中应写成转义字符`\&`
  });
  console.log(previewResult);
})();

// 发布到体验版
if (type == 'publish') {
  (async () => {
    const uploadResult = await ci.upload({
      project,
      version,
      desc,
      setting: uploadParams,
      onProgressUpdate: console.log,
    });
    console.log(uploadResult);
  })();
}

// 向企业微信群发通知
if (typeof (notifyRobotWebHook) === 'string' && notifyRobotWebHook.trim().length > 1) {
  (async () => {
    try {
      // const imageData = fs.readFileSync(previewPath);
      // const hash = md5File.sync(previewPath)
      // const imageBase64 = imageData.toString("base64");
      // await sendQrCode(imageBase64, hash);
      const sendNoticeResult = await sendNoticeToWeChartGroup(notifyRobotWebHook, previewPath);
      console.log(sendNoticeResult);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
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

function sendNoticeToWeChartGroup(url, picPath) {
  const imageData = fs.readFileSync(picPath);
  const hash = md5File.sync(picPath)
  const imageBase64 = imageData.toString("base64");
  return sendQrCode(url, imageBase64, hash);
}