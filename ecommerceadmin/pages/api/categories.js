import { mongooseConnect } from "@/lib/mongoose";
import { Category } from "@/models/Category";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();
  const session=await getServerSession(req,res,authOptions);
  console.log(session);


  try {
    if (method === 'GET') {
      const categories = await Category.find().populate('parent');
      res.json(categories);
    }

    if (method === 'POST') {
      const { name, parentCategory,properties } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
      }
      const categoryDoc = await Category.create({
        name,
        parent: parentCategory || null,
        properties,
      });
      res.json(categoryDoc);
    }

    if (method === 'PUT') {
      const { _id, name, parentCategory,properties } = req.body;
      
      if (!_id || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const updateData = {
        name,
        parent: parentCategory || null,
        properties,
      };

      const updatedCategory = await Category.findByIdAndUpdate(
        _id,
        updateData,
        { new: true, runValidators: true }
      ).populate('parent');

      if (!updatedCategory) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json(updatedCategory);
    }

    if (method === 'DELETE') {
      const { _id, force } = req.query;
      if (!_id) {
        return res.status(400).json({ error: 'Category ID is required' });
      }
    
      // Check if category has children
      const childCategories = await Category.find({ parent: _id });
      
      if (childCategories.length > 0) {
        if (force === 'true') {
          // Force delete - first delete all children, then the parent
          await Category.deleteMany({ parent: _id });
          const deletedCategory = await Category.findByIdAndDelete(_id);
          res.json({ message: 'Category and all subcategories deleted successfully' });
        } else {
          const childNames = childCategories.map(c => c.name).join(', ');
          return res.status(400).json({ 
            error: `Cannot delete category because it has subcategories: ${childNames}. Add force=true to delete anyway.`
          });
        }
      } else {
        // No children - safe to delete
        const deletedCategory = await Category.findByIdAndDelete(_id);
        if (!deletedCategory) {
          return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
      }
    }

  } catch (error) {
    console.error('Error in categories API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
}