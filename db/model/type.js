// 模型: Type模型, type表

// 导入type.js初始化商品类型数据
const typeData = require(__basename + '/db/data/type.js')

const {
    DataTypes,
    Model
} = require('sequelize')

class Type extends Model {}

// 定义模型结构, 数据表结构
Type.init({
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
    typeId: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // 默认值
        defaultValue: '',
        comment: '商品类型id'
    },
    title: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: '',
        comment: '商品类型'
    }
}, {
    // 指定连接实例，这样才知道在指定数据库创建user表
    sequelize,
    // 模型名称，当没有指定表名时，squelize会推断表名为模型名称的复数 user ==> users
    modelName: 'type',
    // 不推断，直接使用模型名称作为表名
    freezeTableName: true,
    // 指定表名
    tableName: 'type'
})

// 同步数据库表
// force: true ==> 删除原有的user表，新建user表
// force: false ==> 如果user存在，则不创建，反之则创建user表
Type.sync({
    force: false
})
// .then(result => {
//     // console.log('result ==> ', result)
//     typeData.map(v => {
//         Type.create(v)
//     })
// }).catch(err => {
//     console.log('初始化商品类型出错', err)
// })

module.exports = Type