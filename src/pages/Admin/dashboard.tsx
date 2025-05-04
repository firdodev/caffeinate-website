import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarProvider,
  SidebarContent
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  PanelLeft,
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  Truck,
  Users as UsersIcon,
  Gift
} from 'lucide-react';
import DashboardOverview from './_components/DashboardOverview';
import Products from './_components/Products';
import Orders from './_components/Orders';
import Deliveries from './_components/Deliveries';
import UsersComponent from './_components/Users';
import LoyaltyAndGiftCards from './_components/LoyaltyAndGiftCards';
import { auth, logout, ROLES, db } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { getDocs, query, collection, where } from 'firebase/firestore';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (!user) {
        navigate('/admin');
      } else {
        // Get user role from Firestore
        const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', user.email)));
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          setUserRole(userData.role);
        }
      }
    });

    const hash = window.location.hash.slice(1) || 'overview';
    setActiveTab(hash);

    return () => unsubscribe();
  }, [navigate]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.'
      });
      navigate('/admin');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to log out. Please try again.'
      });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return userRole === ROLES.ADMIN ? <DashboardOverview /> : null;
      case 'products':
        return userRole === ROLES.ADMIN || userRole === ROLES.CASHIER ? <Products /> : null;
      case 'orders':
        return userRole === ROLES.ADMIN || userRole === ROLES.CASHIER ? <Orders /> : null;
      case 'deliveries':
        return userRole === ROLES.ADMIN || userRole === ROLES.COURIER ? <Deliveries /> : null;
      case 'users':
        return userRole === ROLES.ADMIN ? <UsersComponent /> : null;
      case 'loyalty':
        return userRole === ROLES.ADMIN ? <LoyaltyAndGiftCards /> : null;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <SidebarProvider defaultOpen>
      <div className='flex h-screen'>
        <Sidebar variant='floating' collapsible='icon'>
          <SidebarHeader className='flex items-center gap-2'>
            <SidebarMenuButton variant='outline' size='sm' className='w-full justify-start'>
              <span className='text-xl font-bold text-primary'>Admin Panel</span>
            </SidebarMenuButton>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {userRole === ROLES.ADMIN && (
                <>
                  <SidebarMenuItem onClick={() => handleTabChange('overview')}>
                    <SidebarMenuButton isActive={activeTab === 'overview'}>
                      <LayoutDashboard className='h-5 w-5 mr-2' />
                      Overview
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem onClick={() => handleTabChange('users')}>
                    <SidebarMenuButton isActive={activeTab === 'users'}>
                      <UsersIcon className='h-5 w-5 mr-2' />
                      Users
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem onClick={() => handleTabChange('loyalty')}>
                    <SidebarMenuButton isActive={activeTab === 'loyalty'}>
                      <Gift className='h-5 w-5 mr-2' />
                      Loyalty & Gift Cards
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
              {(userRole === ROLES.ADMIN || userRole === ROLES.CASHIER) && (
                <>
                  <SidebarMenuItem onClick={() => handleTabChange('products')}>
                    <SidebarMenuButton isActive={activeTab === 'products'}>
                      <Package className='h-5 w-5 mr-2' />
                      Products
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem onClick={() => handleTabChange('orders')}>
                    <SidebarMenuButton isActive={activeTab === 'orders'}>
                      <ShoppingCart className='h-5 w-5 mr-2' />
                      Orders
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
              {(userRole === ROLES.ADMIN || userRole === ROLES.COURIER) && (
                <SidebarMenuItem onClick={() => handleTabChange('deliveries')}>
                  <SidebarMenuButton isActive={activeTab === 'deliveries'}>
                    <Truck className='h-5 w-5 mr-2' />
                    Deliveries
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className='mt-auto'>
            <SidebarMenuButton variant='outline' className='text-destructive' onClick={handleLogout}>
              <LogOut className='mr-2 h-4 w-4' />
              Logout
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>
        <div className='flex-1 overflow-auto'>
          <div className='sticky top-0 z-10 bg-background border-b'>
            <div className='flex h-16 items-center gap-4 px-4'>
              <SidebarTrigger>
                <Button variant='ghost' size='icon'>
                  <PanelLeft className='h-5 w-5' />
                </Button>
              </SidebarTrigger>
              <h1 className='text-xl font-semibold capitalize'>{activeTab}</h1>
            </div>
          </div>
          <main className='p-6'>{renderContent()}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
