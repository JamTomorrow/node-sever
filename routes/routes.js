// 导入路由控制器
const routesController = require(__basename + '/routes_controller/routes_controller.js')

// 导出路由函数
module.exports = app => {

    // 测试接口
    // app.get('/', routesController.test);

    // 请求域拦截(白名单)
    app.use(routesController.verifyHost)

    // 验证码拦截(白名单)
    app.use(routesController.verifyCode)

    // 验证登录(白名单)
    app.use(routesController.verifyToken)

    // 注册接口
    app.post('/register', routesController.register)

    // 发邮件
    app.post('/email', routesController.email)

    // 登录接口
    app.post('/login', routesController.login)

    // 获取用户信息
    app.get('/getUserInfo', routesController.getUserInfo)

    // 获取商品类型
    app.get('/type', routesController.getTypeData)

    // 发布商品
    app.post('/postProduct', routesController.postProduct)

    // 搜索商品
    app.get('/search', routesController.search)

    app.get('/count', routesController.count)

    // 上下架
    app.post('/updown', routesController.upDownSelf)

    // 根据商品pid查询商品信息
    app.get('/probyid', routesController.getProductById)

    // 更新商品数据
    app.post('/updateProduct', routesController.updateProduct)

    // 删除商品
    app.post('/remove', routesController.remove)
}