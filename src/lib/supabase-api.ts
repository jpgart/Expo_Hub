import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

// Products API using Supabase
export const supabaseProductsApi = {
  // Get all products with filtering and search
  async getProducts({
    page = 1,
    limit = 10,
    categories,
    search
  }: {
    page?: number;
    limit?: number;
    categories?: string;
    search?: string;
  }) {
    try {
      let query = supabase.from('products').select('*', { count: 'exact' });

      // Apply category filter
      if (categories) {
        const categoriesArray = categories.split('.');
        query = query.in('category', categoriesArray);
      }

      // Apply search filter
      if (search) {
        query = query.or(
          `name.ilike.%${search}%, description.ilike.%${search}%, category.ilike.%${search}%`
        );
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      const { data: products, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        time: new Date().toISOString(),
        message: 'Products retrieved successfully',
        total_products: count || 0,
        offset,
        limit,
        products: products || []
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        success: false,
        message: 'Failed to fetch products',
        total_products: 0,
        offset: 0,
        limit,
        products: []
      };
    }
  },

  // Get all products (for dropdown/filters)
  async getAllProducts({
    categories = [],
    search
  }: {
    categories?: string[];
    search?: string;
  }) {
    try {
      let query = supabase.from('products').select('*');

      // Apply category filter
      if (categories.length > 0) {
        query = query.in('category', categories);
      }

      // Apply search filter
      if (search) {
        query = query.or(
          `name.ilike.%${search}%, description.ilike.%${search}%, category.ilike.%${search}%`
        );
      }

      const { data: products, error } = await query;

      if (error) {
        throw error;
      }

      return products || [];
    } catch (error) {
      console.error('Error fetching all products:', error);
      return [];
    }
  },

  // Get product by ID
  async getProductById(id: number) {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        time: new Date().toISOString(),
        message: `Product with ID ${id} found`,
        product
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      return {
        success: false,
        message: `Product with ID ${id} not found`
      };
    }
  },

  // Create new product
  async createProduct(productData: ProductInsert) {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Product created successfully',
        product
      };
    } catch (error) {
      console.error('Error creating product:', error);
      return {
        success: false,
        message: 'Failed to create product'
      };
    }
  },

  // Update product
  async updateProduct(id: number, productData: ProductUpdate) {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .update({ ...productData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Product updated successfully',
        product
      };
    } catch (error) {
      console.error('Error updating product:', error);
      return {
        success: false,
        message: 'Failed to update product'
      };
    }
  },

  // Delete product
  async deleteProduct(id: number) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Product deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting product:', error);
      return {
        success: false,
        message: 'Failed to delete product'
      };
    }
  },

  // Get unique categories
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);

      if (error) {
        throw error;
      }

      // Extract unique categories
      const categories = [...new Set(data?.map((item) => item.category) || [])];
      return categories.sort();
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }
};

// Kanban API using Supabase
export const supabaseKanbanApi = {
  // Get all columns
  async getColumns() {
    try {
      const { data: columns, error } = await supabase
        .from('kanban_columns')
        .select('*')
        .order('position', { ascending: true });

      if (error) {
        throw error;
      }

      return columns || [];
    } catch (error) {
      console.error('Error fetching columns:', error);
      return [];
    }
  },

  // Get all tasks
  async getTasks() {
    try {
      const { data: tasks, error } = await supabase
        .from('kanban_tasks')
        .select('*')
        .order('position', { ascending: true });

      if (error) {
        throw error;
      }

      return tasks || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },

  // Create new task
  async createTask(
    taskData: Database['public']['Tables']['kanban_tasks']['Insert']
  ) {
    try {
      const { data: task, error } = await supabase
        .from('kanban_tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Update task
  async updateTask(
    id: string,
    taskData: Database['public']['Tables']['kanban_tasks']['Update']
  ) {
    try {
      const { data: task, error } = await supabase
        .from('kanban_tasks')
        .update({ ...taskData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return task;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Delete task
  async deleteTask(id: string) {
    try {
      const { error } = await supabase
        .from('kanban_tasks')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Create new column
  async createColumn(
    columnData: Database['public']['Tables']['kanban_columns']['Insert']
  ) {
    try {
      const { data: column, error } = await supabase
        .from('kanban_columns')
        .insert([columnData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return column;
    } catch (error) {
      console.error('Error creating column:', error);
      throw error;
    }
  },

  // Update column
  async updateColumn(
    id: string,
    columnData: Database['public']['Tables']['kanban_columns']['Update']
  ) {
    try {
      const { data: column, error } = await supabase
        .from('kanban_columns')
        .update(columnData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return column;
    } catch (error) {
      console.error('Error updating column:', error);
      throw error;
    }
  },

  // Delete column
  async deleteColumn(id: string) {
    try {
      // First delete all tasks in this column
      await supabase.from('kanban_tasks').delete().eq('column_id', id);

      // Then delete the column
      const { error } = await supabase
        .from('kanban_columns')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting column:', error);
      throw error;
    }
  }
};
