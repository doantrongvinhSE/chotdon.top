import React from 'react';
import * as XLSX from 'xlsx';
import { RunningPost } from '../../types/posts';

interface ExportButtonProps {
  items: RunningPost[];
  className?: string;
}

export function ExportButton({ items, className = '' }: ExportButtonProps) {
  const exportToExcel = () => {
    // Tạo dữ liệu cho Excel
    const excelData = items.map(item => ({
      'Link': item.url,
      'Tiêu đề': item.title
    }));

    // Tạo workbook và worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Links');

    // Xuất file
    const fileName = `links_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const exportToText = () => {
    // Tạo dữ liệu cho Text với format link|tiêu đề
    const textData = items.map(item => `${item.url}|${item.title}`).join('\n');
    
    // Tạo blob và download
    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `links_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-sm text-gray-300 font-medium">Xuất dữ liệu:</span>
      <div className="flex gap-2">
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors duration-200"
          title="Xuất file Excel"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Excel
        </button>
        
        <button
          onClick={exportToText}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200"
          title="Xuất file Text"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Text
        </button>
      </div>
    </div>
  );
}
