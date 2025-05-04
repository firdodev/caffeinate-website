import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, MoreVertical, Trash2, Edit, Coffee, Settings, Image as ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage
} from '@/lib/firebase';
import { Image } from '@/components/ui/image';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  isCustomizable: boolean;
  customizations: { name: string; options: string[]; price: number }[];
  imageUrl?: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    isCustomizable: false,
    customizations: [] as { name: string; options: string[]; price: number }[],
    imageUrl: ''
  });
  const [newCustomization, setNewCustomization] = useState({
    name: '',
    options: '',
    price: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = getProducts(products => {
      setProducts(products);
    });

    return () => unsubscribe();
  }, []);

  const handleAddCustomization = () => {
    if (newCustomization.name && newCustomization.options) {
      const options = newCustomization.options.split(',').map(opt => opt.trim());
      setNewProduct({
        ...newProduct,
        customizations: [
          ...newProduct.customizations,
          {
            name: newCustomization.name,
            options,
            price: parseFloat(newCustomization.price) || 0
          }
        ]
      });
      setNewCustomization({ name: '', options: '', price: '' });
    }
  };

  const handleRemoveCustomization = (index: number) => {
    setNewProduct({
      ...newProduct,
      customizations: newProduct.customizations.filter((_, i) => i !== index)
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleCreateProduct = async () => {
    try {
      let imageUrl = '';

      if (selectedImage) {
        imageUrl = await uploadProductImage(selectedImage);
      }

      const product = {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        stock: parseInt(newProduct.stock),
        isCustomizable: newProduct.isCustomizable,
        customizations: newProduct.customizations,
        imageUrl
      };

      await addProduct(product);

      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        isCustomizable: false,
        customizations: [],
        imageUrl: ''
      });
      setSelectedImage(null);
      setImagePreview('');
      URL.revokeObjectURL(imagePreview);

      toast({
        title: 'Product Created',
        description: 'The product has been successfully added to your inventory.'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create product. Please try again.'
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      // Get the product to check if it has an image
      const product = products.find(p => p.id === productId);

      // Delete the product image from storage if it exists
      if (product?.imageUrl) {
        await deleteProductImage(product.imageUrl);
      }

      // Delete the product from Firestore
      await deleteProduct(productId);

      toast({
        title: 'Product Deleted',
        description: 'The product has been successfully deleted.'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete product. Please try again.'
      });
    }
  };

  const handleUpdateProduct = async (productId: string, data: any) => {
    try {
      await updateProduct(productId, data);
      toast({
        title: 'Product Updated',
        description: 'The product has been successfully updated.'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update product. Please try again.'
      });
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold'>Products</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
              <DialogDescription>Add a new product to your inventory. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='image' className='text-right'>
                  Image
                </Label>
                <div className='col-span-3 space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Input
                      id='image'
                      type='file'
                      accept='image/*'
                      onChange={handleImageChange}
                      className='cursor-pointer'
                    />
                  </div>
                  {imagePreview && (
                    <div className='mt-2'>
                      <Image src={imagePreview} alt='Product preview' className='w-32 h-32 object-cover rounded-md' />
                    </div>
                  )}
                </div>
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='name' className='text-right'>
                  Name
                </Label>
                <Input
                  id='name'
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  className='col-span-3'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='description' className='text-right'>
                  Description
                </Label>
                <Textarea
                  id='description'
                  value={newProduct.description}
                  onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                  className='col-span-3'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='price' className='text-right'>
                  Price
                </Label>
                <Input
                  id='price'
                  type='number'
                  value={newProduct.price}
                  onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                  className='col-span-3'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='category' className='text-right'>
                  Category
                </Label>
                <Input
                  id='category'
                  value={newProduct.category}
                  onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                  className='col-span-3'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='stock' className='text-right'>
                  Stock
                </Label>
                <Input
                  id='stock'
                  type='number'
                  value={newProduct.stock}
                  onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                  className='col-span-3'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label className='text-right'>Customizable</Label>
                <div className='col-span-3'>
                  <Checkbox
                    id='isCustomizable'
                    checked={newProduct.isCustomizable}
                    onCheckedChange={checked => setNewProduct({ ...newProduct, isCustomizable: checked as boolean })}
                  />
                  <Label htmlFor='isCustomizable' className='ml-2'>
                    Allow customizations
                  </Label>
                </div>
              </div>

              {newProduct.isCustomizable && (
                <div className='space-y-4'>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label className='text-right'>Customization</Label>
                    <div className='col-span-3 space-y-2'>
                      <div className='flex gap-2'>
                        <Input
                          placeholder='Customization name'
                          value={newCustomization.name}
                          onChange={e => setNewCustomization({ ...newCustomization, name: e.target.value })}
                        />
                        <Input
                          placeholder='Options (comma-separated)'
                          value={newCustomization.options}
                          onChange={e => setNewCustomization({ ...newCustomization, options: e.target.value })}
                        />
                        <Input
                          type='number'
                          placeholder='Price'
                          value={newCustomization.price}
                          onChange={e => setNewCustomization({ ...newCustomization, price: e.target.value })}
                          className='w-20'
                        />
                        <Button onClick={handleAddCustomization}>Add</Button>
                      </div>
                      <div className='space-y-2'>
                        {newProduct.customizations.map((customization, index) => (
                          <div key={index} className='flex items-center justify-between p-2 border rounded'>
                            <div>
                              <div className='font-medium'>{customization.name}</div>
                              <div className='text-sm text-muted-foreground'>
                                {customization.options.join(', ')}
                                {customization.price > 0 && ` (+$${customization.price})`}
                              </div>
                            </div>
                            <Button variant='ghost' size='sm' onClick={() => handleRemoveCustomization(index)}>
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type='submit' onClick={handleCreateProduct}>
                Save Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <CardTitle>Product Management</CardTitle>
            <div className='flex gap-2'>
              <div className='relative'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input placeholder='Search products...' className='pl-8' />
              </div>
              <Button variant='outline' size='icon'>
                <Filter className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Customizable</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.name} className='w-12 h-12 object-cover rounded-md' />
                    ) : (
                      <div className='w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center'>
                        <ImageIcon className='h-6 w-6 text-gray-400' />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className='font-medium'>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    {product.isCustomizable ? (
                      <div className='flex items-center gap-1'>
                        <Settings className='h-4 w-4 text-primary' />
                        <span>Yes</span>
                      </div>
                    ) : (
                      <span>No</span>
                    )}
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon'>
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='w-56'>
                        <DropdownMenuItem
                          onClick={() => handleUpdateProduct(product.id, { ...product, stock: product.stock + 1 })}
                        >
                          <Edit className='mr-2 h-4 w-4' />
                          Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Coffee className='mr-2 h-4 w-4' />
                          View Customizations
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className='text-red-600 focus:text-red-600'
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
