// 导入API, 操作mysql数据库
const api = require(__basename + '/api/api.js')

// 导入utils, 调用公共方法
const utils = require(__basename + '/utils/utils.js')

const {
    Op
} = require("sequelize");

let url = config.serverOptions.host;
if (config.serverOptions.port) {
    url += `:${config.serverOptions.port}`
}
url += config.serverOptions.baseUrl;

class RoutesController {

    // 测试接口
    // test(req, res) {
    //     res.send({msg: '测试接口', status: 1});
    // }

    // 请求域拦截
    verifyHost(req, res, next) {
        if (config.hostOptions.indexOf(req.headers.origin) === -1) {
            return res.send({
                msg: '请求域不合法',
                status: 1021
            })
        }
        // 允许通过
        next()
    }

    // 验证码拦截
    verifyCode(req, res, next) {
        const url = req.url.split('?')[0]
        if (config.codeUrlOptioins.indexOf(url) > -1) {
            // 验证验证码
            console.log('req.body ==> ', req.body)
            // 根据codeId查询验证码信息
            api.findData({
                modelName: 'Code',
                condition: {
                    codeId: req.body.codeId
                }
            }).then(result => {

                if (result.length == 0) {
                    return res.send({
                        msg: '验证码不存在',
                        status: 1034
                    })
                }

                // console.log('result ==> ', result)
                // 获取当前时间和验证码的有效时间差
                // const time = new Date().getTime() - config.emailOptions.expires
                // 获取验证码保存时间
                // const codeTime = new Date(result[0].dataValues.createdAt).getTime()
                // 如果验证码保存时间 >= time
                // console.log('time => ',time)
                // console.log('codeTime => ', codeTime)
                // console.log('1 => ', req.body.validcode == result[0].dataValues.text)
                // console.log('2 => ', req.body.email == result[0].dataValues.email)
                // console.log('3 => ', codeTime >= time)
                // const isPass = req.body.validcode == result[0].dataValues.text && req.body.email == result[0].dataValues.email && codeTime >= time
                // if (isPass) {
                //     // 如果验证通过，则将请求传递给下一个中间件或者路由
                //     next()
                // } else {
                //     res.send({msg: '验证码错误', status: 1031})
                // }

                if (req.body.email != result[0].dataValues.email) {
                    res.send({
                        msg: '发送验证码邮箱错误',
                        status: 1032
                    })
                } else if (req.body.validcode != result[0].dataValues.text) {
                    res.send({
                        msg: '验证码错误',
                        status: 1031
                    })
                } else {
                    // 获取当前时间和验证码的有效时间差
                    const time = new Date().getTime() - config.emailOptions.expires
                    // 获取验证码保存时间
                    const codeTime = new Date(result[0].dataValues.createdAt).getTime()
                    if (codeTime >= time) {
                        // 如果验证通过，则将请求传递给下一个中间件或者路由
                        next()
                    } else {
                        res.send({
                            msg: '验证码失效',
                            status: 1033
                        })
                    }
                }

            }).catch(err => {
                console.log('err ==> ', err)
                res.send({
                    msg: '验证码错误',
                    status: 1031
                })
            })
        } else {
            // 无需验证验证码，直接将请求传递给下一个中间件或者路由
            next()
        }
    }

    // 验证Token
    verifyToken(req, res, next) {
        const url = req.url.split('?')[0]
        if (config.tokenOptions.tokenUrl.indexOf(url) > -1) {
            // 需要验证token
            if (!req.headers.cookie) {
                return res.send({
                    msg: '请先登录',
                    status: 1034
                })
            }

            const cookie = utils.transformCookie(req.headers.cookie)
            // console.log('cookie ==> ', cookie)

            const token = [cookie.jjy, cookie.xbx, cookie.ljt].join('.')
            // console.log('token ==> ', token)

            // 验证token
            utils.verifyToken(token)
                .then(result => {
                    // console.log('token result ==> ', result)
                    // 将user_id传递
                    req.userId = result.data
                    // 验证通过，传递给下一个中间件或路由
                    next()
                }).catch(err => {
                    return res.send({
                        msg: '请先登录',
                        status: 1034
                    })
                })
        } else {
            next()
        }
    }

