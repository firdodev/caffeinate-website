import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Filter, MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, getDocs } from 'firebase/firestore';

interface DeliveryOrder {
  id: string;
  customerName: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  orderType: 'pickup' | 'delivery';
  deliveryLocation: {
    address: string;
    city: string;
  };
  courierName?: string;
  courierId?: string;
}

interface Courier {
  id: string;
  name: string;
  email: string;
  role: string;
}

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<DeliveryOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get current user role and ID
    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (user) {
        setCurrentUserId(user.uid);
        const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', user.email)));
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          setUserRole(userData.role);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch couriers
    const fetchCouriers = async () => {
      try {
        const couriersQuery = query(collection(db, 'users'), where('role', '==', 'courier'));
        const couriersSnapshot = await getDocs(couriersQuery);
        const couriersData = couriersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Courier[];
        setCouriers(couriersData);
      } catch (error) {
        console.error('Error fetching couriers:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch couriers.'
        });
      }
    };

    fetchCouriers();
  }, [toast]);

  useEffect(() => {
    const q = query(collection(db, 'orders'), where('orderType', '==', 'delivery'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const deliveryData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DeliveryOrder[];
      setDeliveries(deliveryData);
      setFilteredDeliveries(deliveryData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = deliveries;

    if (searchTerm) {
      filtered = filtered.filter(
        delivery =>
          delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          delivery.deliveryLocation.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          delivery.deliveryLocation.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(delivery => delivery.status === statusFilter);
    }

    setFilteredDeliveries(filtered);
  }, [searchTerm, statusFilter, deliveries]);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const handleStatusUpdate = async (orderId: string, newStatus: 'processing' | 'completed' | 'cancelled') => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus
      });
      toast({
        title: 'Status Updated',
        description: `Delivery status has been changed to ${newStatus}.`
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update delivery status.'
      });
    }
  };

  const handleAssignCourier = async (orderId: string, courierId: string) => {
    try {
      const courier = couriers.find(c => c.id === courierId);
      if (!courier) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Selected courier not found.'
        });
        return;
      }

      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        courierId: courier.id,
        courierName: courier.name,
        status: 'processing'
      });

      toast({
        title: 'Courier Assigned',
        description: `${courier.name} has been assigned to this delivery.`
      });
    } catch (error) {
      console.error('Error assigning courier:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to assign courier. Please try again.'
      });
    }
  };

  const canAssignCourier = (delivery: DeliveryOrder) => {
    if (userRole === 'admin') return true;
    if (userRole === 'courier' && !delivery.courierId) return true;
    return false;
  };

  const canStartDelivery = (delivery: DeliveryOrder) => {
    if (userRole === 'courier' && delivery.courierId === currentUserId) return true;
    if (userRole === 'admin') return true;
    return false;
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <CardTitle>Delivery Management</CardTitle>
            <div className='flex gap-2'>
              <div className='relative'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search deliveries...'
                  className='pl-8'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Filter by status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='processing'>Processing</SelectItem>
                  <SelectItem value='completed'>Completed</SelectItem>
                  <SelectItem value='cancelled'>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Courier</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeliveries.map(delivery => (
                <TableRow key={delivery.id}>
                  <TableCell className='font-medium'>{delivery.id}</TableCell>
                  <TableCell>{delivery.customerName}</TableCell>
                  <TableCell>
                    <div className='flex items-center gap-1'>
                      <MapPin className='h-4 w-4 text-muted-foreground' />
                      {delivery.deliveryLocation.address}, {delivery.deliveryLocation.city}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(delivery.status)}>
                      {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {canAssignCourier(delivery) ? (
                      <Select onValueChange={value => handleAssignCourier(delivery.id, value)}>
                        <SelectTrigger>
                          <SelectValue placeholder='Assign courier' />
                        </SelectTrigger>
                        <SelectContent>
                          {couriers.map(courier => (
                            <SelectItem key={courier.id} value={courier.id}>
                              {courier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      delivery.courierName || 'Unassigned'
                    )}
                  </TableCell>
                  <TableCell>{new Date(delivery.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className='text-right'>
                    {canStartDelivery(delivery) && delivery.status === 'pending' && (
                      <Button variant='outline' size='sm' onClick={() => handleStatusUpdate(delivery.id, 'processing')}>
                        Start Delivery
                      </Button>
                    )}
                    {canStartDelivery(delivery) && delivery.status === 'processing' && (
                      <Button variant='outline' size='sm' onClick={() => handleStatusUpdate(delivery.id, 'completed')}>
                        Mark Delivered
                      </Button>
                    )}
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

export default Deliveries;
