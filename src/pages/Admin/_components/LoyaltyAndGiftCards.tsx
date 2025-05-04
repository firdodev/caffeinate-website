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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Gift, RefreshCw } from 'lucide-react';
import {
  getLoyaltyProgram,
  updateLoyaltyProgram,
  getGiftCards,
  createGiftCard,
  updateGiftCard,
  deleteGiftCard
} from '@/lib/firebase';

interface Reward {
  points: number;
  reward: string;
}

interface GiftCard {
  id: string;
  amount: number;
  code: string;
  isActive: boolean;
  createdAt: string;
}

export default function LoyaltyAndGiftCards() {
  const { toast } = useToast();
  const [loyaltyProgram, setLoyaltyProgram] = useState({
    pointsPerDollar: 1,
    rewards: [] as Reward[]
  });
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [isGiftCardDialogOpen, setIsGiftCardDialogOpen] = useState(false);
  const [newGiftCard, setNewGiftCard] = useState({
    amount: 0,
    code: '',
    isActive: true
  });
  const [newReward, setNewReward] = useState<Reward>({
    points: 0,
    reward: ''
  });

  useEffect(() => {
    const unsubscribeLoyalty = getLoyaltyProgram(program => {
      if (program) {
        setLoyaltyProgram(program);
      }
    });

    const unsubscribeGiftCards = getGiftCards(cards => {
      setGiftCards(cards);
    });

    return () => {
      unsubscribeLoyalty();
      unsubscribeGiftCards();
    };
  }, []);

  const handleUpdateLoyaltyProgram = async () => {
    try {
      await updateLoyaltyProgram(loyaltyProgram);
      toast({
        title: 'Success',
        description: 'Loyalty program updated successfully'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update loyalty program'
      });
    }
  };

  const handleAddReward = () => {
    setLoyaltyProgram(prev => ({
      ...prev,
      rewards: [...prev.rewards, newReward]
    }));
    setNewReward({ points: 0, reward: '' });
  };

  const handleRemoveReward = (index: number) => {
    setLoyaltyProgram(prev => ({
      ...prev,
      rewards: prev.rewards.filter((_, i) => i !== index)
    }));
  };

  const generateGiftCardCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) {
        code += '-';
      }
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleGenerateCode = () => {
    setNewGiftCard(prev => ({
      ...prev,
      code: generateGiftCardCode()
    }));
  };

  const handleCreateGiftCard = async () => {
    try {
      await createGiftCard(newGiftCard);
      toast({
        title: 'Success',
        description: 'Gift card created successfully'
      });
      setIsGiftCardDialogOpen(false);
      setNewGiftCard({
        amount: 0,
        code: '',
        isActive: true
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create gift card'
      });
    }
  };

  const handleToggleGiftCard = async (id: string, isActive: boolean) => {
    try {
      await updateGiftCard(id, { isActive });
      toast({
        title: 'Success',
        description: 'Gift card status updated'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update gift card'
      });
    }
  };

  const handleDeleteGiftCard = async (id: string) => {
    try {
      await deleteGiftCard(id);
      toast({
        title: 'Success',
        description: 'Gift card deleted successfully'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete gift card'
      });
    }
  };

  return (
    <div className='space-y-6'>
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Loyalty Program Card */}
        <Card>
          <CardHeader>
            <CardTitle>Loyalty Program</CardTitle>
            <CardDescription>Configure points system and rewards</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='pointsPerDollar'>Points per Dollar</Label>
              <Input
                id='pointsPerDollar'
                type='number'
                value={loyaltyProgram.pointsPerDollar}
                onChange={e =>
                  setLoyaltyProgram(prev => ({
                    ...prev,
                    pointsPerDollar: Number(e.target.value)
                  }))
                }
              />
            </div>

            <div className='space-y-4'>
              <h3 className='font-medium'>Rewards</h3>
              {loyaltyProgram.rewards.map((reward, index) => (
                <div key={index} className='flex items-center gap-2'>
                  <Input
                    type='number'
                    value={reward.points}
                    onChange={e =>
                      setLoyaltyProgram(prev => ({
                        ...prev,
                        rewards: prev.rewards.map((r, i) =>
                          i === index ? { ...r, points: Number(e.target.value) } : r
                        )
                      }))
                    }
                    placeholder='Points'
                  />
                  <Input
                    value={reward.reward}
                    onChange={e =>
                      setLoyaltyProgram(prev => ({
                        ...prev,
                        rewards: prev.rewards.map((r, i) => (i === index ? { ...r, reward: e.target.value } : r))
                      }))
                    }
                    placeholder='Reward'
                  />
                  <Button variant='ghost' size='icon' onClick={() => handleRemoveReward(index)}>
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              ))}

              <div className='flex items-center gap-2'>
                <Input
                  type='number'
                  value={newReward.points}
                  onChange={e =>
                    setNewReward(prev => ({
                      ...prev,
                      points: Number(e.target.value)
                    }))
                  }
                  placeholder='Points'
                />
                <Input
                  value={newReward.reward}
                  onChange={e =>
                    setNewReward(prev => ({
                      ...prev,
                      reward: e.target.value
                    }))
                  }
                  placeholder='Reward'
                />
                <Button onClick={handleAddReward}>Add</Button>
              </div>
            </div>

            <Button onClick={handleUpdateLoyaltyProgram}>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Gift Cards Card */}
        <Card>
          <CardHeader>
            <CardTitle>Gift Cards</CardTitle>
            <CardDescription>Manage gift cards and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex justify-end mb-4'>
              <Dialog open={isGiftCardDialogOpen} onOpenChange={setIsGiftCardDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Gift Card
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Gift Card</DialogTitle>
                    <DialogDescription>Add a new gift card with amount and code</DialogDescription>
                  </DialogHeader>
                  <div className='space-y-4 py-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='amount'>Amount</Label>
                      <Input
                        id='amount'
                        type='number'
                        value={newGiftCard.amount}
                        onChange={e =>
                          setNewGiftCard(prev => ({
                            ...prev,
                            amount: Number(e.target.value)
                          }))
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='code'>Code</Label>
                      <div className='flex gap-2'>
                        <Input
                          id='code'
                          value={newGiftCard.code}
                          onChange={e =>
                            setNewGiftCard(prev => ({
                              ...prev,
                              code: e.target.value
                            }))
                          }
                          placeholder='XXXX-XXXX-XXXX-XXXX'
                        />
                        <Button
                          type='button'
                          variant='outline'
                          size='icon'
                          onClick={handleGenerateCode}
                          title='Generate new code'
                        >
                          <RefreshCw className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant='outline' onClick={() => setIsGiftCardDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateGiftCard}>Create Gift Card</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {giftCards.map(card => (
                    <TableRow key={card.id}>
                      <TableCell>{card.code}</TableCell>
                      <TableCell>${card.amount}</TableCell>
                      <TableCell>
                        <Button
                          variant={card.isActive ? 'default' : 'outline'}
                          size='sm'
                          onClick={() => handleToggleGiftCard(card.id, !card.isActive)}
                        >
                          {card.isActive ? 'Active' : 'Inactive'}
                        </Button>
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button variant='ghost' size='icon' onClick={() => handleDeleteGiftCard(card.id)}>
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
