import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Wand2, Loader2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiClient from '../../lib/apiClient';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';

export default function ManageProducts() {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_vegetarian: true,
    is_vegan: false,
    is_gluten_free: false,
    is_spicy: false,
    spice_level: 0,
    preparation_time_minutes: 30,
    status: 'active',
    variants: [] as Array<{ name: string; price: string | number; is_available: boolean }>
  });

  const { data: productsData, isLoading, refetch } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: async () => {
      const { data } = await apiClient.get('/products', { params: { limit: 100 } });
      return data.data;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await apiClient.get('/categories');
      return data.data;
    },
  });

  const openAddModal = () => {
    setEditingProduct(null);
    const chickenVariants = [
      { name: '250g Jar', price: 299, is_available: true },
      { name: '500g Jar', price: 549, is_available: true },
      { name: '1kg Special', price: 1049, is_available: true }
    ];
    setFormData({
      name: '', description: '', price: '', category_id: categoriesData?.[0]?.id || '',
      image_url: '',
      is_vegetarian: true, is_vegan: false, is_gluten_free: false, is_spicy: false,
      spice_level: 0, preparation_time_minutes: 30, status: 'active',
      variants: []
    });
    setIsModalOpen(true);
  };

  const addChickenVariants = () => {
    const chickenVariants = [
      { name: '250g Jar', price: 299, is_available: true },
      { name: '500g Jar', price: 549, is_available: true },
      { name: '1kg Special', price: 1049, is_available: true }
    ];
    setFormData(prev => ({ ...prev, variants: [...prev.variants, ...chickenVariants] }));
    toast.success('Chicken Pickle variants added!');
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category_id: product.category_id,
      image_url: product.image_url || '',
      is_vegetarian: product.is_vegetarian,
      is_vegan: product.is_vegan,
      is_gluten_free: product.is_gluten_free,
      is_spicy: product.is_spicy,
      spice_level: product.spice_level,
      preparation_time_minutes: product.preparation_time_minutes,
      status: product.status,
      variants: product.variants || []
    });
    setIsModalOpen(true);
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { name: '', price: '', is_available: true }]
    }));
  };

  interface ProductVariant {
    name: string;
    price: string | number;
    is_available: boolean;
  }

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number | boolean): void => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      newVariants[index] = { ...newVariants[index], [field]: field === 'price' ? Number(value) || 0 : value };
      return { ...prev, variants: newVariants };
    });
  };

  const removeVariant = (index: number): void => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      await apiClient.delete(`/products/${id}`);
      toast.success('Product deleted successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        spice_level: Number(formData.spice_level),
        preparation_time_minutes: Number(formData.preparation_time_minutes)
      };

      let productId;
      if (editingProduct) {
        await apiClient.put(`/products/${editingProduct.id}`, payload);
        productId = editingProduct.id;
        toast.success('Product updated!');
      } else {
        const response = await apiClient.post('/products', payload);
        productId = response.data.data.id;
        toast.success('Product created!');
      }

      // Save variants if any
      if (formData.variants && formData.variants.length > 0) {
        await apiClient.post(`/products/${productId}/variants`, formData.variants.map(v => ({
          name: v.name,
          price: Number(v.price),
          is_available: v.is_available
        })));
        toast.success('Variants saved!');
      }

      setIsModalOpen(false);
      refetch();
    } catch (error: any) {
      if (Array.isArray(error.response?.data?.errors)) {
         toast.error(error.response.data.errors[0]?.message || 'Validation failed');
      } else {
         toast.error(error.response?.data?.message || 'Failed to save product');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large (Max 5MB)');
      return;
    }

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const { data } = await apiClient.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, image_url: data.data.url }));
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateDescription = async (productId: string, productName: string) => {
    setIsGenerating(productId);
    try {
      const { data } = await apiClient.post('/ai/generate-description', {
         name: productName,
         category: "Pickle", // Hardcoded for placeholder, could map ID
      });

      toast.success('Description generated via GPT-4o!');
      await apiClient.put(`/products/${productId}`, {
          description: data.data.description,
          seo_description: data.data.seoTitle
      });
      refetch();
    } catch (error) {
       toast.error('Failed to generate description');
    } finally {
       setIsGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-display font-bold text-[var(--text-primary)]">Manage Products</h1>
        <Button onClick={openAddModal} className="flex items-center gap-2 bg-[var(--saffron-500)] hover:bg-[var(--saffron-600)] text-white">
          <Plus className="h-4 w-4" /> Add New Item
        </Button>
      </div>

      <Card className="bg-[var(--bg-elevated)] border-[var(--border-subtle)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-[var(--bg-card)] text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl font-bold">Product</th>
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold">Price</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 rounded-tr-xl font-bold flex justify-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-[var(--saffron-500)]" />
                  </td>
                </tr>
              ) : productsData?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-muted)]">
                    No products found. Start by adding an authentic item!
                  </td>
                </tr>
              ) : (
                productsData?.map((product: any) => (
                  <tr key={product.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-card)] transition">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <img src={product.image_url || 'https://via.placeholder.com/50'} alt={product.name} className="h-10 w-10 rounded-lg object-cover border border-[var(--border-strong)]" />
                      <div>
                        <div className="font-bold text-[var(--text-primary)] leading-tight">{product.name}</div>
                        <div className="text-xs text-[var(--text-muted)] flex flex-wrap items-center gap-1 mt-1">
                          {product.is_vegetarian && <span className="text-[var(--leaf-400)]">Veg</span>}
                          {!product.is_vegetarian && <span className="text-[var(--chili-400)]">Non-Veg</span>}
                          {product.is_spicy && <span className="text-[var(--chili-500)] ml-1">Spicy(Lvl {product.spice_level})</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)] font-medium">
                      {product.categories?.name}
                    </td>
                    <td className="px-6 py-4 font-bold text-[var(--text-primary)] tabular-nums">
                      ₹{product.price}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={product.status === 'active' ? 'text-green-400 border-green-500/50 bg-green-500/10' : 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10'}>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          title="Auto-Generate SEO Description"
                          className="text-[var(--saffron-400)] hover:text-[var(--saffron-500)] hover:bg-[var(--saffron-500)]/10"
                          onClick={() => handleGenerateDescription(product.id, product.name)}
                          disabled={isGenerating === product.id}
                        >
                          {isGenerating === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(product)} className="text-[var(--text-secondary)] hover:text-blue-400 hover:bg-blue-500/10">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)} className="text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Product Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-2xl bg-[var(--bg-elevated)] border-[var(--border-subtle)] shadow-xl relative top-10 mb-20 md:m-0">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-6">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>

              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Product Name</label>
                    <Input 
                      required 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      className="bg-[var(--bg-card)] border-[var(--border-subtle)]"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Description</label>
                    <textarea 
                      required 
                      rows={3}
                      value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})} 
                      className="w-full rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--saffron-500)]"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center justify-between">
                      <span>Image</span>
                      {formData.image_url && <span className="text-xs text-[var(--saffron-500)]">Image Linked ✓</span>}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input 
                        value={formData.image_url} 
                        onChange={(e) => setFormData({...formData, image_url: e.target.value})} 
                        placeholder="https://... OR Upload File ->"
                        className="bg-[var(--bg-card)] border-[var(--border-subtle)] flex-1"
                      />
                      <div className="relative">
                        <Input 
                          type="file" 
                          accept="image/jpeg, image/png, image/webp"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          title="Upload image file"
                        />
                        <Button type="button" variant="outline" disabled={isUploading} className="w-full sm:w-auto relative z-0 border-[var(--border-strong)] bg-[var(--bg-elevated)] hover:bg-[var(--saffron-500)]/10">
                          {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                          {isUploading ? 'Uploading...' : 'Upload File'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Price (₹)</label>
                    <Input 
                      required 
                      type="number" 
                      min="1"
                      value={formData.price} 
                      onChange={(e) => setFormData({...formData, price: e.target.value})} 
                      className="bg-[var(--bg-card)] border-[var(--border-subtle)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Category</label>
                    <select 
                      required 
                      value={formData.category_id} 
                      onChange={(e) => setFormData({...formData, category_id: e.target.value})} 
                      className="w-full rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] px-3 py-2 h-10 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--saffron-500)] appearance-none"
                    >
                      <option value="" disabled>Select a category</option>
                      {categoriesData?.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Prep Time (mins)</label>
                    <Input 
                      type="number" 
                      min="0"
                      value={formData.preparation_time_minutes} 
                      onChange={(e) => setFormData({...formData, preparation_time_minutes: Number(e.target.value)})} 
                      className="bg-[var(--bg-card)] border-[var(--border-subtle)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">Spice Level (0-5)</label>
                    <Input 
                      type="number" 
                      min="0" max="5"
                      value={formData.spice_level} 
                      onChange={(e) => setFormData({...formData, spice_level: Number(e.target.value)})} 
                      className="bg-[var(--bg-card)] border-[var(--border-subtle)]"
                    />
                  </div>
                </div>

                {/* Dietary Flags */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-[var(--border-subtle)] mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_vegetarian} onChange={(e) => setFormData({...formData, is_vegetarian: e.target.checked})} className="rounded border-[var(--border-strong)] text-[var(--saffron-500)] focus:ring-[var(--saffron-500)] bg-[var(--bg-card)] w-4 h-4 cursor-pointer" />
                    <span className="text-sm text-[var(--text-secondary)]">Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_vegan} onChange={(e) => setFormData({...formData, is_vegan: e.target.checked})} className="rounded border-[var(--border-strong)] text-[var(--saffron-500)] focus:ring-[var(--saffron-500)] bg-[var(--bg-card)] w-4 h-4 cursor-pointer" />
                    <span className="text-sm text-[var(--text-secondary)]">Vegan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_gluten_free} onChange={(e) => setFormData({...formData, is_gluten_free: e.target.checked})} className="rounded border-[var(--border-strong)] text-[var(--saffron-500)] focus:ring-[var(--saffron-500)] bg-[var(--bg-card)] w-4 h-4 cursor-pointer" />
                    <span className="text-sm text-[var(--text-secondary)]">Gluten Free</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_spicy} onChange={(e) => setFormData({...formData, is_spicy: e.target.checked})} className="rounded border-[var(--border-strong)] text-[var(--saffron-500)] focus:ring-[var(--saffron-500)] bg-[var(--bg-card)] w-4 h-4 cursor-pointer" />
                    <span className="text-sm text-[var(--text-secondary)]">Is Spicy</span>
                  </label>
                </div>

                {/* Variants Section */}
                <div className="sm:col-span-2 space-y-3">
                  <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center justify-between">
                    <span>Product Variants</span>
                    <Button type="button" size="sm" variant="outline" onClick={addChickenVariants}>
                      Add Chicken Pickle Variants
                    </Button>
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-card)]">
                    {formData.variants.map((v, index) => (
                      <div key={index} className="flex gap-2 items-end flex-wrap">
                        <Input 
                          placeholder="Variant name (e.g. 250g Jar)" 
                          value={v.name} 
                          onChange={(e) => updateVariant(index, 'name', e.target.value)} 
                          className="flex-1 min-w-[120px]" 
                        />
                        <Input 
                          type="number" 
                          placeholder="Price (₹)" 
                          value={v.price} 
                          onChange={(e) => updateVariant(index, 'price', e.target.value)} 
                          className="w-28" 
                        />
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => removeVariant(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    {formData.variants.length === 0 && (
                      <p className="text-xs text-[var(--text-muted)] italic text-center py-4">
                        No variants. Click "Add Chicken Pickle Variants" or add manually.
                      </p>
                    )}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addVariant} className="w-full">
                    + Add Blank Variant
                  </Button>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-subtle)]">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving} className="bg-[var(--saffron-500)] hover:bg-[var(--saffron-600)] text-white min-w-[120px]">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingProduct ? 'Save Changes' : 'Create Product')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
