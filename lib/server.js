/**
 * 关联插件：Lenovobox 文件关联
 */
'use strict'

const config = require('../config')
const Koa = require('koa')
const router = require('koa-router')()
const request = require('request-promise')
const auth = require('./auth')
const qs = require('querystring')
const path = require('path')
const jsoner = require('./jsoner')

const app = new Koa()

// 加载文件夹列表
router.get('/folders', function * () {
  let authToken = jsoner.readJSONFile()[this.state.userId]
  if (!authToken) {
    this.status = 401
    this.body = { message: 'needAuth' }
    return
  }
  this.body = [{
    title: '个人文件',
    itemsUrl: `${config.host}/folder/my`
  }]
})

// 加载每个菜单下的文件列表
router.get('/folder/:subFolder', function * () {
  let authToken = jsoner.readJSONFile()[this.state.userId]
  let headers = {
    'Cookie': `X-LENOVO-SESS-ID=${authToken}`
  }
  let queryJSON = {
    path_type: 'self',
    include_deleted: false,
    limit: this.request.query.count,
    offset: this.request.query.page * this.request.query.count,
    sort: 'asc',
    orderby: 'mtime',
    _: new Date().getTime()
  }
  let urlPrefix = `${config.lenovobox.host}/v2/metadata/databox/${encodeURIComponent(this.params.subFolder.split('-').join('/')).replace(/%2F/g, '/')}`
  if (this.params.subFolder === 'my') {
    urlPrefix = `${config.lenovobox.host}/v2/metadata/databox`
  }
  let data = yield request({
    method: 'GET',
    url: `${urlPrefix}?${qs.stringify(queryJSON)}`,
    json: true,
    headers: headers
  }).then(function (body) {
    return body.content.map(function (folder) {
      if (folder.is_dir) {
        return {
          title: path.basename(folder.path),
          itemsUrl: `${config.host}/folder/${encodeURIComponent(folder.path.substr(1).split('/').join('-'))}`
        }
      } else {
        return {
          title: path.basename(folder.path),
          redirectUrl: `${config.lenovobox.downloadHost}/v2/files/databox${encodeURIComponent(folder.path).replace(/%2F/g, '/')}`
        }
      }
    })
  })
  this.body = data
})

app.use(require('./lenovobox').routes())
// 可选：加载权限验证中间件
// 通过 header X-Teambition-Sign 验证 Teambition 用户 id
app.use(auth({
  clientId: config.app.client_id,
  clientSecret: config.app.client_secret
}))
app.use(router.routes())

app.listen(config.port || 10000, function () {
  console.log(`Server listen on ${config.port || 10000}`)
})
