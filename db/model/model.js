// 收集所有模型

// 导入User模型
const User = require(__basename + '/db/model/user.js')

// 导入Code模型
const Code = require(__basename + '/db/model/code.js')

// 导入Type模型
const Type = require(__basename + '/db/model/type.js')

// 导入Product模型
const Product = require(__basename + '/db/model/product.js')

// 导入UserProduct模型
const UserProduct = require(__basename + '/db/model/user_product.js')

// 导入ProductType模型
const ProductType = require(__basename + '/db/model/product_type.js')

// 导出所有模型
module.exports = {
    User,
    Code,
    Type,
    Product,
    UserProduct,
    ProductType
}