'use client';

import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  Search,
  CreditCard,
  Wallet,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type TransactionType = 'payment' | 'payout' | 'refund' | 'fee';
type TransactionStatus = 'completed' | 'pending' | 'failed';

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  fee?: number;
  status: TransactionStatus;
  description: string;
  projectTitle?: string;
  counterparty?: string;
  date: Date;
  paymentMethod?: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  userRole: 'freelancer' | 'buyer';
  totalEarnings?: number;
  totalSpent?: number;
  pendingAmount?: number;
}

export function TransactionHistory({
  transactions,
  userRole,
  totalEarnings = 0,
  totalSpent = 0,
  pendingAmount = 0,
}: TransactionHistoryProps) {
  const [filter, setFilter] = useState<TransactionType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = filter === 'all' || t.type === filter;
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#00B8A9]/10 flex items-center justify-center">
                {userRole === 'freelancer' ? (
                  <ArrowDownLeft className="h-6 w-6 text-[#00B8A9]" />
                ) : (
                  <ArrowUpRight className="h-6 w-6 text-[#FF6B6B]" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {userRole === 'freelancer' ? 'Total Earnings' : 'Total Spent'}
                </p>
                <p className="text-2xl font-bold text-[#1A2B4A] font-mono">
                  ${(userRole === 'freelancer' ? totalEarnings : totalSpent).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#F6A623]/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#F6A623]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {userRole === 'freelancer' ? 'Pending Payout' : 'In Escrow'}
                </p>
                <p className="text-2xl font-bold text-[#1A2B4A] font-mono">
                  ${pendingAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#1A2B4A]/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-[#1A2B4A]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-[#1A2B4A] font-mono">
                  ${transactions
                    .filter(t => {
                      const now = new Date();
                      return t.date.getMonth() === now.getMonth() &&
                        t.date.getFullYear() === now.getFullYear() &&
                        t.status === 'completed';
                    })
                    .reduce((sum, t) => sum + (t.type === 'payout' || t.type === 'payment' ? t.amount : 0), 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <Card className="card-shadow">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-display text-[#1A2B4A]">
                Transaction History
              </CardTitle>
              <CardDescription>
                View all your payments, payouts, and fees
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as TransactionType | 'all')}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
                <SelectItem value="payout">Payouts</SelectItem>
                <SelectItem value="refund">Refunds</SelectItem>
                <SelectItem value="fee">Fees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transaction List */}
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const typeConfig = {
    payment: {
      icon: ArrowUpRight,
      color: 'text-[#FF6B6B]',
      bgColor: 'bg-[#FF6B6B]/10',
      prefix: '-',
    },
    payout: {
      icon: ArrowDownLeft,
      color: 'text-[#00B8A9]',
      bgColor: 'bg-[#00B8A9]/10',
      prefix: '+',
    },
    refund: {
      icon: RefreshCw,
      color: 'text-[#F6A623]',
      bgColor: 'bg-[#F6A623]/10',
      prefix: '+',
    },
    fee: {
      icon: CreditCard,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      prefix: '-',
    },
  };

  const statusConfig = {
    completed: { label: 'Completed', color: 'bg-[#00B8A9]/10 text-[#00B8A9]', icon: CheckCircle },
    pending: { label: 'Pending', color: 'bg-[#F6A623]/10 text-[#F6A623]', icon: Clock },
    failed: { label: 'Failed', color: 'bg-[#D63031]/10 text-[#D63031]', icon: XCircle },
  };

  const config = typeConfig[transaction.type];
  const statusCfg = statusConfig[transaction.status];
  const Icon = config.icon;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border hover:border-[#00B8A9]/50 transition-colors">
      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", config.bgColor)}>
        <Icon className={cn("h-5 w-5", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[#1A2B4A] truncate">{transaction.description}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          {transaction.projectTitle && (
            <>
              <span>{transaction.projectTitle}</span>
              <span>•</span>
            </>
          )}
          <span>{transaction.date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}</span>
          {transaction.paymentMethod && (
            <>
              <span>•</span>
              <span>{transaction.paymentMethod}</span>
            </>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className={cn("font-bold font-mono", config.color)}>
          {config.prefix}${transaction.amount.toLocaleString()}
        </p>
        {transaction.fee && (
          <p className="text-xs text-muted-foreground">
            Fee: ${transaction.fee.toFixed(2)}
          </p>
        )}
      </div>
      <Badge className={statusCfg.color}>
        <StatusIcon className="h-3 w-3 mr-1" />
        {statusCfg.label}
      </Badge>
    </div>
  );
}
