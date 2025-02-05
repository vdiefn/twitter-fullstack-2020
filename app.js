if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const exphbs = require('express-handlebars')
const routes = require('./routes')
const methodOverride = require('method-override')
const helpers = require('./_helpers')
const handlebarsHelpers = require('./helpers/handlebars-helpers')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const path = require('path')

const app = express()
const port = process.env.PORT || 3000

// use helpers.getUser(req) to replace req.user
// use helpers.ensureAuthenticated(req) to replace req.isAuthenticated()

app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs', helpers: handlebarsHelpers }))
app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true })) // body-Parser
app.use(methodOverride('_method')) // methodOverride
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true })) //session
app.use(passport.initialize()) //passport
app.use(passport.session()) //passport
app.use(flash())// connect-flash
app.use('/upload', express.static(path.join(__dirname, 'upload')))//上傳圖片
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.wrong_messages = req.flash('wrong_messages')
  res.locals.error_messages = req.flash('error_messages')
  // res.locals.error_reply = req.flash('error_reply')
  res.locals.user = helpers.getUser(req)
  next()
})

app.use(routes)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

module.exports = app
