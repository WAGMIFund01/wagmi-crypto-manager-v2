/**
 * Simple timestamp utilities - just compare database time to current time
 */

/**
 * Format a timestamp for display - shows relative time like "5 minutes ago"
 * @param timestampString - Timestamp from Google Sheets (e.g., "09/12/2025, 21:21:50")
 * @returns Relative time string
 */
export function formatTimestampForDisplay(timestampString: string): string {
  if (!timestampString || timestampString.trim() === '') {
    return 'Unknown';
  }

  try {
    // Parse the timestamp string (format: "MM/DD/YYYY, HH:MM:SS")
    const [datePart, timePart] = timestampString.split(', ');
    const [month, day, year] = datePart.split('/');
    const [hours, minutes, seconds] = timePart.split(':');

    // Create Date object from the timestamp
    const timestampDate = new Date(
      parseInt(year),
      parseInt(month) - 1, // Month is 0-indexed
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds)
    );

    // Get current time
    const now = new Date();
    
    // Calculate difference in milliseconds
    const diffMs = now.getTime() - timestampDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    console.log('Timestamp calculation:', {
      timestampString,
      timestampDate: timestampDate.toISOString(),
      now: now.toISOString(),
      diffMs,
      diffMinutes
    });

    // Return relative time based on difference
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes === 1) {
      return '1 minute ago';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffMinutes < 1440) { // Less than 24 hours
      const hours = Math.floor(diffMinutes / 60);
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else { // 24+ hours
      const days = Math.floor(diffMinutes / 1440);
      return days === 1 ? '1 day ago' : `${days} days ago`;
    }

  } catch (error) {
    console.error('Error parsing timestamp:', error);
    return 'Unknown';
  }
}

// Legacy export for compatibility
export interface TimestampInfo {
  timestamp: string;
  minutesAgo: number;
  displayText: string;
}

export function calculateMinutesAgo(timestampString: string): TimestampInfo {
  const displayText = formatTimestampForDisplay(timestampString);
  return {
    timestamp: timestampString,
    minutesAgo: 0, // Not needed for simple display
    displayText: displayText
  };
}