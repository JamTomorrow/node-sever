// 操作数据库的api

const {
    QueryTypes
} = require('sequelize')

class API {

    // 创建数据
    createData(modelName, options, t) {
        // options: 创建的数据, 类型: object
        // t: 事务处理对象

        // 返回promise
        return t ? model[modelName].create(options, {
            transaction: t
        }) : model[modelName].create(options)
    }

    // 删除
    removeData(modelName, condition, t) {
        // modelName: 模型名称
        // condition: 条件
        // t: 事务处理对象
        if (t) {
            return model[modelName].destroy({
                where: condition,
                transaction: t
            })
        }
        return model[modelName].destroy({
            where: condition
        })
    }

    // 更新
    updateData(modelName, values, condition, t) {
        // modelName: 模型名称
        // values: 更新数据 obj
        // condition: 条件 obj
        // t: 事务处理对象 obj
        if (t) {
            return model[modelName].update(values, {
                where: condition,
                transaction: t
            })
        }
        return model[modelName].update(values, {
            where: condition
        })
    }

    // 查询
    findData(options) {
        // options.modelName: 模型名称, string
        // options.condition: 查询条件, object
        // options.attributes: 查询字段, array ==> ['a', 'b'] 或者 具有别名 ['a', ['b', 'b的别名']]
        return model[options.modelName].findAll({
            where: options.condition,
            attributes: options.attributes
        })
    }

    // 事务处理
    transaction(fn) {
        return sequelize.transaction(fn)
    }

    //原始查询
    query(sql, replacements) {
        //sql: SQL语句, string
        //replacements: 替换SQL语句的内容, object
        return sequelize.query(sql, {
            replacements,
            type: QueryTypes.SELECT
        })
    }
}

module.exports = new API()