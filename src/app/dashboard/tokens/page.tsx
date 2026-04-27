'use client';

import { useQuery } from '@tanstack/react-query';
import { Coins, ArrowUpRight, ArrowDownRight, History } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export default function TokensPage() {
  const { data: tokenData, isLoading } = useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      const res = await fetch('/api/tokens');
      const json = await res.json();
      return json.data;
    },
  });

  const TOKEN_COSTS = [
    { feature: 'Channel Analysis', cost: 3 },
    { feature: 'Content Ideas', cost: 5 },
    { feature: 'Thumbnail Generation', cost: 6 },
    { feature: 'Script Generation', cost: 8 },
    { feature: 'Production Setup', cost: 10 },
    { feature: 'Studio Simulation', cost: 15 },
    { feature: 'Video Preview', cost: 25 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Token Balance</h1>
        <p className="text-gray-400">Manage your tokens and view transaction history</p>
      </div>

      {/* Balance Card */}
      <div className="card p-8 bg-gradient-to-br from-brand-500/10 to-accent-purple/10 border-brand-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 mb-1">Current Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">
                {isLoading ? '...' : formatNumber(tokenData?.balance || 0)}
              </span>
              <span className="text-brand-400">tokens</span>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              ≈ ${((tokenData?.balance || 0) * 0.02).toFixed(2)} USD
            </p>
          </div>
          <div className="w-16 h-16 bg-brand-500/20 rounded-xl flex items-center justify-center">
            <Coins className="w-8 h-8 text-brand-400" />
          </div>
        </div>
      </div>

      {/* Token Costs */}
      <div className="card">
        <h2 className="section-title">Feature Costs</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOKEN_COSTS.map((item) => (
            <div
              key={item.feature}
              className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg"
            >
              <span className="text-gray-300">{item.feature}</span>
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-brand-400" />
                <span className="text-brand-400 font-semibold">{item.cost}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-4">
          1 token = $0.02 USD. Tokens are deducted before execution. 
          Failed operations are automatically refunded.
        </p>
      </div>

      {/* Transaction History */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <History className="w-5 h-5 text-brand-400" />
          <h2 className="section-title mb-0">Recent Transactions</h2>
        </div>

        {tokenData?.transactions?.length > 0 ? (
          <div className="space-y-3">
            {tokenData.transactions.map((tx: any) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      tx.amount > 0
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {tx.amount > 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium capitalize">
                      {tx.type.replace('_', ' ')}
                    </p>
                    {tx.feature && (
                      <p className="text-gray-400 text-sm">{tx.feature}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      tx.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {tx.amount > 0 ? '+' : ''}
                    {tx.amount} tokens
                  </p>
                  <p className="text-gray-500 text-sm">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <History className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400">No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
