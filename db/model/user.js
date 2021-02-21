// 模型: User模型, user表

const {
    DataTypes,
    Model
} = require('sequelize')

class User extends Model {}

// 定义模型结构, 数据表结构
User.init({
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
    userId: {
        type: DataTypes.STRING(30),
        allowNull: false,
        // 默认值
        defaultValue: '',
        comment: '用户id'
    },
    nickName: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: '',
        comment: '昵称'
    },
    email: {
        type: DataTypes.STRING(40),
        allowNull: false,
        defaultValue: '',
        comment: '邮箱'
    },
    password: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: '',
        comment: '密码'
    },
    phone: {
        type: DataTypes.STRING(11),
        allowNull: true,
        defaultValue: null,
        comment: '手机号'
    },
    sex: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 2,
        comment: '用户性别, 0: 女, 1: 男, 2: 保密'
    },
    avatar: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'default.jpg',
        comment: '用户头像'
    }
}, {
    // 指定连接实例，这样才知道在指定数据库创建user表
    sequelize,
    // 模型名称，当没有指定表名时，squelize会推断表名为模型名称的复数 user ==> users
    modelName: 'user',
    // 不推断，直接使用模型名称作为表名
    freezeTableName: true,
    // 指定表名
    tableName: 'user'
})

// 同步数据库表
// force: true ==> 删除原有的user表，新建user表
// force: false ==> 如果user存在，则不创建，反之则创建user表
User.sync({
    force: false
})

module.exports = User