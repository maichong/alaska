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

检查条件为数组时，为 `AND` 查询，并且支持用户权限检查

```js
// 有管理员权限时不禁用
// user -> true
// admin -> false
field: {
    disabled: [{
        ability: 'admin'
    }]
}

// 有管理员权限时候禁用
// user -> false
// admin -> true
field: {
    disabled: [{
        ability: 'admin',
        check: true
    }]
}

// 有admin权限或root权限时不禁用
// user -> false
// admin -> false
field: {
    disabled: [{
        ability: 'admin'
    },{
        ability: 'root'
    }]
}

field: {
    disabled: [{
        ability: 'admin',
        check: true
    }]
}
```