    // 注册接口
    register(req, res) {

        // 查询邮箱是否已经被注册
        api.findData({
            modelName: 'User',
            condition: {
                email: req.body.email
            },
            attributes: ['email']
        }).then(result => {
            // 如果邮箱已经被注册, 则提示用户该邮箱已经被注册
            if (result.length > 0) {
                res.send({
                    msg: '该邮箱已经被注册',
                    status: 1001
                })
            } else {
                // 创建用户id
                let userId = '_uid' + new Date().getTime()

                // 随即昵称
                let index = Math.floor(Math.random() * config.nickNameOptions.length)
                let nickName = config.nickNameOptions[index] + userId

                // 加密密码
                const password = utils.encodeString(req.body.password)
                // console.log(password)

                // 插入数据 ==> 模型.create(创建数据对象)
                api.createData('User', {
                    email: req.body.email,
                    password,
                    nickName,
                    userId
                }).then(result => {
                    res.send({
                        msg: '注册成功',
                        status: 1000,
                        result
                    })
                }).catch(err => {
                    console.log('err => ', err)
                    res.send({
                        msg: '注册失败',
                        status: 1001
                    })
                })
            }
        }).catch(err => {
            console.log('err ==> ', err)
            res.send({
                msg: '注册失败',
                status: 1001
            })
        })
    }

    // 发邮件
    email(req, res) {

        // 随机生成验证码
        let code = utils.randomCode()

        // 生成验证码唯一id
        let codeId = 'cid' + new Date().getTime()

        // 先把验证码存储, 再发邮件给用户
        api.createData('Code', {
            email: req.body.email,
            codeId,
            text: code
        }).then(result => {
            // console.log('result ==> ', result)
            // 如果创建成功
            if (result.dataValues) {

                // 开发时，屏蔽发邮件
                res.send({
                    msg: `验证码已发至${req.body.email}`,
                    status: 1010,
                    cid: codeId
                })
                return

                // 发邮件
                utils.sendEmail({
                    to: req.body.email,
                    subject: '验证码',
                    text: `验证码为${code}, ${config.emailOptions.expires / 1000 / 60}分钟内有效。`
                }).then(result => {
                    res.send({
                        msg: `验证码已发至${result.accepted[0]}`,
                        status: 1010,
                        cid: codeId
                    })
                }).catch(err => {
                    console.log(err)
                    res.send({
                        msg: '发送验证码失败',
                        status: 1011
                    })
                })
            } else {
                res.send({
                    msg: '发送验证码失败',
                    status: 1011
                })
            }
        }).catch(err => {
            console.log('err ==> ', err)
            res.send({
                msg: '发送验证码失败',
                status: 1011
            })
        })
    }

