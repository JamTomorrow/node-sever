// 连接mysql数据库

// 导入sequelize, 并且解构Sequelize
const {
    Sequelize
} = require('sequelize')

// 连接数据库
const sequelize = new Sequelize(config.mysqlOptions.database, config.mysqlOptions.username, config.mysqlOptions.password, {
    // 数据库地址
    host: config.mysqlOptions.host,
    // 数据库类型
    dialect: config.mysqlOptions.dialect,
    // 时区
    timezone: config.mysqlOptions.timezone,
    // 字段命名 以下划线分隔
    define: {
        underscored: config.mysqlOptions.underscored
    }
})

// 导出实例，以便后续创建模型需要使用该连接实例
module.exports = sequelize