const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const jwt = require('jsonwebtoken')

// middleware ادمین
const adminMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'توکن نداری!' })
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded.isAdmin) return res.status(403).json({ message: 'دسترسی نداری!' })
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ message: 'توکن نامعتبره!' })
  }
}

// GET همه محصولات
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query
    
    let filter = {}
    
    if (category) filter.category = category
    if (search) filter.title = { $regex: search, $options: 'i' }
    
    const products = await Product.find(filter)
    res.json(products)
  } catch {
    res.status(500).json({ message: 'خطای سرور!' })
  }
})

// GET یه محصول
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'محصول پیدا نشد!' })
    res.json(product)
  } catch {
    res.status(500).json({ message: 'خطای سرور!' })
  }
})

// POST اضافه کردن محصول (فقط ادمین)
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const product = new Product(req.body)
    await product.save()
    res.status(201).json(product)
  } catch {
    res.status(500).json({ message: 'خطای سرور!' })
  }
})

// PUT ویرایش محصول (فقط ادمین)
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!product) return res.status(404).json({ message: 'محصول پیدا نشد!' })
    res.json(product)
  } catch {
    res.status(500).json({ message: 'خطای سرور!' })
  }
})

// DELETE حذف محصول (فقط ادمین)
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    res.json({ message: 'محصول حذف شد!' })
  } catch {
    res.status(500).json({ message: 'خطای سرور!' })
  }
})

module.exports = router