    // 登录接口
    login(req, res) {

        // 根据邮箱查询用户信息
        // api.findData({
        //     modelName: 'User',
        //     condition: {
        //         email: req.body.email
        //     },
        //     attributes: ['user_id', 'password']
        // }).then(result => {
        //     console.log('result ==> ', result)
        //     // 如果用户不存在
        //     if (result.length == 0) {
        //         res.send({msg: '邮箱未注册', status: 1042})
        //     } else {
        //         // 如果用户存在，则验证密码是否正确
        //         const password = utils.encodeString(req.body.password)
        //         if (password == result[0].dataValues.password) {
        //             // 登录成功, 以user_id签名一个token
        //             const token = utils.signToken(result[0].dataValues.user_id)

        //             // 将token切片
        //             const tokens = token.split('.')
        //             const ts = {
        //                 // 干扰项
        //                 zyqybz: 'akjsdfjowenfalsdf',
        //                 sdofia: 'ajsodfheoiwncowlnl'
        //             }
        //             config.tokenOptions.keys.forEach((v, i) => {
        //                 ts[v] = tokens[i]
        //             })
        //             res.send({msg: '登陆成功', status: 1040, data: ts})
        //         } else {
        //             res.send({msg: '邮箱或者密码不正确', status: 1043})
        //         }
        //     }
        // }).catch(err => {
        //     console.log('err ==> ', err)
        //     res.send({msg: '登陆失败', status: 1041})
        // })

        // 根据邮箱查询用户信息
        api.findData({
            modelName: 'User',
            condition: {
                email: req.body.email
            },
            attributes: ['user_id', 'password']
        }).then(result => {
            // 如果存在用户
            if (result.length > 0) {
                // 验证密码是否正确
                const password = utils.encodeString(req.body.password)
                if (password == result[0].dataValues.password) {
                    // 生成token: 加密的字符串, 一般用于身份验证
                    const token = utils.signToken(result[0].dataValues.user_id)
                    // 将token切片
                    const tokens = token.split('.')
                    // 干扰项
                    const ts = {
                        // 干扰项
                        nbnzyq: 'akjsdfjowenfalsdf',
                        aygrhl: 'ajsodfheoiwncowlnl'
                    }
                    config.tokenOptions.keys.forEach((v, i) => {
                        ts[v] = tokens[i]
                    })
                    res.send({
                        msg: '登陆成功',
                        status: 1030,
                        data: ts
                    })
                } else {
                    // 密码错误
                    res.send({
                        msg: '用户名或密码错误',
                        status: 1033
                    })
                }
            } else {
                // 用户不存在
                res.send({
                    msg: '用户不存在',
                    status: 1032
                })
            }
        }).catch(err => {
            res.send({
                msg: '登陆失败',
                status: 1031
            })
        })
    }

    // 获取用户信息
    getUserInfo(req, res) {
        // console.log('req.userId ==> ', req.userId)
        api.findData({
            modelName: 'User',
            condition: {
                userId: req.userId
            }
        }).then(result => {
            res.send({
                msg: '查询用户信息成功',
                status: 1040,
                data: {
                    result,
                    url
                }
            })
        }).catch(err => {
            res.send({
                msg: '查询用户信息失败',
                status: 1041
            })
        })
    }

    // 获取商品类型
    getTypeData(req, res) {
        api.findData({
            modelName: 'Type'
        }).then(result => {
            res.send({
                msg: '查询类型成功',
                status: 1050,
                result
            })
        }).catch(err => {
            console.log(err)
            res.send({
                msg: '查询类型失败',
                status: 1051
            })
        })
    }

