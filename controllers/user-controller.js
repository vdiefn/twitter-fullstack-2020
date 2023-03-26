const { User, Tweet, Reply } = require('../models')
const bcrypt = require('bcryptjs')
const helpers = require('../_helpers')

const userController = {
  signUpPage: (req, res) => { // 登入
    return res.render('signup')
  },
  signUp: (req, res, next) => {
    const { account, name, email, password, passwordCheck } = req.body
    if (!name || !email || !password || !account || !passwordCheck) throw new Error('所有欄位都是必填。')
    if (password !== passwordCheck) throw new Error('密碼不相同')
    return Promise.all([
      User.findOne({ where: { email } }),
      User.findOne({ where: { account } })
    ])
      .then(([emailCheck, accountCheck]) => {
        if (emailCheck) throw new Error('此信箱已被註冊過')
        if (accountCheck) throw new Error('此帳號已被註冊過')
        return bcrypt.hash(password, 10)
      })
      .then(hash => {
        return User.create({
          account,
          name,
          email,
          password: hash
        })
      })
      .then(() => {
        req.flash('success_messages', '成功註冊帳號！')
        res.redirect('/signin')
      })
      .catch(err => next(err))
  },
  signInPage: (req, res) => { // 註冊
    return res.render('signin')
  },
  signIn: (req, res, next) => {
    console.log(123)
    res.redirect('/tweets')
  },
  getUser: async (req, res) => { // 取得個人資料頁面(推文清單)
    let [users, user] = await Promise.all([
      User.findAll({ where: { role: 'user' }, raw: true, nest: true, attributes: ['id'] }),
      User.findByPk((req.params.id), {
        where: { role: 'user' },
        include: [
          Tweet,
          { model: Tweet, as: 'LikedTweets', include: [User] },
        ],
        order: [
          ['Tweets', 'createdAt', 'DESC'],
        ],
      }),
    ])
    return res.render('users', { users: user.toJSON(), })
  },
  getSetting: (req, res,) => { // 取得帳戶設定頁面
    return User.findByPk(helpers.getUser(req).id)
      .then(user => {
        user = user.toJSON()
        const { name, account, email } = user
        return res.render('setting', { name, account, email })
      })
  },
  putSetting: (req, res, next) => { // 編輯帳戶設定
    const { account, name, email, password, passwordCheck } = req.body
    if (!name || !email || !password || !account || !passwordCheck) throw new Error('所有欄位都是必填。')
    if (password !== passwordCheck) throw new Error('密碼不相同')
    return Promise.all([
      User.findOne({ where: { email } }),
      User.findOne({ where: { account } })
    ])
      .then(([emailCheck, accountCheck]) => {
        if (emailCheck) throw new Error('此信箱已被註冊過')
        if (accountCheck) throw new Error('此帳號已被註冊過')
        return User.findOne({ where: { id: "2" } })
      })
      .then(user => {
        return user.update({
          name,
          email,
          account,
          password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
        })
      })
      .then(() => {
        req.flash('success_messages', '帳戶設定編輯成功!')
        return res.redirect('setting')
      })
      .catch(err => next(err))
  },
  getFollower: (req, res, next) => { // 跟隨者
    res.render('follower')
  },
  getFollowing: (req, res, next) => { // 跟隨中
    res.render('following')
  },
  addFollowing:(req, res, next) => { //追蹤功能
    
    Promise.all([
      User.findByPk(userId),
      Followship.findOne({
        where: {
          followerId: helpers.getUser(req).id,
          followingId: req.params.userId
        }
      })
    ])
      .then(([user, followship]) => {
        if(!user) throw new Error("User didn't exist!")
        if(!followship) throw new Error('You are already Following this user!')
        return Followship.create({
          followerId: helpers.getUser(req).id,
          followingId: req.params.userId
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFollowing:(req, res, next) => {
    return Followship.findOne({
      where: {
        followerId: helpers.getUser(req).id,
        followingId: req.params.userId
      }
    })
      .then(followship => {
        if (!followship) throw new Error("You haven't followed this user!")
        return followship.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  logout: (req, res) => { // 登出
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getFollowship: (req, res, next) => {
    return User.findAll({
      include: [
        { model: User, as: 'Followers' },
      ],
    })
      .then(users => {
        const limit = 10
        // 整理 users 資料，把每個 user 項目都拿出來處理一次，並把新陣列儲存在 users 裡
        users = users.map(user => ({
          // 整理格式
          ...user.toJSON(),
          // // 計算追蹤者人數(還沒用到)
          followerCount: user.Followers.length,
          // 判斷目前登入使用者是否已追蹤該 user 物件
          isFollowed: helpers.getUser(req).Followings.some(f => f.id === user.id)
         }))
         console.log(users)
        res.locals.getFollowship = users
        return next()
      })
      .catch(err => next(err))
  }
}

module.exports = userController

