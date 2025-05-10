// models/Category.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const CategorySchema = new Schema({
  name: { type: String, required: true },
  parent: { type: mongoose.Types.ObjectId, ref: 'Category', default: null },
  properties: [{
    name: { type: String, required: true },
    values: [String],
    type: { type: String, enum: ['text', 'number'], default: 'text' }
  }]
}, { timestamps: true });

export const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);