    // 发布商品
    postProduct(req, res) {
        // 先上传图片
        const promise = [
            utils.uploadImg(req.body.img, req.body.imgType),
            utils.uploadImg(req.body.detailImg, req.body.detailImgType)
        ]

        // 等待所有图片都上传完成后, 再将商品数据写入数据库
        Promise.all(promise)
            .then(result => {

                // 商品数据
                const productData = Object.assign(req.body)
                // console.log(req.body)

                productData.img = result[0]
                productData.detailImg = result[1]
                // console.log('productData ==> ', productData)

                // 商品类型
                const typeId = productData.type

                // 删除商品类型, 图片类型
                delete productData.type
                delete productData.imgType
                delete productData.detailImgType
                // console.log('productData ==> ', productData)

                // 生成商品id
                productData.pId = 'p_id_' + new Date().getTime()
                console.log(productData)

                // 启动事务处理
                api.transaction(t => {
                    // t: 事务处理对象
                    return Promise.all([
                        // 01-将商品数据写入Product模型
                        api.createData('Product', productData, t),
                        // 02-将商品和用户关系写入UserProduct模型
                        api.createData('UserProduct', {
                            pId: productData.pId,
                            userId: req.userId
                        }, t),
                        // 03-将商品和商品类型关系写入ProductType模型
                        api.createData('ProductType', {
                            pId: productData.pId,
                            typeId
                        }, t)
                    ])
                }).then(result => {
                    res.send({
                        msg: '发布商品成功',
                        status: 1060,
                        result
                    })
                }).catch(err => {
                    console.log('err => ', err)
                    res.send({
                        msg: '发布商品失败',
                        status: 1061
                    })
                })

                // api.transaction(async (t) => {
                //     const result = []
                //     result[0] = await api.createData('Product', productData, t)
                //     result[1] = await api.createData('UserProduct', {
                //         pId: productData.pId,
                //         userId: req.userId
                //     }, t)
                //     result[2] = await api.createData('ProductType', {
                //         pId: productData.pId,
                //         typeId
                //     }, t)
                //     console.log('result await ==> ', result)
                //     return result
                // }).then(result => {
                //     res.send({
                //         msg: '发布商品成功',
                //         status: 1060,
                //         result
                //     })
                // }).catch(err => {
                //     console.log('err => ', err)
                //     res.send({
                //         msg: '发布商品失败',
                //         status: 1061
                //     })
                // })
            })
            .catch(err => {
                res.send({
                    msg: '发布商品失败',
                    status: 1061
                })
            })
    }

    // 根据条件搜索商品
    search(req, res) {
        console.log('req.query ==> ', req.query)

        // SQL预处理, 防止SQL注入
        let sql = "SELECT `p`.`p_id`, `p`.`name`, `p`.`price`, `p`.`status`, `p`.`img`, `p`.`updated_at`, `pt`.`type_id`, `t`.`title`, `up`.`user_id` FROM `product` AS `p` INNER JOIN `product_type` AS `pt` ON `p`.`p_id` = `pt`.`p_id` INNER JOIN `type` AS `t` ON `pt`.`type_id` = `t`.`type_id` INNER JOIN `user_product` AS `up` ON `up`.`p_id` = `p`.`p_id` AND `up`.`user_id` = :userId";


        //条件
        let params = {
            userId: req.userId,
            offset: Number(req.query.offset),
            count: Number(req.query.count)
        };

        //判断是否根据名称搜索
        if (req.query.name) {
            sql += " AND `p`.`name` LIKE '%" + req.query.name + "%'";
        }

        //判断是否根据类型搜索
        if (req.query.type_id) {
            params.type_id = req.query.type_id;

            sql += " AND `pt`.`type_id` = :type_id";
        }

        //判断是否根据状态搜索
        if (req.query.status) {
            params.status = req.query.status;
            sql += " AND `p`.`status` = :status";
        }

        //是否根据日期搜索
        if (req.query.updated_at) {
            params.start = `${req.query.updated_at} 00:00:00`;
            params.end = `${req.query.updated_at} 23:59:59`;
            sql += " AND `p`.`updated_at` >= :start AND `p`.`updated_at` <= :end"
        }

        // 排序并且分页
        sql += ' ORDER BY `p`.`updated_at` DESC LIMIT :offset, :count'

        api.query(sql, params).then(result => {
            // console.log('search result ==> ', result)
            res.send({
                msg: '查询商品成功',
                status: 1070,
                data: {
                    url,
                    result
                }
            })
        }).catch(err => {
            console.log(err)
            res.send({
                msg: '查询商品失败',
                status: 1071
            })
        })
    }

