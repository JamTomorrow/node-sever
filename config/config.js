// 一个文件只有一个module.exports导出，可以有多个exports导出
// exports导出相当于给module.exports添加属性

// 服务器配置
exports.serverOptions = {
    host: 'http://127.0.0.1',
    port: 3000,
    baseUrl: '/static/file/'
}

// 随机昵称
exports.nickNameOptions = [
    '彩虹',
    '白云',
    '森林',
    '蓝天',
    '大海'
]

// 加盐配置, 用于加强加密
exports.saltOptions = {
    // 密码加盐
    pwd: '_pwd_',

    // token加盐
    token: '_tks_'
}

// 数据库配置
exports.mysqlOptions = {
    // mysql数据库名称
    database: 'my_db',
    // mysql用户名
    username: 'root',
    // mysql密码
    password: '',
    // 数据库地址
    host: 'localhost',
    // 数据库类型
    dialect: 'mariadb',
    // 时区
    timezone: '+08:00',
    // 字段以_命名
    underscored: true
}

// 邮件配置
exports.emailOptions = {
    // 邮件服务器地址
    host: 'smtp.qq.com',
    // 端口 25端口在阿里云服务器被禁止的, 建议使用465
    port: 465,
    // 如果端口为465, 此项需要设置成true, 其他端口设置为false
    secure: true,
    // 发件地址
    user: '2408818142@qq.com',
    // 授权码(不是邮箱登陆密码)
    pass: 'jksoxrhbylcleaai',
    // 验证码有效时间, 毫秒
    expires: 5 * 60 * 1000
}

// 允许请求(白名单)
exports.hostOptions = [
    'http://127.0.0.1:8080'
]

// 验证验证码请求路径
exports.codeUrlOptioins = [
    '/register'
]

// token配置
exports.tokenOptions = {
    // 有效时间
    expires: '1d',
    keys: ['jjy', 'xbx', 'ljt'],
    // 需要验证token的路径
    tokenUrl: [
        '/getUserInfo',
        '/type',
        '/postProduct',
        '/search',
        '/count',
        '/updown',
        '/probyid',
        '/updateProduct',
        '/remove',
        '/getGoodsNum',
        '/getTypeCount',
        '/getTypeAllCount',
        '/changeUserInfo'
    ]
}
