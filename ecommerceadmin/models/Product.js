import mongoose from 'mongoose';

const { Schema } = mongoose;

const ProductSchema = new Schema({
  title: { type: String, required: [true, 'Title is required'] },
  description: String,
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  images: [{ type: String }],
  category: { type: mongoose.Types.ObjectId, ref: 'Category' },
  properties: { type: Object },
}, { timestamps: true });

// Check if model already exists to prevent OverwriteModelError
export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);