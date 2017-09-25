# Changelog



## [0.11.29] - 2017-09-25

### Added

- 允许重新定义Model的 CURD actions，add/create/update/remove

### Changed

- Admin View settings Redux 取消了 seamless-immutable
- Model.noedit 变更为 Model.noupdate
- 列表页面和编译页面的create Action 变为 add Action
- 编辑页面 save Action 变为 update Action
- 调整后，add 代表新建按钮，点击后能够打开新的空白表单；create表示空白页面显示的保存按钮；update表示已有记录的修改保存按钮；remove表示删除按钮

