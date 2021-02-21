// 模型: Product模型, product表

const {
    DataTypes,
    Model
} = require('sequelize')

class Product extends Model {}

// 定义模型结构, 数据表结构
Product.init({
    id: {
        // 数据类型: INTEGER整形 UNSIGNED无符号
        type: DataTypes.INTEGER.UNSIGNED,
        // 自动递增
        autoIncrement: true,
        // 主键
        primaryKey: true,
        // 不允许为null
        allowNull: false,
        // 注释
        comment: '表id'
    },
    pId: {
        type: DataTypes.STRING(30),
        allowNull: false,
        // 默认值
        defaultValue: '',
        comment: '商品id'
    },
    name: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: '',
        comment: '商品名称'
    },
    price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0,
        comment: '商品价格'
    },
    status: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: '',
        comment: '商品状态'
    },
    desc: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '',
        comment: '商品描述'
    },
    img: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: '',
        comment: '商品图片'
    },
    detailImg: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: '',
        comment: '详情图片 '
    }
}, {
    // 指定连接实例，这样才知道在指定数据库创建user表
    sequelize,
    // 模型名称，当没有指定表名时，squelize会推断表名为模型名称的复数 user ==> users
    modelName: 'product',
    // 不推断，直接使用模型名称作为表名
    freezeTableName: true,
    // 指定表名
    tableName: 'product'
})

// 同步数据库表
// force: true ==> 删除原有的user表，新建user表
// force: false ==> 如果user存在，则不创建，反之则创建user表
Product.sync({
    force: false
})

module.exports = Product