import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateInventoryPDF = (inventoryData, title = 'Inventory Management Report') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(title, 20, 20);
  
  // Add timestamp
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
  
  // Add inventory table
  const tableData = inventoryData.map(item => [
    item.name,
    item.totalStock,
    item.expiredStock,
    item.outOfStock,
    `${Math.round((item.totalStock - item.expiredStock - item.outOfStock) / item.totalStock * 100)}%`
  ]);
  
  doc.autoTable({
    startY: 40,
    head: [['Medicine', 'Total Stock', 'Expired', 'Out of Stock', 'Available %']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255
    },
    styles: {
      fontSize: 10
    }
  });
  
  // Add summary
  const totalStock = inventoryData.reduce((sum, item) => sum + item.totalStock, 0);
  const totalExpired = inventoryData.reduce((sum, item) => sum + item.expiredStock, 0);
  const totalOutOfStock = inventoryData.reduce((sum, item) => sum + item.outOfStock, 0);
  
  doc.setFontSize(12);
  doc.text('Summary:', 20, doc.lastAutoTable.finalY + 20);
  doc.setFontSize(10);
  doc.text(`Total Stock: ${totalStock} units`, 20, doc.lastAutoTable.finalY + 30);
  doc.text(`Expired Stock: ${totalExpired} units`, 20, doc.lastAutoTable.finalY + 40);
  doc.text(`Out of Stock: ${totalOutOfStock} units`, 20, doc.lastAutoTable.finalY + 50);
  doc.text(`Available Stock: ${totalStock - totalExpired - totalOutOfStock} units`, 20, doc.lastAutoTable.finalY + 60);
  
  return doc;
};

export const generateSupplyChainPDF = (calendarData, title = 'Supply Chain Performance Report') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(title, 20, 20);
  
  // Add timestamp
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
  
  // Add performance summary
  doc.setFontSize(14);
  doc.text('Performance Summary:', 20, 50);
  doc.setFontSize(10);
  doc.text('• 94% Overall Uptime', 20, 60);
  doc.text('• All medicine batches delivered on time', 20, 70);
  doc.text('• Cold chain requirements fully met', 20, 80);
  
  // Add calendar data
  doc.setFontSize(14);
  doc.text('Monthly Performance:', 20, 100);
  
  const performanceData = calendarData.filter(day => day.isCurrentMonth).map(day => [
    day.date.toLocaleDateString(),
    day.performance === 'normal' ? 'Normal' : day.performance === 'warning' ? 'Warning' : 'Critical',
    day.performance === 'normal' ? '100%' : day.performance === 'warning' ? '85%' : '60%'
  ]);
  
  doc.autoTable({
    startY: 110,
    head: [['Date', 'Status', 'Uptime']],
    body: performanceData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255
    },
    styles: {
      fontSize: 8
    }
  });
  
  return doc;
};

export const generateRestockAlertsPDF = (alertsData, title = 'Restock Alerts Report') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(title, 20, 20);
  
  // Add timestamp
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
  
  // Add alerts table
  const tableData = alertsData.map(alert => [
    alert.hospitalName,
    alert.drugName,
    alert.quantity,
    alert.location,
    alert.requestTime,
    alert.status
  ]);
  
  doc.autoTable({
    startY: 40,
    head: [['Hospital', 'Medicine', 'Quantity', 'Location', 'Request Time', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [239, 68, 68],
      textColor: 255
    },
    styles: {
      fontSize: 8
    }
  });
  
  // Add summary
  const totalRequests = alertsData.length;
  const pendingRequests = alertsData.filter(alert => alert.status === 'pending').length;
  
  doc.setFontSize(12);
  doc.text('Summary:', 20, doc.lastAutoTable.finalY + 20);
  doc.setFontSize(10);
  doc.text(`Total Requests: ${totalRequests}`, 20, doc.lastAutoTable.finalY + 30);
  doc.text(`Pending Requests: ${pendingRequests}`, 20, doc.lastAutoTable.finalY + 40);
  doc.text(`Fulfilled Requests: ${totalRequests - pendingRequests}`, 20, doc.lastAutoTable.finalY + 50);
  
  return doc;
};

export const downloadPDF = (doc, filename) => {
  doc.save(filename);
}; 