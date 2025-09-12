/**
 * Utility functions for timestamp formatting and calculations
 */

export interface TimestampInfo {
  timestamp: string;
  minutesAgo: number;
  displayText: string;
}

/**
 * Parse a timestamp string and calculate how many minutes ago it was
 * @param timestampString - The timestamp string from Google Sheets (e.g., "09/12/2025, 16:38:18")
 * @returns TimestampInfo object with parsed data and display text
 */
export function calculateMinutesAgo(timestampString: string): TimestampInfo {
  console.log('🔍 calculateMinutesAgo called with:', timestampString);
  
  if (!timestampString || timestampString.trim() === '') {
    console.log('🔍 Empty timestamp string, returning Unknown');
    return {
      timestamp: '',
      minutesAgo: 0,
      displayText: 'Unknown'
    };
  }

  try {
    // Parse the timestamp string (format: "MM/DD/YYYY, HH:MM:SS")
    console.log('🔍 Parsing timestamp:', timestampString);
    const [datePart, timePart] = timestampString.split(', ');
    console.log('🔍 Date part:', datePart, 'Time part:', timePart);
    
    const [month, day, year] = datePart.split('/');
    const [hours, minutes, seconds] = timePart.split(':');
    console.log('🔍 Parsed parts - Month:', month, 'Day:', day, 'Year:', year, 'Hours:', hours, 'Minutes:', minutes, 'Seconds:', seconds);

    // Create a Date object
    const timestampDate = new Date(
      parseInt(year),
      parseInt(month) - 1, // Month is 0-indexed
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds)
    );

    // Calculate the difference in minutes
    const now = new Date();
    const diffInMs = now.getTime() - timestampDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    // Generate display text
    let displayText: string;
    if (diffInMinutes < 1) {
      displayText = 'Just now';
    } else if (diffInMinutes === 1) {
      displayText = '1 minute ago';
    } else if (diffInMinutes < 60) {
      displayText = `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) { // Less than 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      const remainingMinutes = diffInMinutes % 60;
      if (hours === 1) {
        displayText = remainingMinutes > 0 ? `1 hour ${remainingMinutes} minutes ago` : '1 hour ago';
      } else {
        displayText = remainingMinutes > 0 ? `${hours} hours ${remainingMinutes} minutes ago` : `${hours} hours ago`;
      }
    } else {
      // More than 24 hours - show the actual timestamp
      displayText = timestampDate.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }

    console.log('🔍 Final result - Minutes ago:', diffInMinutes, 'Display text:', displayText);
    
    return {
      timestamp: timestampString,
      minutesAgo: diffInMinutes,
      displayText: displayText
    };

  } catch (error) {
    console.error('Error parsing timestamp:', error);
    return {
      timestamp: timestampString,
      minutesAgo: 0,
      displayText: 'Invalid timestamp'
    };
  }
}

/**
 * Format a timestamp for display in the navbar
 * @param timestampString - The timestamp string from Google Sheets
 * @returns Formatted display text
 */
export function formatTimestampForDisplay(timestampString: string): string {
  const timestampInfo = calculateMinutesAgo(timestampString);
  return timestampInfo.displayText;
}
