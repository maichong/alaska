# Changelog

## [0.12.10]

### Added

- 管理平台支持快速编辑
- 管理平台支持批量编辑

### Fixed

- 加载多语言BUG
- 模型字段 _id 非显示声明，Model.createFilters 无效BUG
- SettingsEditor 上传图片BUG

## [0.12.9]

### Added

- field.depends 支持 DependsQueryExpression 语法
- field.hidden 支持 DependsQueryExpression 语法
- field.super 支持 DependsQueryExpression 语法
- field.disabled 支持 DependsQueryExpression 语法
- 增加 group.ability
- 增加 group.depends 并支持 DependsQueryExpression 语法
- 增加 group.hidden 并支持 DependsQueryExpression 语法
- 增加 group.super 并支持 DependsQueryExpression 语法
- 增加 group.disabled 并支持 DependsQueryExpression 语法
- 增加 group.wrapper 支持Group自定义Wrapper
- action.depends 支持 DependsQueryExpression 语法
- action.super 支持 DependsQueryExpression 语法
- 增加 action.ability
- 增加 action.disabled 并支持 DependsQueryExpression 语法
- 增加 action.hidden 并支持 DependsQueryExpression 语法
- 增加 action.after 排序
- 模型增加 preview 设置，可以在后台数据列表中插入自定义组件

### Changed

- Model.createFiltersByContext 变更为async函数
- Model.defaultFilters 支持async函数
- AdminMenu ability 字段从数组改为字符串
- 取消了模型中 action = false 简写方式，请使用 action:{ hidden:true }


## [0.12.8]

### Added

- 自动识别 .html 结尾的路径到控制器，比如 `/about.html` 指向 'about' 控制器
- 自动捕获Node.js unhandledRejection错误，并直接退出程序，如果不希望退出程序，请在主Service中配置`unhandledRejectionExit`为false

### Changed

- 重新规划了 admin view 组件、调整了样式
- `less/admin.less` 需要增加 `@import "../node_modules/alaska-admin-view/less/variables.less";` [参考](https://github.com/maichong/alaska-init/blob/goods/less/admin.less)

### Fixed

- Windows 系统中模板加载BUG
- 模型中如果不存在number或Date类型字段，API接口报错的BUG



## [0.12.5]

### Changed

- alaska build 命令会自动将src中的代码转码到dist目录中，不需要再单独使用babel命令转码，同时src目录下的非代码文件会被复制到dist目录
- alaska-modules 生成的 modules.js 中的 templatesDirs 配置项，路径变为与主Service.dir的相对路径，而非与工作目录的相对路径

## [0.12.3]

### Changed

- 废弃flow-alaska，使用flow-declarations

## [0.12.0]

### Added

- 增加了各个包package.json中alaska字段，标明各个package类型。
- 增加了alaksa.hasService() 方法。
- 增加了service.hasModel() 方法。
- 增加了service.hasSled() 方法。
- 增加了plugins配置项，可以指定Service启动时所需挂载的插件。
- 增加了自定义routes机制，所有routes目录下的文件必须导出default function，在启动时会按文件名称顺序逐一调用，参数为当前Service的router。
- 增加alaska-modules库，用于启动时收集项目模块信息，核心库中去除所有require动态加载。alaska-modules有两种用法，一种是每次启动时调用alaska-modules收集项目信息，推荐用于开发环境。另一种是使用alaska build命令自动生成modules.js文件，项目启动时候只需要require这个文件，不用再动态检查项目信息，可以实现高速启动、去动态加载，推荐用于生产环境。
- 子Service引用配置增加 optional 选项。
- Model增加 pre register 和 post register 钩子。

### Changed

- 升级react到v16
- 升级react-router到v4
- 允许生产环境运行时去除babel依赖
- service.applyConfig() 方法使用 [RFC 7396](https://tools.ietf.org/html/rfc7396) 标准合并配置
- alaska.service() 更名为 alaska.getService() 并且取消了optional 参数，不再动态加载Service，如果要得到的Service未加载，则抛出异常
- alaska.config() 更名为 alaska.getConfig()
- service.config() 更名为 service.getConfig()
- service.model() 更名为 serivce.getModel() 并且取消了optional 参数
- service.sled() 更名为 service.getSled()
- Model.name 变更为 Model.modelName
- Sled.name 变更为 Sled.sledName
- alaska-admin static 目录重命名为 statics，需要更新配置。[参考](https://github.com/maichong/alaska/blob/master/example/config/alaska-admin.js)
- 去除Service级别 middlewares，appMiddlewares 配置变更为 middlewares，即老版本middlewares指的是Service上挂载的中间件，而0.12新版本middlewares指的是App上挂载的中间件。
- 允许子Service中定义middlewares，从而更新主Service的middlewares配置。
- middlewares配置中各个中间件会依据其id，而从主Service中获取默认中间件配置，类似field获取默认配置。
- alaska-field-image-aliyun 底层OSS驱动从aliyun-sdk 更换为 ali-oss，需要更新配置。 [参考](https://github.com/maichong/alaska/tree/master/src/alaska-field-image-aliyun)
- 主Service源码目录存放于 src 文件夹中，可以参考 [example项目目录](https://github.com/maichong/alaska/tree/master/example)。
- Model.register() 方法变更为async函数

### Removed

- 移除了alaska.try()方法
- 移除了service.getCacheDriver()方法，请使用service.createDriver()代替
- 移除了controllers 、 api 和 templates 配置项
- 移除了service.addConfigDir() 方法
- 移除Service级别middleware，middlewares中的文件不会被自动加载


## [0.11.29] - 2017-09-25

### Added

- 允许重新定义Model的 CURD actions，add/create/update/remove

### Changed

- Admin View settings Redux 取消了 seamless-immutable
- Model.noedit 变更为 Model.noupdate
- 列表页面和编译页面的create Action 变为 add Action
- 编辑页面 save Action 变为 update Action
- 调整后，add 代表新建按钮，点击后能够打开新的空白表单；create表示空白页面显示的保存按钮；update表示已有记录的修改保存按钮；remove表示删除按钮

