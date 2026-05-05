const mongoose = require('mongoose')

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      productId: { type: Number, required: true },
      title: { type: String, required: true },
      price: { type: Number, required: true },
      image: { type: String, required: true }
    }
  ]
}, { timestamps: true })

module.exports = mongoose.model('Cart', CartSchema)