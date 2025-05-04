import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit } from 'lucide-react';
import { ROLES, db } from '@/lib/firebase';
import { updateDoc, deleteDoc, doc, collection, onSnapshot } from 'firebase/firestore';
import { createUser } from '@/lib/firebase';

interface User {
  id: string;
  email: string;
  role: string;
}

export default function Users() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: ROLES.CASHIER
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), snapshot => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
    });

    return () => unsubscribe();
  }, []);

  const validateUser = () => {
    if (!newUser.email || !newUser.password) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Email and password are required'
      });
      return false;
    }

    if (newUser.password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Password must be at least 6 characters long'
      });
      return false;
    }

    if (!newUser.email.includes('@')) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a valid email address'
      });
      return false;
    }

    return true;
  };

  const handleCreateUser = async () => {
    if (!validateUser()) return;

    try {
      await createUser(newUser.email, newUser.password, newUser.role);

      toast({
        title: 'Success',
        description: 'User created successfully'
      });

      setIsCreateDialogOpen(false);
      setNewUser({
        email: '',
        password: '',
        role: ROLES.CASHIER
      });
    } catch (error: any) {
      let errorMessage = 'Failed to create user';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }

      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage
      });
    }
  };

  const handleUpdateUser = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole
      });
      toast({
        title: 'Success',
        description: 'User role updated successfully'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update user role'
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      toast({
        title: 'Success',
        description: 'User deleted successfully'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete user'
      });
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold'>Users</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a new user with specific role and permissions.</DialogDescription>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <Input
                  id='password'
                  type='password'
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='role'>Role</Label>
                <Select value={newUser.role} onValueChange={value => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select role' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ROLES.ADMIN}>Admin</SelectItem>
                    <SelectItem value={ROLES.CASHIER}>Cashier</SelectItem>
                    <SelectItem value={ROLES.COURIER}>Courier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select value={user.role} onValueChange={value => handleUpdateUser(user.id, value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ROLES.ADMIN}>Admin</SelectItem>
                      <SelectItem value={ROLES.CASHIER}>Cashier</SelectItem>
                      <SelectItem value={ROLES.COURIER}>Courier</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className='text-right'>
                  <Button variant='ghost' size='icon' onClick={() => handleDeleteUser(user.id)}>
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
