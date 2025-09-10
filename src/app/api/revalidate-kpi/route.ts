import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Revalidate the dashboard page to force fresh data fetch
    revalidatePath('/dashboard');
    
    console.log('Dashboard page revalidated - fresh KPI data will be fetched');
    
    return NextResponse.json({
      success: true,
      message: 'Dashboard revalidated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error revalidating dashboard:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to revalidate dashboard',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
