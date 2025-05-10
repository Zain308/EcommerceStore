// models/Order.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const OrderSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  line_items: { type: Array, required: true },
}, { timestamps: true });

export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);