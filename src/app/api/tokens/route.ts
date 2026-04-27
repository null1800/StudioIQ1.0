import { NextRequest, NextResponse } from 'next/server';
import { tokenService } from '@/lib/tokens';
import { authService } from '@/lib/auth';

export async function GET() {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const [balance, transactions, dailyUsage] = await Promise.all([
      tokenService.getBalance(user.id),
      tokenService.getTransactionHistory(user.id, 20),
      tokenService.getDailyUsage(user.id),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        balance,
        transactions,
        dailyUsage,
        tokenValue: 0.02,
      },
    });
  } catch (error) {
    console.error('Tokens API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authService.getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, amount, type } = body;

    switch (action) {
      case 'purchase':
        // This would integrate with Stripe in production
        // For now, simulate token purchase
        if (!amount || amount <= 0) {
          return NextResponse.json(
            { success: false, error: 'Invalid amount' },
            { status: 400 }
          );
        }
        
        const result = await tokenService.addTokens(
          user.id,
          amount,
          'purchase',
          { purchasedVia: 'stripe' }
        );

        return NextResponse.json(result);

      case 'check-balance':
        const balance = await tokenService.getBalance(user.id);
        return NextResponse.json({ success: true, balance });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Tokens API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
