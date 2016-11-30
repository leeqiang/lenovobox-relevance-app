'use strict'
const router = require('koa-router')()
const config = require('../config')
const jsoner = require('./jsoner')
const crypto = require('crypto')
const _ = require('lodash')

const checkAppSign = function (params, secret) {
  params = _.clone(params)
  let sign = params.sign
  delete params.sign

  let raw = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&') + `&clientSecret=${secret}`

  return crypto.createHash('md5').update(raw).digest('hex') === sign
}

// 授权地址
router.get('/folders/auth', function * (next) {
  let isValid = checkAppSign(this.query, config.app.client_secret)
  if (!isValid) throw new Error('Verify error')
  yield next
}, function * () {
  let tokens = jsoner.readJSONFile()
  tokens[this.query._userId] = this.cookies.get('X-LENOVO-SESS-ID')
  jsoner.writeJSONFile(tokens)
  this.redirect(config.redirectUrl)
})

module.exports = router
