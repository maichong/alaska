# 用户资源关系检查



## RBAC

Alaska的权限控制采用的是RBAC模型（基于角色的权限访问控制），主要由三个实体，Ability、Role、User。

Ability是指一种能力（权限），一个用户可以拥有多种能力，比如创建订单、读取订单。

Role是一个拥有多种能力的角色，本质上是Ability的集合，用户可以同时拥有多个角色。

系统中的每一种实体数据对应多个Ability，例如订单对应的能力有：

- alaska-order.Order.create
- alaska-order.Order.update
- alaska-order.Order.read
- alaska-order.Order.export
- alaska-order.Order.remove
- 其他自定义action权限

如果一个用户拥有的能力中有 alaska-order.Order.remove，那么该用户就拥有了删除订单的权限。所以，通过规划Ability、Role、User三者的对应关系，就可以对系统中各种数据进行权限控制。

但是，仅此还不够，因为当用户拥有 alaska-order.Order.remove 权限后，就能删除系统中的所有订单，我们无法实现下列高级需求：

- 用户只能删除自己的订单
- 客户经理可以删除自己所负责的客户的订单
- 区域经理可以删除自己负责区域内的订单

原因是，上述RBAC权限控制，只能够实现对不同资源类型进行权限控制，权限控制的粒度是资源类型，而更高一级的需求是能够检查每条数据记录，资源控制粒度是数据记录级。

我们将Web服务的权限控制分为5个等级：

| 等级 | 说明                                                         |
| ---- | ------------------------------------------------------------ |
| L1   | 没有身份认证，所有接口可以直接访问                           |
| L2   | 只判断是否登录，不区分角色                                   |
| L3   | RBAC，可控制不同角色能够访问的资源类型                       |
| L4   | 拥有者验证，在L3基础上判断是否是资源拥有者，比如用户只能看到自己的订单 |
| L5   | 任意的用户资源关系检查                                       |

其实 L4 拥有者验证，也只是一种特殊的用户资源关系。



## URRC

User resource relation check (URRC) 是alaska 0.14新引入的概念，是对权限控制机制的进一步扩展，可以实现更加灵活的资源权限控制。

在对用户授权时， alaska-order.Order.remove 能力就代表该用户可以删除系统中的所有订单，alaska-order.Order.remove:user 就代表只能删除自己拥有的订单，冒号后边的 `user` 是一个检查器。该检查器的实现是：

```js
{
  check(user: any, record: any): boolean {
    return record.user && String(record.user) === String(user.id);
  },
  filter(user: any) {
    return {
      user: user._id || user.id
    };
  }
}
```

检查器对象需要实现两个函数：

 `check(user: any, record: any): boolean|Promise<boolean>;`

用于检查当前用户和指定的数据记录是否存在指定关联。

`filter(user: any): Filters | Promise<Filters>;`

用户创建一个查询过滤器，比如列订单列表时，在查询数据库时用作查询条件，而不是将数据库中所有记录都读出来再一条一条check。

这两个函数都支持异步，所以就支持任意复杂的关系检查，比如check时需要查询中间表的需求：

- 客户经理可以删除自己所负责的客户的订单，客户-经理关系表为中间表
- 区域经理可以删除自己负责区域内的订单，地区表负责人表为中间表



## 自定义关系检查器

 

## 检查用户权限

`userService.hasAbility(user: User | null, ability: string, record?: Model): Promise<boolean>`

