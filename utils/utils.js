// 工具库 公共方法

// 导入crytpo, 用于加密字符串, nodejs核心模块
const crytpo = require('crypto')

// 导入nodemailer, 用于发邮件
const nodemailer = require('nodemailer')

// 导入jsonwebtoken模块, 用于处理签名token
const jsonwebtoke = require('jsonwebtoken')

const fs = require('fs')

// 发邮件配置
// 创建发邮件实例
const transporter = nodemailer.createTransport({
    // 服务器地址
    host: config.emailOptions.host,
    // 端口 25端口在阿里云服务器被禁止的, 建议使用465
    port: config.emailOptions.port,
    // 如果端口为465, 此项需要设置成true, 其他端口设置为false
    secure: config.emailOptions.secure,
    // 授权认证
    auth: {
        // 用户邮箱地址
        user: config.emailOptions.user,
        // 授权码(不是邮箱登陆密码)
        pass: config.emailOptions.pass
    }
})

class Utils {

    // 加密字符串
    encodeString(value) {

        // 将value切片
        value = value.slice(0, 3) + config.saltOptions.pwd + value.slice(3)

        // value: 被加密的字符串, string
        const md5 = crytpo.createHash('md5')

        // 以16进制输出，输出32个字符
        return md5.update(value).digest('hex')
    }

    // 发邮件
    sendEmail(options) {
        // options: 发邮件配置, object
        // options.from: 发件地址, string
        // options.to: 收件地址, string, 如果多个接收地址需要用,分隔
        // options.subject: 邮件主题, string
        // text和html二选一
        // options.text: 发件内容(文本内容)
        // options.html: 发件内容(可含有html标签)
        return new Promise((resolve, reject) => {
            transporter.sendMail({
                from: config.emailOptions.user,
                to: options.to,
                subject: options.subject,
                text: options.text
            }, (err, info) => {
                // 如果发邮件失败
                if (err) {
                    reject(err)
                } else {
                    resolve(info)
                }
            })
        })
    }

    // 随机生成验证码
    randomCode() {
        const codes = []
        for (let i = 0; i < 6; i++) {
            let code = Math.floor(Math.random() * 10)
            codes.push(code)
        }
        return codes.join('')
    }

    // 签名token
    signToken(value) {
        // value: 签名的字符串 string
        // config.saltOptions.token: token加盐
        return jsonwebtoke.sign({
            data: value
        }, config.saltOptions.token, {
            // 有效时间
            expiresIn: config.tokenOptions.expires
        })
    }

    // 解析token
    verifyToken(token) {
        return new Promise((resolve, reject) => {
            jsonwebtoke.verify(token, config.saltOptions.token, (err, info) => {
                if (err) {
                    // 如果验证失败
                    reject()
                } else {
                    resolve(info)
                }
            })
        })
    }

    // 将cookie字符串转换成对象
    transformCookie(cookie) {
        const cookieObj = {}
        // 按照;切割
        const cookies = cookie.split('; ')
        cookies.map(v => {
            let c = v.split('=')
            cookieObj[c[0]] = c[1]
        })
        return cookieObj
    }

    // 上传图片
    uploadImg(base64, type) {

        // base64: 图片base64
        // type: 图片类型, string

        return new Promise((resolve, reject) => {
            // 将base64转换成buffer, 因为base64在传输到后台时, +号会被转换成空格, 所以需要将空格转换成+
            base64 = base64.replace(/ /g, '+')
            const buffer = Buffer.from(base64, 'base64')

            // 生成文件名
            const filename = Math.random().toString().slice(2) + new Date().getTime() + '.' + type

            fs.writeFile(__basename + '/upload/' + filename, buffer, err => {
                if (err) {
                    // 上传文件失败
                    reject(err)
                } else {
                    // 上传成功
                    resolve(filename)
                }
            })
        })
    }
}

module.exports = new Utils()