import mongoose from 'mongoose';
import { mongooseConnect } from '@/lib/mongoose';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category'; // Import the Category model
import { isAdminRequest } from './auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    await mongooseConnect();
    // await isAdminRequest();
    

    switch (req.method) {
      case 'GET':
        if (req.query?.id) {
          const product = await Product.findById(req.query.id).populate('category');
          return product 
            ? res.json(product)
            : res.status(404).json({ error: 'Product not found' });
        } else {
          const products = await Product.find().sort({ createdAt: -1 }).populate('category');
          return res.json(products);
        }

      case 'POST': {
        const { title, description, properties = {}, price, category, images = [] } = req.body;
        if (!title || price === undefined || isNaN(price)) {
          return res.status(400).json({ error: 'Valid title and price are required' });
        }
        // Validate category
        if (category && !mongoose.isValidObjectId(category)) {
          return res.status(400).json({ error: 'Invalid category ID' });
        }
        // Validate properties
        if (typeof properties !== 'object' || Array.isArray(properties)) {
          return res.status(400).json({ error: 'Properties must be an object' });
        }
        // Validate images
        if (!Array.isArray(images) || images.some(img => typeof img !== 'string')) {
          return res.status(400).json({ error: 'Images must be an array of strings' });
        }
        try {
          const productDoc = await Product.create({
            title,
            description: description || '',
            price: Number(price),
            images,
            category: category || null,
            properties,
          });
          return res.status(201).json(productDoc);
        } catch (err) {
          console.error('Create error:', err);
          return res.status(500).json({ 
            error: 'Create failed',
            details: err.message 
          });
        }
      }

      case 'PUT': {
        const { images: productImages, properties = {}, category, _id, ...updateData } = req.body;
        if (!_id) {
          return res.status(400).json({ error: 'Product ID is required' });
        }
        // Validate category
        if (category && !mongoose.isValidObjectId(category)) {
          return res.status(400).json({ error: 'Invalid category ID' });
        }
        // Validate properties
        if (typeof properties !== 'object' || Array.isArray(properties)) {
          return res.status(400).json({ error: 'Properties must be an object' });
        }
        // Validate images
        if (productImages && (!Array.isArray(productImages) || productImages.some(img => typeof img !== 'string'))) {
          return res.status(400).json({ error: 'Images must be an array of strings' });
        }
        try {
          const updatedProduct = await Product.findByIdAndUpdate(
            _id,
            { 
              ...updateData, 
              images: productImages,
              category: category || null,
              properties, // Include properties in the update object
            },
            { new: true, runValidators: true } // Fixed syntax: removed extra argument and added comma
          );
          return updatedProduct
            ? res.json(updatedProduct)
            : res.status(404).json({ error: 'Product not found' });
        } catch (err) {
          console.error('Update error:', err);
          return res.status(500).json({ 
            error: 'Update failed',
            details: err.message 
          });
        }
      }
      
      case 'DELETE':
        if (!req.query?.id) {
          return res.status(400).json({ error: 'Product ID is required' });
        }
        const deletedProduct = await Product.findByIdAndDelete(req.query.id);
        return deletedProduct
          ? res.json({ message: 'Product deleted successfully' })
          : res.status(404).json({ error: 'Product not found' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }

  } catch (error) {
    console.error('API Error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: Object.values(error.errors).map(err => err.message),
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid data',
        details: `Invalid ${error.path}: ${error.value}`,
      });
    }
    return res.status(500).json({
      error: 'Server error',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
}