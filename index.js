const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('دیتابیس وصل شد!'))
  .catch((err) => console.log('خطا:', err))

const authRoutes = require('./routes/auth')
const cartRoutes = require('./routes/cart')

app.use('/api/auth', authRoutes)
app.use('/api/cart', cartRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'سرور کار میکنه!' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log('سرور روی پورت ' + PORT + ' کار میکنه')
})