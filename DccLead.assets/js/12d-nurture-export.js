function getLeadSystemLogs(lead) {
  return [
    { time: `${lead.createdAt} 09:12:18`, node: '线索接入', operator: '系统', type: '创建', desc: `来源线索 ${lead.sourceLeadId} 接入培育池`, result: '成功' },
    { time: `${lead.createdAt} 09:13:02`, node: '规则匹配', operator: '系统', type: '分配', desc: `识别意向车系 ${lead.intentSeries}，匹配专营店 ${lead.dealer}`, result: '成功' },
    { time: `${lead.createdAt} 10:05:36`, node: '培育跟进', operator: lead.followUserId || 'DCC-EMP-001', type: '更新', desc: `线索状态更新为 ${lead.status}`, result: '成功' },
    { time: `${lead.createdAt} 11:28:09`, node: '企微触达', operator: '系统', type: '同步', desc: '同步企微添加状态和客户触达结果', result: lead.wecomAddTime ? '成功' : '待处理' }
  ];
}

function exportNurtureLeads() {
  const columns = nurtureLeadColumns.filter(col => visibleNurtureLeadFields.includes(col.key));
  const rows = getFilteredNurtureLeads();
  const csvRows = [
    columns.map(col => csvEscape(col.label)).join(','),
    ...rows.map(row => columns.map(col => csvEscape(row[col.key] || '')).join(','))
  ];
  downloadCsvFile(`培育线索_${new Date().toISOString().slice(0, 10)}.csv`, csvRows, `已导出 ${rows.length} 条培育线索`);
}

function downloadCsvFile(fileName, csvRows, successMessage) {
  const blob = new Blob(['\ufeff' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast(successMessage, true);
}

function downloadExcelWorkbookFile(fileName, sheets, successMessage) {
  const workbookXml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="header"><Font ss:Bold="1"/><Interior ss:Color="#D9D9D9" ss:Pattern="Solid"/></Style>
  <Style ss:ID="text"><NumberFormat ss:Format="@"/></Style>
 </Styles>
 ${sheets.map(sheet => `
 <Worksheet ss:Name="${excelXmlEscape(sheet.name).slice(0, 31)}">
  <Table>
   <Row>${sheet.columns.map(col => `<Cell ss:StyleID="header"><Data ss:Type="String">${excelXmlEscape(col)}</Data></Cell>`).join('')}</Row>
   ${sheet.rows.map(row => `<Row>${row.map(cell => `<Cell ss:StyleID="text"><Data ss:Type="String">${excelXmlEscape(cell ?? '')}</Data></Cell>`).join('')}</Row>`).join('')}
  </Table>
 </Worksheet>`).join('')}
</Workbook>`;
  const blob = new Blob(['\ufeff' + workbookXml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast(successMessage, true);
}

function excelXmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function csvEscape(value) {
  const text = String(value).replace(/"/g, '""');
  return /[",\n]/.test(text) ? `"${text}"` : text;
}
