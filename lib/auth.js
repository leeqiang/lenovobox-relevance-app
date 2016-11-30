'use strict'
const jwt = require('jsonwebtoken')

module.exports = function (options) {
  return function * (next) {
    if (!options.clientId || !options.clientSecret) {
      return yield next
    }
    let signData = {}
    try {
      signData = jwt.verify(this.headers['x-teambition-sign'], options.clientSecret)
    } catch (err) {
      let verifyError = new Error('Verify error')
      verifyError.status = 400
      throw verifyError
    }

    // client id 不匹配
    if (signData.client_id !== options.clientId) {
      let invalidClientIdError = new Error('Invalid client id')
      invalidClientIdError.status = 400
      throw invalidClientIdError
    }

    // 签名超过 60 秒
    // if (((Date.now() / 1000) - signData.iat) > 60) throw new Error('Sign out of date')

    // 保存 Teambition 用户 id
    this.state.userId = signData.user_id
    yield next
  }
}