    // 根据条件查询商品总数目
    count(req, res) {
        //SQL预处理，防止SQL注入
        let sql = "SELECT COUNT(`p`.`p_id`) AS `count` FROM `product` AS `p` INNER JOIN `product_type` AS `pt` ON `p`.`p_id` = `pt`.`p_id` INNER JOIN `type` AS `t` ON `pt`.`type_id` = `t`.`type_id` INNER JOIN `user_product` AS `up` ON `up`.`p_id` = `p`.`p_id` AND `up`.`user_id` = :userId";
        //条件
        const params = {
            userId: req.userId
        };

        //判断是否根据名称搜索
        if (req.query.name) {
            sql += " AND `p`.`name` LIKE '%" + req.query.name + "%'";
        }

        //判断是否根据类型搜索
        if (req.query.type_id) {
            params.type_id = req.query.type_id;

            sql += " AND `pt`.`type_id` = :type_id";
        }

        //判断是否根据状态搜索
        if (req.query.status) {
            params.status = req.query.status;
            sql += " AND `p`.`status` = :status";
        }

        //是否根据日期搜索
        if (req.query.updated_at) {
            params.start = `${req.query.updated_at} 00:00:00`;
            params.end = `${req.query.updated_at} 23:59:59`;
            sql += " AND `p`.`updated_at` >= :start AND `p`.`updated_at` <= :end"
        }

        api.query(sql, params).then(result => {
            // 
            res.send({
                msg: '查询商品数目成功',
                status: 1080,
                result
            });
        }).catch(err => {
            res.send({
                msg: '查询商品数目失败',
                status: 1081
            });
        })
    }

    // 上下架
    upDownSelf(req, res) {
        console.log('req.body ==> ', req.body)
        api.updateData('Product', {
            status: req.body.status
        }, {
            p_id: req.body.p_id
        }).then(result => {
            res.send({
                msg: '更新商品状态成功',
                status: 1090,
                result
            })
        }).catch(err => {
            console.log('err ==> ', err)
            res.send({
                msg: '更新商品状态失败',
                status: 1091
            })
        })
    }

    // 根据商品pid查询商品信息
    getProductById(req, res) {
        console.log(req.userId)
        let sql = "SELECT `p`.`p_id`, `p`.`name`, `p`.`price`, `p`.`status`, `p`.`img`, `p`.`detail_img`, `p`.`desc`, `pt`.`type_id`, `up`.`user_id` FROM `product` AS `p` INNER JOIN `product_type` AS `pt` ON `p`.`p_id` = `pt`.`p_id` INNER JOIN `user_product` AS `up` ON `up`.`p_id` = `p`.`p_id` AND `up`.`user_id` = :userId AND `p`.`p_id` = :p_id";
        api.query(sql, {
            userId: req.userId,
            p_id: req.query.p_id
        }).then(result => {
            res.send({
                msg: '查询商品成功',
                status: 1070,
                data: {
                    url,
                    result
                }
            })
        }).catch(err => {
            console.log('err ==> ', err)
            res.send({
                msg: '查询商品失败',
                status: 1071
            })
        })
    }

