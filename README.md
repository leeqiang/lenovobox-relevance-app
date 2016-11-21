# 关联 Lenovobox 插件开发手册

该插件支持将 Lenovobox 关联到 Teambition 任务上。

TODO
- <del>单文件查看地址</del>
- <del>中文文件夹的问题</del>
- 认证机制

## 配置文件
```json
{
  "name": "Lenovobox Relevance App For Teambition",
  "host": "http://192.168.0.127:8080",
  "app": {
    "client_id": "baa74ec0-afbf-11e6-83c9-1960e6f4542f",
    "client_secret": "31a22bd9-7113-4628-a433-ce8fb3fe87d4",
    "description": "创建 teambition 应用，并配置 client_id & client_secret"
  },
  "lenovobox": {
    "host": "http://xx.xxx.xxx.xxx",
    "downloadHost": "http://xx.xxx.xxx.xxx"
  }
}
```

## 第一步, 配置 lenovobox 服务地址及下载地址

```
lenovobox: {
  host: "http://xx.xxx.xxx.xxx",
  downloadHost: "http://xx.xxx.xxx.xxx"
}
```

## 第二步，注册 Teambition 应用

访问[应用中心](https://www.teambition.com/appstore/mine)创建自己的应用，选择类型为`关联插件`，并填写菜单 api 地址。

注: 私有部署客户，请访问 http://internal_tb_host/appstore/mine

菜单地址: `http(s)://your_app_host/path/to/menu_api_suffix`
(如: http://example.com/themes)


注册成功后, 将`client_id`及`client_secret`补充到配置文件中
```
app: {
  client_id: '',
  client_secret: ''
}
```

## 第二步，开发应用

关联插件需要提供两个API, 具体数据结构可查看代码
- 菜单列表的 API(`/folder/my`)
- 子项内容的 API(`/folder/:subFolder`)

网盘接口: `/v2/metadata/databox`
网盘接口: `/v2/files/databox`

如果列表内容较多需要分页，关联插件会主动添加 `count` 和 `page` 参数，供开发者实现分页功能。

发送到关联应用的请求中会带上 `X-Teambition-Sign` 请求头参数，开发者可根据创建应用时获得的 clientId 和 clientSecret 自行验证请求是否合法，同时可从签名中取得 Teambition 用户 id。具体校验规则参考 [auth.js](./lib/auth.js)。

## 第三步，安装应用

点击应用中心的「测试安装」按钮，将应用安装到自己的项目中

## 第四步，调试应用

回到项目中，点开任意任务的「关联内容」按钮，可以在左侧看到新安装的应用

选择一条关联内容，点击「完成」，一条新的关联内容就生成了

## 恭喜你，完成了一个关联应用

安装到测试项目试试把。
