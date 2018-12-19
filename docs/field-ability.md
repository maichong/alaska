# 字段权限设置



## disabled

禁用条件，管理端组件禁用，并且接口不允许写



### 直接禁用

```js
// 直接禁用
field: {
    disabled: true
}
```



### check-depends 语法支持

```js

// 当foo字段存在时禁用
field: {
    disabled: 'foo'
}

// 当foo字段不存在时禁用
field: {
    disabled: '!foo'
}

// 当foo字段的值等于'bar'时禁用
field: {
    disabled: {
        foo: 'bar'
    }
}

// 当foo字段的值不等于'bar'时禁用
field: {
    disabled: {
        foo: {
            $ne: 'bar'
        }
    }
}

// 当foo字段的值大于100时禁用
field: {
    disabled: {
        foo: {
            $gt: 100
        }
    }
}

// 当foo字段的值大于100，且小于200时禁用
field: {
    disabled: {
        $and: [{
            foo: { $gt: 100 }
        },{
            foo: { $lt: 200 }
        }]
    }
}

// 当foo字段的值小于100，或大于200时禁用
field: {
    disabled: {
        $or: [{
            foo: { $lt: 100 }
        },{
            foo: { $gt: 200 }
        }]
    }
}

// 当foo字段的值小于100，且bar大于200时禁用
field: {
    disabled: {
        foo: { $lt: 100 },
        bar: { $gt: 200 }
    }
}
```



### 权限检查

检查条件为数组时，数组是一个或非门（`NOR` ），数组的每个元素都是一个输入，当所有输入都为false时，整个条件才为true。

> 可以理解为，数组的多个元素是多个并排的关卡，只要有一个关卡放水（true），整个边防检查就失效了，disabled就为false，就允许用户输入了

每个输入，都可以指定 ability 和 check，两者都满足时（AND），该输入才为true（放水）

ability 和 check 都为可选

```js
// 已关闭 -> input:false -> disabled:true -> 禁用
// admin -> 可用
field: {
    disabled: [{
        check: {
            status: { $ne: 'closed' }
        }
    }]
}

// 有管理员权限时不禁用
// 没有admin权限 -> input: false -> disabled: true -> 禁用
// 有admin权限 -> input: true -> disabled: false -> 可用
field: {
    disabled: [{
        ability: 'admin'
    }]
}


// 有admin权限或root权限时不禁用
// user -> input (false false) -> disabled:true -> 禁用
// admin -> input (true false) -> disabled:false -> 可用
field: {
    disabled: [{
        ability: 'admin'
    },{
        ability: 'root'
    }]
}

// 空数组代表true
field: {
    disabled: []
}
```



### 示例

```js
// A 用户可以改自己的，未完成的，订单
// B 客户经理可以更改自己用户的订单
// C 区域经理可以更改区域内的用户订单
// D 超级管理员可以管理所有订单

field: {
    disabled: [
        {
            // 判断 order.update 权限，并且要求满足 user 关系
            ability: 'order.update:user',
            check: {
                status: { $ne: 'closed' }
            }
        },
        {
            // 判断 order.update 权限，并且要求满足 customer-manager 关系
            ability: 'order.update:customer-manager',
            check: {
                status: { $ne: 'closed' }
            }
        },
        {
            // 判断 order.update 权限，并且要求满足 customer-manager 关系
            ability: 'order.update:regional-manager'
        },
        {
            // 管理员可以任意修改，无论 status 状态是什么
            ability: 'root'
        }
    ]
}
```

```js
// A 买家可以修改未付款的订单地址
// B 卖家可以修改价格
// C 管理员都可以修改

{
    address: {
        disabled: [{
            ability: 'order.update:user',
            check: {
                status: 200
            }
        },{
            ability: 'admin'
        }]
    },
    price: {
        disabled: [{
            ability: 'order.update:seller'
        },{
            // 管理员，拥有更新所有订单的权限
            ability: 'order.update:all'
        }]
    }
}
```