    // 更新商品数据
    updateProduct(req, res) {

        // 更新商品数据
        function updatePro(productData, pId) {
            // 更新Product模型
            api.updateData('Product', productData, {
                pId
            }).then(r1 => {
                res.send({
                    msg: '更新商品数据成功',
                    status: 1100,
                    result: r1
                });
            }).catch(err => {
                res.send({
                    msg: '更新商品数据失败',
                    status: 1101
                });
            })
        }

        // 更新商品数据和商品类型
        function updateProAndType(productData, pId) {
            // 开始事务处理, 更新Product, ProductType模型
            api.transaction(async (t) => {
                // 更新商品数据
                await api.updateData('Product', productData, {
                    pId
                }, t)
                // 更新商品类型数据
                await api.updateData('ProductType', {
                    typeId
                }, {
                    pId
                }, t)
            }).then(r3 => {
                res.send({
                    msg: '更新商品数据成功',
                    status: 1100,
                    result: r3
                });
            }).catch(err => {

                res.send({
                    msg: '更新商品数据失败',
                    status: 1101
                });
            })
        }


        // console.log('req.body ==> ', req.body)
        // 如果存在图片, 先上传图片, 再更新商品数据
        // 如果没有图片, 直接更新商品数据
        // 如果更新类型, 需要操作更新ProductType模型
        // 如果更新商品数据, 需要操作更新Product模型

        const promise = []

        const imgs = []

        // 商品数据
        const productData = Object.assign(req.body)

        // 商品类型
        const typeId = productData.type

        // 商品p_id
        const p_id = productData.p_id

        // 删除商品类型, 图片类型
        delete productData.type
        delete productData.imgType
        delete productData.detailImgType
        delete productData.p_id

        if (req.body.img) {
            imgs.push('img')
            promise.push(utils.uploadImg(req.body.img, req.body.imgType))
        }

        if (req.body.detailImg) {
            imgs.push('detailImg')
            promise.push(utils.uploadImg(req.body.detailImg, req.body.detailImgType))
        }

        if (promise.length > 0) {
            // 如果存在图片, 先上传图片, 再更新商品数据
            Promise.all(promise)
                .then(result => {

                    imgs.map((v, i) => {
                        productData[v] = result[i]
                    })

                    // console.log("productData ==> ", productData)
                    // console.log("typeId ==> ", typeId)

                    // 判断是否存在更改类型
                    if (typeId) {
                        // 开启事务处理, 更新Product和ProductType模型
                        updateProAndType(productData, p_id)
                    } else {
                        // 更新Product模型
                        updatePro(productData, p_id)
                    }
                })
                .catch(err => {
                    console.log('err ==> ', err)
                    res.send({
                        msg: '更新商品数据失败',
                        status: 1101
                    })
                })
        } else {
            // 没有图片
            // console.log('typeId ==> ', typeId)
            // console.log('productData ==> ', productData)
            // 只有类型
            if (typeId && JSON.stringify(productData) == '{}') {
                // 更新ProductType模型
                api.updateData('ProductType', {
                    typeId
                }, {
                    pId: p_id
                }).then(r2 => {
                    console.log('r2 ==> ', r2)
                    res.send({
                        msg: '更新商品数据成功',
                        status: 1100,
                        result: r2
                    })
                }).catch(err => {
                    console.log('err ==> ', err)
                    res.send({
                        msg: '更新商品数据失败',
                        status: 1101
                    })
                })
            } else if (typeId && JSON.stringify(productData) != '{}') {
                // 有类型且有商品数据
                updateProAndType(productData, p_id)
            } else {
                // 只有商品数据
                // 只更新Product模型
                updatePro(productData, p_id)
            }
        }
    }

    // 删除商品
    remove(req, res) {
        // 删除Product、ProductType、UserProduct模型数据
        const p_id = req.body.p_id.split(',')
        console.log('p_id ==> ', p_id)
        // return res.send('remove ok');
        // 开启事务处理
        api.transaction(async (t) => {
            // 删除UserProduct模型数据
            await api.removeData('UserProduct', {
                // pId: req.body.p_id,
                // [Op.in]: [1, 2]  ==>  IN [1, 2]
                pId: {
                    [Op.in]: p_id
                },
                userId: req.userId
            }, t)

            // 删除ProductType模型数据
            await api.removeData('ProductType', {
                // pId: req.body.p_id
                pId: {
                    [Op.in]: p_id
                }
            }, t)

            // 删除Product模型数据
            await api.removeData('Product', {
                // pId: req.body.p_id
                pId: {
                    [Op.in]: p_id
                }
            }, t)
        }).then((result) => {
            res.send({
                msg: '删除商品数据成功',
                status: 1110
            });
        }).catch(err => {
            res.send({
                msg: '删除商品数据失败',
                status: 1111
            });
        })
    }

    // 查询当前用户是否有商品数据
    getGoodsNum(req, res) {
        const sql = "SELECT COUNT(`up`.`p_id`) as `count` FROM `user_product` AS `up` WHERE `up`.`user_id` = :userId"
        const userId = req.userId;
        api.query(sql, {
            userId
        }).then(result => {
            res.send({
                msg: '查询商品数量成功',
                status: 1080,
                result
            })
        }).catch(err => {
            res.send({
                msg: '查询商品数量失败',
                status: 1081
            })
        })
    }

