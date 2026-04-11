import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  LayoutGrid, Plus, Edit, Trash2, 
  Image as ImageIcon, Loader2, X, Tag
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiClient from '../../lib/apiClient';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';

export default function ManageCategories() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    is_active: true
  });

  // Fetch All Categories for Admin
  const { data: categories, isLoading } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: async () => {
      const { data } = await apiClient.get('/categories/admin/all');
      return data.data;
    },
  });

  // Mutation
  const categoryMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingCategory) {
        return apiClient.patch(`/categories/${editingCategory.id}`, data);
      }
      return apiClient.post('/categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      toast.success(editingCategory ? 'Category updated' : 'Category created');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      toast.success('Category deleted');
      setIsDeleting(null);
    },
    onError: (error: any) => {
       toast.error(error.response?.data?.message || 'Failed to delete');
       setIsDeleting(null);
    }
  });

  const openModal = (category: any = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        image_url: category.image_url || '',
        is_active: category.is_active
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', image_url: '', is_active: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this category? This might fail if it has products.')) {
      setIsDeleting(id);
      deleteMutation.mutate(id);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const { data } = await apiClient.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, image_url: data.data.url }));
      toast.success('Image uploaded!');
    } catch (error: any) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    categoryMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--text-primary)]">Manage Categories</h1>
          <p className="text-[var(--text-secondary)]">Organize your product catalog.</p>
        </div>
        <Button onClick={() => openModal()} className="shadow-saffron">
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <Card className="bg-[var(--bg-elevated)] border-[var(--border-subtle)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-card)] text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
              <tr>
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold">Slug</th>
                <th className="px-6 py-4 font-bold">Products</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-[var(--saffron-500)]" />
                  </td>
                </tr>
              ) : categories?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[var(--text-muted)] italic">
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories?.map((cat: any) => (
                  <tr key={cat.id} className="hover:bg-[var(--bg-card)] transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[var(--bg-card)] border border-[var(--border-strong)] flex-shrink-0 overflow-hidden">
                        {cat.image_url ? (
                          <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <LayoutGrid className="w-full h-full p-2 text-[var(--text-muted)]" />
                        )}
                      </div>
                      <span className="font-bold text-[var(--text-primary)]">{cat.name}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[var(--text-muted)]">
                      /{cat.slug}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      <Badge variant="outline" className="font-bold border-[var(--border-strong)]">
                        {cat.product_count || 0} items
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={cat.is_active ? 'default' : 'secondary'} className={cat.is_active ? 'bg-green-500/10 text-green-500 border-green-500/30' : ''}>
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <Button variant="ghost" size="sm" onClick={() => openModal(cat)} className="text-blue-400 hover:text-blue-500 hover:bg-blue-500/10">
                          <Edit className="h-4 w-4" />
                       </Button>
                       <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(cat.id)} 
                          className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                          disabled={isDeleting === cat.id}
                        >
                          {isDeleting === cat.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                       </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg bg-[var(--bg-elevated)] border-[var(--border-subtle)] shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white bg-[var(--bg-card)] p-1.5 rounded-full border border-[var(--border-subtle)]">
              <X className="h-5 w-5" />
            </button>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[var(--saffron-500)]/10 rounded-lg">
                  <Tag className="h-6 w-6 text-[var(--saffron-500)]" />
                </div>
                <h2 className="text-2xl font-display font-bold text-[var(--text-primary)]">
                  {editingCategory ? 'Edit Category' : 'Create Category'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Category Name</label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="E.g., Authentic Sweets" 
                    required 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Description</label>
                  <textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    rows={3}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:ring-[var(--saffron-500)] focus:border-[var(--saffron-500)] outline-none"
                    placeholder="Short description of items in this category..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center justify-between">
                    <span>Banner Image URL</span>
                    <span className="text-xs opacity-60">Icon or Cover Image</span>
                  </label>
                  <div className="flex gap-2">
                    <Input 
                      value={formData.image_url} 
                      onChange={e => setFormData({...formData, image_url: e.target.value})} 
                      placeholder="https://..." 
                      className="flex-1"
                    />
                    <div className="relative">
                      <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <Button type="button" variant="outline" size="icon" disabled={isUploading}>
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4">
                   <select 
                    value={formData.is_active.toString()} 
                    onChange={e => setFormData({...formData, is_active: e.target.value === 'true'})}
                    className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-lg px-3 py-1 text-sm outline-none"
                   >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                   </select>
                   <span className="text-xs text-[var(--text-muted)]">Shown to customers in menu</span>
                </div>

                <div className="pt-6">
                  <Button type="submit" className="w-full py-6 font-bold text-lg shadow-saffron" disabled={categoryMutation.isPending}>
                    {categoryMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : editingCategory ? 'Save Changes' : 'Add Category'}
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
