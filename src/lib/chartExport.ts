import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';

export interface ChartExportOptions {
  filename?: string;
  quality?: number;
  format?: 'png' | 'pdf' | 'csv';
  includeData?: boolean;
  title?: string;
  timePeriod?: string;
  dataSource?: string;
}

export interface ChartData {
  month: string;
  endingAUM: number;
  wagmiMoM?: number;
  personalMoM?: number;
  totalMoM?: number;
  total3MoM?: number;
  wagmiCumulative?: number;
  personalCumulative?: number;
  totalCumulative?: number;
  total3Cumulative?: number;
}

export class ChartExporter {
  /**
   * Debug function to test if we can capture any element
   */
  static async debugExport(
    chartElement: HTMLElement
  ): Promise<void> {
    try {
      console.log('=== DEBUG EXPORT TEST ===');
      
      // Test 1: Basic element info
      console.log('Element info:', {
        tagName: chartElement.tagName,
        className: chartElement.className,
        id: chartElement.id,
        innerHTML: chartElement.innerHTML.substring(0, 200) + '...',
        offsetWidth: chartElement.offsetWidth,
        offsetHeight: chartElement.offsetHeight,
        clientWidth: chartElement.clientWidth,
        clientHeight: chartElement.clientHeight
      });
      
      // Test 2: Try to find SVG elements
      const svgElements = chartElement.querySelectorAll('svg');
      console.log('SVG elements found:', svgElements.length);
      svgElements.forEach((svg, index) => {
        console.log(`SVG ${index}:`, {
          width: svg.getAttribute('width'),
          height: svg.getAttribute('height'),
          viewBox: svg.getAttribute('viewBox'),
          innerHTML: svg.innerHTML.substring(0, 100) + '...'
        });
      });
      
      // Test 3: Try to find canvas elements
      const canvasElements = chartElement.querySelectorAll('canvas');
      console.log('Canvas elements found:', canvasElements.length);
      
      // Test 4: Try to find any images
      const imgElements = chartElement.querySelectorAll('img');
      console.log('Image elements found:', imgElements.length);
      
      // Test 5: Try basic html2canvas
      console.log('Testing html2canvas...');
      const canvas = await html2canvas(chartElement, {
        logging: true,
        useCORS: true,
        allowTaint: true
      });
      console.log('html2canvas result:', {
        width: canvas.width,
        height: canvas.height,
        toDataURL: canvas.toDataURL().substring(0, 100) + '...'
      });
      
      // Test 6: Try html-to-image
      console.log('Testing html-to-image...');
      const dataUrl = await toPng(chartElement);
      console.log('html-to-image result:', {
        length: dataUrl.length,
        preview: dataUrl.substring(0, 100) + '...'
      });
      
    } catch (error) {
      console.error('Debug export failed:', error);
    }
  }
  /**
   * Export chart as PNG image - HIDE EXPORT BUTTONS
   */
  static async exportAsPNG(
    chartElement: HTMLElement, 
    options: ChartExportOptions = {}
  ): Promise<void> {
    try {
      console.log('Starting PNG export with hidden buttons...');
      
      // Find and hide only the export buttons (PNG, PDF, CSV)
      const allButtons = chartElement.querySelectorAll('button');
      const exportButtons = Array.from(allButtons).filter(button => {
        const buttonText = button.textContent?.toLowerCase() || '';
        return buttonText.includes('png') || buttonText.includes('pdf') || buttonText.includes('csv') || buttonText.includes('debug');
      });
      
      const originalStyles: { element: HTMLElement; display: string }[] = [];
      
      exportButtons.forEach(button => {
        const htmlButton = button as HTMLElement;
        originalStyles.push({
          element: htmlButton,
          display: htmlButton.style.display
        });
        htmlButton.style.display = 'none';
      });
      
      console.log(`Hidden ${exportButtons.length} export buttons (PNG, PDF, CSV, DEBUG)`);
      
      // Wait a moment for the DOM to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Capture the image
      const dataUrl = await toPng(chartElement, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#111827'
      });
      
      // Restore the buttons
      originalStyles.forEach(({ element, display }) => {
        element.style.display = display;
      });
      
      console.log('Restored export buttons');
      
      // Create download
      const link = document.createElement('a');
      link.download = 'chart.png';
      link.href = dataUrl;
      link.click();
      
      console.log('PNG export completed');
    } catch (error) {
      console.error('Error exporting PNG:', error);
      alert('Export failed: ' + (error as Error).message);
    }
  }

  /**
   * Export chart as PDF - HIDE EXPORT BUTTONS
   */
  static async exportAsPDF(
    chartElement: HTMLElement,
    options: ChartExportOptions = {}
  ): Promise<void> {
    try {
      console.log('Starting PDF export with hidden buttons...');
      
      // Find and hide only the export buttons (PNG, PDF, CSV)
      const allButtons = chartElement.querySelectorAll('button');
      const exportButtons = Array.from(allButtons).filter(button => {
        const buttonText = button.textContent?.toLowerCase() || '';
        return buttonText.includes('png') || buttonText.includes('pdf') || buttonText.includes('csv') || buttonText.includes('debug');
      });
      
      const originalStyles: { element: HTMLElement; display: string }[] = [];
      
      exportButtons.forEach(button => {
        const htmlButton = button as HTMLElement;
        originalStyles.push({
          element: htmlButton,
          display: htmlButton.style.display
        });
        htmlButton.style.display = 'none';
      });
      
      console.log(`Hidden ${exportButtons.length} export buttons for PDF (PNG, PDF, CSV, DEBUG)`);
      
      // Wait a moment for the DOM to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Capture the image
      const dataUrl = await toPng(chartElement, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#111827'
      });
      
      // Restore the buttons
      originalStyles.forEach(({ element, display }) => {
        element.style.display = display;
      });
      
      console.log('Restored export buttons');
      
      // Create PDF in landscape orientation
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // A4 landscape dimensions: 297mm x 210mm
      const pageWidth = 297;
      const pageHeight = 210;
      
      // Add image to fill the entire page
      pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidth, pageHeight);
      pdf.save('chart.pdf');
      
      console.log('PDF export completed in landscape mode');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('PDF export failed: ' + (error as Error).message);
    }
  }

  /**
   * Export chart data as CSV - BASIC APPROACH
   */
  static exportAsCSV(
    data: ChartData[], 
    options: ChartExportOptions = {}
  ): void {
    try {
      console.log('Starting CSV export...');
      
      const headers = ['Month', 'Ending AUM'];
      const csvContent = [
        headers.join(','),
        ...data.map(row => [row.month, row.endingAUM].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'chart.csv';
      link.click();
      
      console.log('CSV export completed');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('CSV export failed: ' + (error as Error).message);
    }
  }

  /**
   * Generate a consistent filename for exports
   */
  static getExportFilename(baseName: string, format: 'png' | 'pdf' | 'csv'): string {
    const timestamp = new Date().toISOString().replace(/[:.-]/g, '');
    return `${baseName}-${timestamp}.${format}`;
  }
}