    // 查询各分类商品上下架的数量
    getTypeCount(req, res) {
        // const sql = "SELECT `pt`.`type_id`, `p`.`status`, COUNT(*) AS `count` FROM `product` AS `p` INNER JOIN `product_type` AS `pt` WHERE `p`.`p_id` = `pt`.`p_id` GROUP BY `pt`.`type_id`, `p`.`status`"
        // const sql = "SELECT `t`.`id`, COUNT(*) AS `count` FROM (`type` AS `t` INNER JOIN `product_type` AS `pt` ON `t`.`type_id` = `pt`.`type_id`) INNER JOIN `product` AS `p` ON `p`.`p_id` = `pt`.`p_id` AND `p`.`status` = :status GROUP BY `t`.`id`"

        const sql = "SELECT t2.count FROM (SELECT DISTINCT `pt`.`type_id` FROM `type` AS `t` INNER JOIN `product_type` AS `pt` ON `t`.`type_id` = `pt`.`type_id`) AS t1 LEFT JOIN (SELECT DISTINCT `pt`.`type_id`, COUNT(*) AS COUNT FROM `product` AS `p` INNER JOIN `product_type` AS `pt` ON `p`.`p_id` = `pt`.`p_id` AND `p`.`status` = :status GROUP BY `pt`.`type_id`) AS t2 ON t1.type_id = t2.type_id"

        const promise = [api.query(sql, {
            status: '上架'
        }), api.query(sql, {
            status: '下架'
        })]

        Promise.all(promise).then(result => {
            // 
            res.send({
                msg: '查询商品数目成功',
                status: 1080,
                result
            });
        }).catch(err => {
            res.send({
                msg: '查询商品数目失败',
                status: 1081
            });
        })
    }

    // 查询各分类商品总数量
    getTypeAllCount(req, res) {
        const sql = "SELECT COUNT(*) AS `value`, `t`.`title` AS `name` FROM `type` AS `t` INNER JOIN `product_type` AS `pt` ON `t`.`type_id` = `pt`.`type_id` INNER JOIN `product` AS `p` ON `pt`.`p_id` = `p`.`p_id` GROUP BY `t`.`type_id`"
        api.query(sql, {}).then(result => {
            res.send({
                msg: '查询商品数目成功',
                status: 1080,
                result
            });
        }).catch(err => {
            res.send({
                msg: '查询商品数目失败',
                status: 1081
            });
        })
    }

    // 修改个人信息
    changeUserInfo(req, res) {
        const userInfo = Object.assign({}, req.body);

        const userId = userInfo.userId;
        const img = userInfo.avatar;
        const imgType = userInfo.imgType;

        // 删除不需要的属性
        delete userInfo.userId;
        delete userInfo.email;
        delete userInfo.avatar;
        delete userInfo.imgType;

        if (imgType) {
            // 如果存在图片, 先上传图片, 再更新个人信息
            utils.uploadImg(img, imgType)
                .then(result => {
                    userInfo.avatar = result
                    api.updateData('User', userInfo, {
                        userId
                    }).then(result => {
                        res.send({
                            msg: '更新个人信息成功',
                            status: 1090,
                            result
                        });
                    })
                }).catch(err => {
                    res.send({
                        msg: '更新个人信息失败',
                        status: 1091
                    });
                })
        } else {
            // 如果没有图片, 直接更新个人信息
            api.updateData('User', userInfo, {
                userId
            }).then(result => {
                res.send({
                    msg: '更新个人信息成功',
                    status: 1090,
                    result
                });
            }).catch(err => {
                res.send({
                    msg: '更新个人信息失败',
                    status: 1091
                });
            })
        }

        console.log('userId ==> ', userId);
        console.log('userInfo ==> ', userInfo);
    }
}

// 导出实例
module.exports = new RoutesController()