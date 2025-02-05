const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')
require('dayjs/locale/zh-tw')
dayjs.locale('zh-tw')
dayjs.extend(relativeTime)

module.exports = {
  ifCond: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  }, // Handlebars Helper：ifCond
  relativeTimeFromNow: a => dayjs(a).fromNow(), // 取得相對時間
  tweetCreateTime: a => dayjs(a).format('a hh:mm．YYYY[年]MM[月]DD[日]')
}