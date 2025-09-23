import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Revalidate all dashboard pages to force fresh data fetch
    revalidatePath('/dashboard');
    revalidatePath('/wagmi-fund-module');
    revalidatePath('/investor');
    
    console.log('All dashboard pages revalidated - fresh KPI data will be fetched');
    
    return NextResponse.json({
      success: true,
      message: 'All dashboard pages revalidated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error revalidating dashboard pages:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to revalidate dashboard pages',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
