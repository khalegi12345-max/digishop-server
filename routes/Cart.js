const express = require('express')
const router = express.Router()
const Cart = require('../models/Cart')
const jwt = require('jsonwebtoken')

// middleware برای چک کردن توکن
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'توکن نداری!' })
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ message: 'توکن نامعتبره!' })
  }
}

// گرفتن سبد خرید
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
    res.json(cart || { items: [] })
  } catch {
    res.status(500).json({ message: 'خطای سرور!' })
  }
})

// اضافه کردن به سبد
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { productId, title, price, image } = req.body
    
    let cart = await Cart.findOne({ user: req.user.id })
    
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] })
    }
    
    cart.items.push({ productId, title, price, image })
    await cart.save()
    
    res.json(cart)
  } catch {
    res.status(500).json({ message: 'خطای سرور!' })
  }
})

// حذف از سبد
router.delete('/remove/:productId', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
    if (!cart) return res.status(404).json({ message: 'سبد پیدا نشد!' })
    
    cart.items = cart.items.filter(
      item => item.productId !== parseInt(req.params.productId)
    )
    await cart.save()
    
    res.json(cart)
  } catch {
    res.status(500).json({ message: 'خطای سرور!' })
  }
})

module.exports = router