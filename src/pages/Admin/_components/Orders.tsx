import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, MoreVertical, Trash2, Edit, Eye, Printer, Copy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer';
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
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { getOrders, addOrder, updateOrder, deleteOrder, getProducts } from '@/lib/firebase';

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id?: string; // Optional for new orders
  customerName: string;
  products: Product[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  orderType: 'pickup' | 'delivery';
  deliveryLocation?: {
    address: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [newOrder, setNewOrder] = useState<Order>({
    customerName: '',
    products: [],
    total: 0,
    status: 'pending',
    createdAt: new Date().toISOString(),
    orderType: 'pickup',
    deliveryLocation: {
      address: '',
      city: ''
    }
  });
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productQuantity, setProductQuantity] = useState('1');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [isPrintDrawerOpen, setIsPrintDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    const unsubscribeOrders = getOrders(orders => {
      setOrders(orders);
    });

    const unsubscribeProducts = getProducts(products => {
      setProducts(products);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, []);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrder(orderId, { status: newStatus });
      toast({
        title: 'Status Updated',
        description: `Order status has been changed to ${newStatus}.`
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update order status. Please try again.'
      });
    }
  };

  const handleAddProduct = () => {
    if (selectedProduct) {
      const product = products.find(p => p.id === selectedProduct);
      if (product) {
        const newProduct: Product = {
          id: product.id,
          name: product.name,
          quantity: parseInt(productQuantity),
          price: product.price
        };
        setNewOrder({
          ...newOrder,
          products: [...newOrder.products, newProduct],
          total: newOrder.total + product.price * parseInt(productQuantity)
        });
        setSelectedProduct('');
        setProductQuantity('1');
      }
    }
  };

  const handleRemoveProduct = (productId: string) => {
    const product = newOrder.products.find(p => p.id === productId);
    if (product) {
      setNewOrder({
        ...newOrder,
        products: newOrder.products.filter(p => p.id !== productId),
        total: newOrder.total - product.price * product.quantity
      });
    }
  };

  const handleCreateOrder = async () => {
    try {
      const orderData: Order = {
        customerName: newOrder.customerName,
        products: newOrder.products,
        total: newOrder.products.reduce((sum, product) => sum + product.price * product.quantity, 0),
        status: 'pending',
        createdAt: new Date().toISOString(),
        orderType: newOrder.orderType,
        ...(newOrder.orderType === 'delivery' && { deliveryLocation: newOrder.deliveryLocation })
      };

      await addOrder(orderData);
      toast({
        title: 'Success',
        description: 'Order created successfully'
      });
      setIsCreateDialogOpen(false);
      setNewOrder({
        customerName: '',
        products: [],
        total: 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
        orderType: 'pickup',
        deliveryLocation: {
          address: '',
          city: ''
        }
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create order'
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder(orderId);
      toast({
        title: 'Order Deleted',
        description: 'The order has been successfully deleted.'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete order. Please try again.'
      });
    }
  };

  const handleDuplicateOrder = async (order: Order) => {
    try {
      const newOrder = {
        ...order,
        id: undefined,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      await addOrder(newOrder);
      toast({
        title: 'Order Duplicated',
        description: 'A new order has been created based on the selected order.'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to duplicate order. Please try again.'
      });
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDrawerOpen(true);
  };

  const handlePrintOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsPrintDrawerOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setIsEditDrawerOpen(true);
  };

  const handleSaveEdit = async () => {
    if (editingOrder) {
      try {
        await updateOrder(editingOrder.id, editingOrder);
        setIsEditDrawerOpen(false);
        toast({
          title: 'Order Updated',
          description: 'The order has been successfully updated.'
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update order. Please try again.'
        });
      }
    }
  };

  const handleEditChange = (field: string, value: any) => {
    setEditingOrder({
      ...editingOrder!,
      [field]: value
    });
  };

  const handleEditProductChange = (index: number, field: string, value: any) => {
    const updatedProducts = [...editingOrder!.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    };
    setEditingOrder({
      ...editingOrder!,
      products: updatedProducts
    });
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold'>Orders</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Create Order
        </Button>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>Add a new order with products and details</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='customerName'>Customer Name</Label>
              <Input
                id='customerName'
                value={newOrder.customerName}
                onChange={e =>
                  setNewOrder(prev => ({
                    ...prev,
                    customerName: e.target.value
                  }))
                }
              />
            </div>

            <div className='space-y-2'>
              <Label>Order Type</Label>
              <div className='flex gap-4'>
                <Button
                  variant={newOrder.orderType === 'pickup' ? 'default' : 'outline'}
                  onClick={() =>
                    setNewOrder(prev => ({
                      ...prev,
                      orderType: 'pickup'
                    }))
                  }
                >
                  Pickup
                </Button>
                <Button
                  variant={newOrder.orderType === 'delivery' ? 'default' : 'outline'}
                  onClick={() =>
                    setNewOrder(prev => ({
                      ...prev,
                      orderType: 'delivery'
                    }))
                  }
                >
                  Delivery
                </Button>
              </div>
            </div>

            {newOrder.orderType === 'delivery' && (
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='deliveryAddress'>Delivery Address</Label>
                  <Input
                    id='deliveryAddress'
                    value={newOrder.deliveryLocation?.address}
                    onChange={e =>
                      setNewOrder(prev => ({
                        ...prev,
                        deliveryLocation: {
                          ...prev.deliveryLocation!,
                          address: e.target.value
                        }
                      }))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='deliveryCity'>City</Label>
                  <Input
                    id='deliveryCity'
                    value={newOrder.deliveryLocation?.city}
                    onChange={e =>
                      setNewOrder(prev => ({
                        ...prev,
                        deliveryLocation: {
                          ...prev.deliveryLocation!,
                          city: e.target.value
                        }
                      }))
                    }
                  />
                </div>
              </div>
            )}

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label className='text-right'>Products</Label>
              <div className='col-span-3 space-y-2'>
                <div className='flex gap-2'>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className='w-[180px]'>
                      <SelectValue placeholder='Select a product' />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ${product.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type='number'
                    min='1'
                    value={productQuantity}
                    onChange={e => setProductQuantity(e.target.value)}
                    className='w-20'
                  />
                  <Button onClick={handleAddProduct}>Add</Button>
                </div>
                <div className='space-y-2'>
                  {newOrder.products.map(product => (
                    <div key={product.id} className='flex items-center justify-between p-2 border rounded'>
                      <span>
                        {product.name} x {product.quantity}
                      </span>
                      <Button variant='ghost' size='sm' onClick={() => handleRemoveProduct(product.id)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label className='text-right'>Total</Label>
              <div className='col-span-3 font-medium'>${newOrder.total.toFixed(2)}</div>
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='status' className='text-right'>
                Status
              </Label>
              <select
                id='status'
                value={newOrder.status}
                onChange={e =>
                  setNewOrder({
                    ...newOrder,
                    status: e.target.value as 'pending' | 'processing' | 'completed' | 'cancelled'
                  })
                }
                className='col-span-3 rounded-md border border-input bg-background px-3 py-2'
              >
                <option value='pending'>Pending</option>
                <option value='processing'>Processing</option>
                <option value='completed'>Completed</option>
                <option value='cancelled'>Cancelled</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrder}>Create Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <CardTitle>Order Management</CardTitle>
            <div className='flex gap-2'>
              <div className='relative'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input placeholder='Search orders...' className='pl-8' />
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
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className='font-medium'>{order.id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>
                    <div className='space-y-1'>
                      {order.products.map(product => (
                        <div key={product.id}>
                          {product.name} x {product.quantity}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon'>
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='w-56'>
                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'pending')}>
                          <div className='flex items-center gap-2'>
                            <div className='h-2 w-2 rounded-full bg-yellow-500' />
                            Set as Pending
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'processing')}>
                          <div className='flex items-center gap-2'>
                            <div className='h-2 w-2 rounded-full bg-blue-500' />
                            Set as Processing
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'completed')}>
                          <div className='flex items-center gap-2'>
                            <div className='h-2 w-2 rounded-full bg-green-500' />
                            Set as Completed
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'cancelled')}>
                          <div className='flex items-center gap-2'>
                            <div className='h-2 w-2 rounded-full bg-red-500' />
                            Set as Cancelled
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handlePrintOrder(order)}>
                          <Printer className='mr-2 h-4 w-4' />
                          Print Order
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateOrder(order)}>
                          <Copy className='mr-2 h-4 w-4' />
                          Duplicate Order
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                          <Eye className='mr-2 h-4 w-4' />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                          <Edit className='mr-2 h-4 w-4' />
                          Edit Order
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className='text-red-600 focus:text-red-600'
                          onClick={() => handleDeleteOrder(order.id)}
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          Delete Order
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

      <Drawer open={isViewDrawerOpen} onOpenChange={setIsViewDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Order Details</DrawerTitle>
            <DrawerDescription>View detailed information about the order</DrawerDescription>
          </DrawerHeader>
          {selectedOrder && (
            <div className='p-4 space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label>Order ID</Label>
                  <p className='font-medium'>{selectedOrder.id}</p>
                </div>
                <div>
                  <Label>Customer</Label>
                  <p className='font-medium'>{selectedOrder.customerName}</p>
                </div>
                <div>
                  <Label>Date</Label>
                  <p className='font-medium'>{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusBadge(selectedOrder.status)}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Products</Label>
                <div className='mt-2 space-y-2'>
                  {selectedOrder.products.map((product: any) => (
                    <div key={product.id} className='flex justify-between items-center p-2 border rounded'>
                      <div>
                        <p className='font-medium'>{product.name}</p>
                        <p className='text-sm text-muted-foreground'>Quantity: {product.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className='flex justify-between items-center border-t pt-4'>
                <Label className='text-lg'>Total</Label>
                <p className='text-lg font-bold'>${selectedOrder.total.toFixed(2)}</p>
              </div>
            </div>
          )}
          <DrawerFooter>
            <Button variant='outline' onClick={() => setIsViewDrawerOpen(false)}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer open={isPrintDrawerOpen} onOpenChange={setIsPrintDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Print Order</DrawerTitle>
            <DrawerDescription>Print or save order details</DrawerDescription>
          </DrawerHeader>
          {selectedOrder && (
            <div className='p-4 space-y-4'>
              <div className='bg-white p-6 rounded-lg shadow-sm'>
                <div className='text-center mb-6'>
                  <h2 className='text-2xl font-bold'>Caffeinate Your Moment</h2>
                  <p className='text-muted-foreground'>Order Receipt</p>
                </div>
                <div className='space-y-4'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Order ID:</span>
                    <span className='font-medium'>{selectedOrder.id}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Date:</span>
                    <span className='font-medium'>{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Customer:</span>
                    <span className='font-medium'>{selectedOrder.customerName}</span>
                  </div>
                  <div className='border-t pt-4'>
                    <h3 className='font-semibold mb-2'>Items</h3>
                    {selectedOrder.products.map((product: any) => (
                      <div key={product.id} className='flex justify-between py-2'>
                        <span>
                          {product.name} x {product.quantity}
                        </span>
                        <span>
                          ${(product.quantity * products.find(p => p.id === product.id)?.price || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className='border-t pt-4'>
                    <div className='flex justify-between font-bold'>
                      <span>Total</span>
                      <span>${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DrawerFooter className='flex gap-2'>
            <Button variant='outline' onClick={() => setIsPrintDrawerOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                window.print();
                setIsPrintDrawerOpen(false);
              }}
            >
              <Printer className='mr-2 h-4 w-4' />
              Print
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Order</DrawerTitle>
            <DrawerDescription>Modify order details</DrawerDescription>
          </DrawerHeader>
          {editingOrder && (
            <div className='p-4 space-y-4'>
              <div className='grid gap-4'>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='customerName' className='text-right'>
                    Customer
                  </Label>
                  <Input
                    id='customerName'
                    value={editingOrder.customerName}
                    onChange={e => handleEditChange('customerName', e.target.value)}
                    className='col-span-3'
                  />
                </div>

                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label className='text-right'>Status</Label>
                  <select
                    value={editingOrder.status}
                    onChange={e =>
                      handleEditChange('status', e.target.value as 'pending' | 'processing' | 'completed' | 'cancelled')
                    }
                    className='col-span-3 rounded-md border border-input bg-background px-3 py-2'
                  >
                    <option value='pending'>Pending</option>
                    <option value='processing'>Processing</option>
                    <option value='completed'>Completed</option>
                    <option value='cancelled'>Cancelled</option>
                  </select>
                </div>

                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='createdAt' className='text-right'>
                    Date
                  </Label>
                  <Input
                    id='createdAt'
                    type='date'
                    value={new Date(editingOrder.createdAt).toISOString().split('T')[0]}
                    onChange={e => handleEditChange('createdAt', e.target.value)}
                    className='col-span-3'
                  />
                </div>

                <div>
                  <Label>Products</Label>
                  <div className='mt-2 space-y-2'>
                    {editingOrder.products.map((product: any, index: number) => (
                      <div key={product.id} className='flex items-center gap-2 p-2 border rounded'>
                        <div className='flex-1'>
                          <p className='font-medium'>{product.name}</p>
                        </div>
                        <Input
                          type='number'
                          min='1'
                          value={product.quantity}
                          onChange={e => handleEditProductChange(index, 'quantity', parseInt(e.target.value))}
                          className='w-20'
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DrawerFooter>
            <Button variant='outline' onClick={() => setIsEditDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Orders;
