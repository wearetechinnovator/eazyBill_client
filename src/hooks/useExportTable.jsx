import * as XLSX from 'xlsx';
import { Page, Text, View, Document, StyleSheet, pdf } from '@react-pdf/renderer';
import useMyToaster from './useMyToaster';

const useExportTable = () => {
  const toast = useMyToaster()

  // downloaExcel................
  const downloadExcel = (data, filename) => {
    try {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      toast("Download faild! " + error, 'error')
    }
  }

  // Copy Table.....................
  const copyTable = async (tableId) => {
    const elTable = document.querySelector('#' + tableId);
    if (!elTable) {
      console.error(`Table with id ${tableId} not found.`);
      return;
    }

    // Helper function to convert the table to a string format
    const tableToText = (table) => {
      let text = '';
      const rows = table.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        cells.forEach((cell, index) => {
          text += cell.textContent.trim();
          if (index < cells.length - 1) text += '\t'; // Tab between columns
        });
        text += '\n'; // New line after each row
      });
      return text;
    };

    try {
      // Creating a temporary textarea to copy the table content
      const textArea = document.createElement('textarea');
      textArea.value = tableToText(elTable); // Convert the table to a text representation
      document.body.appendChild(textArea);
      textArea.select();
      textArea.setSelectionRange(0, 99999); // For mobile devices

      // Using Clipboard API to copy text
      await navigator.clipboard.writeText(textArea.value);
      console.log('Table copied to clipboard.');

      // Remove the temporary textarea
      document.body.removeChild(textArea);
    } catch (e) {
      console.error('Failed to copy table:', e);
    }
  };


  // Print table..............
  const printTable = (tableRef, title) => {
    const tableHTML = tableRef.current.outerHTML;
    const newWindow = window.open("", "_blank", "width=800,height=600");
    newWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid gray;
              padding: 8px;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <h3>${title}</h3>
          ${tableHTML}
        </body>
      </html>
    `);

    // Close the document and trigger the print dialog
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
    newWindow.close();
  }


  // Download PDF..........
  const exportPdf = (title, data) => {
    console.log("exprot hook", data);
    const styles = StyleSheet.create({
      page: {
        padding: 20,
        backgroundColor: '#fff',
      },
      header: {
        marginBottom: 20,
        textAlign: 'center',
      },
      table: {
        display: 'flex',
        flexDirection: 'column',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        overflow: 'hidden',
      },
      row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
      },
      headerRow: {
        backgroundColor: '#3B82F6',
      },
      cell: {
        flex: 1,
        padding: 5,
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#ddd',
        fontSize: 10
      },
      headerCell: {
        color: 'white',
        fontWeight: 'bold',
      },
    });

    try {
      const obj = data && data[0];
      const MyDocument = (
        <Document>
          <Page size="A4" style={styles.page}>
            <View style={styles.header}>
              <Text>{title}</Text>
            </View>
            <View style={styles.table}>
              {/* Header Row */}
              <View style={[styles.row, styles.headerRow]}>
                {obj &&
                  Object.keys(obj).map((el, index) => (
                    <Text style={[styles.cell, styles.headerCell]} key={index}>
                      {el}
                    </Text>
                  ))}
              </View>
              {/* Data Rows */}
              {data &&
                data.map((d, rowIndex) => (
                  <View style={styles.row} key={rowIndex}>
                    {Object.keys(d).map((key, cellIndex) => (
                      <Text style={styles.cell} key={cellIndex}>
                        {d[key]}
                      </Text>
                    ))}
                  </View>
                ))}
            </View>
          </Page>
        </Document>

      );

      return MyDocument;
    } catch (error) {
      console.log(error)
    }
  }

  return { copyTable, downloadExcel, printTable, exportPdf };


}


export default useExportTable;
