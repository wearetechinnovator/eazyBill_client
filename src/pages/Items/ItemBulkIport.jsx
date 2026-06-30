import React, { useEffect, useRef, useState } from 'react';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Icons } from '../../helper/icons';
import useMyToaster from '../../hooks/useMyToaster';
import useApi from '../../hooks/useApi';
import ExcelJS from 'exceljs';
import {
    createUniver,
    defaultTheme,
    LocaleType,
    merge,
} from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import UniverPresetSheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US';
import { UniverDataValidationPlugin } from '@univerjs/data-validation';
import { UniverSheetsDataValidationPlugin } from '@univerjs/sheets-data-validation';
import { UniverSheetsDataValidationUIPlugin } from '@univerjs/sheets-data-validation-ui';

import '@univerjs/presets/lib/styles/preset-sheets-core.css';
import '@univerjs/sheets-data-validation/facade';
import '@univerjs/sheets-data-validation-ui/lib/index.css';




const ItemBulkIport = () => {
    const toast = useMyToaster();
    const token = Cookies.get("token");
    const navigate = useNavigate();
    const { getApiData } = useApi()
    const univerContainerRef = useRef(null);
    const univerAPIRef = useRef(null);
    const workbookDataRef = useRef(null);
    const [unit, setUnit] = useState([]);
    const [tax, setTax] = useState([]);
    const [itemCategory, setItemCategory] = useState([]);
    const [loading, setLoading] = useState(false);




    // Get Unit, Tax, ItemCategory
    useEffect(() => {
        (async () => {
            try {
                // Category
                {
                    const { data } = await getApiData("category");
                    setItemCategory([...data]);
                }
                // Tax
                {
                    const { data } = await getApiData("tax");
                    setTax([...data]);
                }
                // Unit
                {
                    const { data } = await getApiData("unit");
                    setUnit([...data]);
                }
            } catch (er) {
                return toast(er.message, 'error')
            }
        })()
    }, [])

    // Univer Sheet initialization;
    useEffect(() => {
        const { univerAPI } = createUniver({
            locale: LocaleType.EN_US,
            locales: {
                enUS: merge({}, UniverPresetSheetsCoreEnUS, {
                    'sheets-data-validation': {
                        validationDropdown: {
                            placeholder: 'Select'
                        }
                    }
                })
            },
            theme: defaultTheme,
            presets: [
                UniverSheetsCorePreset({
                    container: univerContainerRef.current,
                    footer: false,
                    header: false
                })
            ],
            plugins: [
                UniverDataValidationPlugin,
                UniverSheetsDataValidationPlugin,
                UniverSheetsDataValidationUIPlugin
            ],
        });

        univerAPIRef.current = univerAPI;
        const workbook = univerAPI.createWorkbook({
            id: 'items',
            name: 'Items',

            sheets: {
                sheet1: {
                    id: 'sheet1',
                    name: 'Sheet1',
                    cellData: {
                        0: {
                            0: { v: 'Item Name', t: 1, s: { fs: 10, } },
                            1: { v: 'Item Type', t: 1, s: { fs: 10, } },
                            2: { v: 'Category', t: 1, s: { fs: 10, } },
                            3: { v: 'Sale Price', t: 1, s: { fs: 10, } },
                            4: { v: 'Sale Tax Type', t: 1, s: { fs: 10, } },
                            5: { v: 'Purchase Price', t: 1, s: { fs: 10, } },
                            6: { v: 'Purchase Tax Type', t: 1, s: { fs: 10, } },
                            7: { v: 'GST Tax (%)', t: 1, s: { fs: 10, } },
                            8: { v: 'HSN/SAC', t: 1, s: { fs: 10, } },
                            9: { v: 'Unit', t: 1, s: { fs: 10, } },
                            10: { v: 'Opening Stock', t: 1, s: { fs: 10, } },
                        },
                        1: {
                            0: { v: 'Product 1', t: 1 },
                            1: { v: 'goods', t: 1 },
                            2: { v: '', t: 1 },
                            3: { v: 150, t: 2 },
                            4: { v: 'with tax', t: 1 },
                            5: { v: 100, t: 2 },
                            6: { v: 'with tax', t: 1 },
                            7: { v: '', t: 2 },
                            8: { v: 9999, t: 2 },
                            9: { v: '', t: 1 },
                            10: { v: 20, t: 2 },
                        }
                    },

                }
            }
        });

        const sheet = workbook.getActiveSheet();

        const unitRange = sheet.getRange('J2:J1000');
        const unitDropdown = univerAPI
            .newDataValidation()
            .requireValueInList(unit?.map(u => u?.title), false)
            .build();
        unitRange.setDataValidation(unitDropdown);

        const itemType = sheet.getRange('B2:B1000');
        const itemTypeDropDown = univerAPI
            .newDataValidation()
            .requireValueInList(['goods', 'service'], false)
            .build();
        itemType.setDataValidation(itemTypeDropDown);

        const categoryRange = sheet.getRange('C2:C1000');
        const itemCategoryDropDown = univerAPI
            .newDataValidation()
            .requireValueInList(itemCategory?.map(ic => ic.title), false)
            .build();
        categoryRange.setDataValidation(itemCategoryDropDown);

        const taxRange = sheet.getRange('H2:H1000');
        const taxDropDown = univerAPI
            .newDataValidation()
            .requireValueInList(tax?.map(t => t.gst), false)
            .build();
        taxRange.setDataValidation(taxDropDown);

        const salesTaxTypeRange = sheet.getRange('E2:E1000');
        const salesTaxTypeDropdown = univerAPI
            .newDataValidation()
            .requireValueInList(['with tax', 'without tax'], false)
            .build();
        salesTaxTypeRange.setDataValidation(salesTaxTypeDropdown);

        const purchaseTaxTypeRange = sheet.getRange('G2:G1000');
        const purchaseTaxTypeDropdown = univerAPI
            .newDataValidation()
            .requireValueInList(['with tax', 'without tax'], false)
            .build();
        purchaseTaxTypeRange.setDataValidation(purchaseTaxTypeDropdown);

    }, [unit, tax, itemCategory]);


    const handleDownload = async () => {
        const univerAPI = univerAPIRef.current;
        const workbook = univerAPI.getActiveWorkbook();
        const snapshot = workbook.save();

        const sheetId = Object.keys(snapshot.sheets)[0];
        const cellData = snapshot.sheets[sheetId].cellData;

        // ExcelJS workbook
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Sheet1');

        // Univer data rows convert karo
        const maxRow = Math.max(...Object.keys(cellData).map(Number));
        for (let r = 0; r <= maxRow; r++) {
            const row = [];
            for (let c = 0; c <= 10; c++) {
                row.push(cellData[r]?.[c]?.v ?? '');
            }
            ws.addRow(row);
        }

        //  Dynamic lists  (comma-separated, quoted as ExcelJS formula expects)
        const unitList = unit?.map(u => u?.title).filter(Boolean).join(',');
        const categoryList = itemCategory?.map(ic => ic?.title).filter(Boolean).join(',');
        const taxList = tax?.map(t => t?.gst).filter(Boolean).join(',');

        //  Dropdowns add 
        const validations = [
            { col: 'B', formula: '"Goods,Service"' },
            { col: 'C', formula: `"${categoryList}"` },
            { col: 'E', formula: '"with tax,without tax"' },
            { col: 'G', formula: '"with tax,without tax"' },
            { col: 'H', formula: `"${taxList}"` },
            { col: 'J', formula: `"${unitList}"` },
        ];

        validations.forEach(({ col, formula }) => {
            for (let row = 2; row <= 1000; row++) {
                ws.getCell(`${col}${row}`).dataValidation = {
                    type: 'list',
                    allowBlank: true,
                    formulae: [formula],
                    showDropDown: true,
                    showErrorMessage: true,
                    errorTitle: 'Invalid',
                    error: 'Please select from dropdown',
                };
            }
        });

        // Download
        const buffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'items_sample.xlsx';
        a.click();
        URL.revokeObjectURL(url);
    };


    const handleExcelUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const arrayBuffer = await file.arrayBuffer();
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(arrayBuffer);

                const worksheet = workbook.worksheets?.[0] ?? workbook.getWorksheet(1);

                if (!worksheet) {
                    return toast('Excel file not read, upload .xlsx file');
                }

                const wbInstance = univerAPIRef.current?.getActiveWorkbook();
                if (!wbInstance) {
                    return toast("Currently sheet not ready yet, wait some time..");
                }

                const sheet = wbInstance.getActiveSheet();
                if (!sheet) {
                    return toast("Active sheet not found");
                }

                const rowsData = [];

                console.log(worksheet);
                worksheet.eachRow((row, rowNumber) => {
                    if (rowNumber === 1) return; // header skip

                    const rowValues = [];
                    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'].forEach((col) => {
                        const cell = row.getCell(col);
                        let cellValue = cell?.value ?? '';

                        if (cellValue && typeof cellValue === 'object' && 'result' in cellValue) {
                            cellValue = cellValue.result ?? '';
                        }

                        rowValues.push(cellValue);
                    });

                    if (rowValues.every((v) => v === '' || v === null)) return;

                    rowsData.push(rowValues);
                });

                if (rowsData.length === 0) {
                    return toast("No data in excel file", 'error')
                }

                const range = sheet.getRange(1, 0, rowsData.length, rowsData[0].length);
                range.setValues(rowsData);

            } catch (err) {
                return toast("Excel not parse", 'error')
            }
        };

        input.click();
    };


    const convertToJson = (data) => {
        if (!data || data.length < 2) return [];

        const headers = data[0];
        const rows = data.slice(1);

        return rows.map((row) => {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index] ?? '';
            });
            return obj;
        });
    };


    const validateAndSave = async () => {
        try {
            const wbInstance = univerAPIRef.current?.getActiveWorkbook();
            if (!wbInstance) {
                return toast("Workbook not ready yet", 'error');
            }

            // Get first sheet only(Active sheet)
            const sheet = wbInstance.getActiveSheet();
            if (!sheet) {
                return toast("Sheet not ready yet", 'error');
            }

            // Get Data
            const usedRange = sheet.getRange(0, 0, sheet.getMaxRows(), sheet.getMaxColumns());
            const allData = usedRange.getValues();

            // Remove Empty rows
            const nonEmptyRows = allData.filter((row) =>
                row.some((cell) => cell !== '' && cell !== null && cell !== undefined)
            );

            const headerLength = nonEmptyRows[0]?.length
                ? nonEmptyRows[0].filter((c) => c !== null && c !== '').length
                : 0;

            const trimmedData = nonEmptyRows.map((row) => row.slice(0, headerLength));

            const jsonData = convertToJson(trimmedData)
            console.log(jsonData);

            const URL = process.env.REACT_APP_API_URL + "/item/bulk-add";
            const req = await fetch(URL, {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({ itemArr: jsonData, token })
            })
            const res = await req.json();
            if (req.status !== 200 || res.err) {
                return toast(res.err, 'error')
            }

            toast(res.msg, 'success');
            navigate(-1);
            return;
        } catch (err) {
            return toast("Something went wrong", 'error');
        }
    }


    return (
        <>
            <Nav title={'Bulk Item Import'} />
            <main id='main'>
                <SideNav />
                <div className='content__body'>
                    <div className='add_new_compnent flex items-center gap-2 justify-end'>
                        <button
                            onClick={handleDownload}
                            className={`bg-gray-50 border`}>
                            <Icons.DOWNLOAD size={15} />
                            Download Sample
                        </button>
                        <button
                            onClick={handleExcelUpload}
                            className={`bg-gray-50 border`}>
                            <Icons.EXCEL size={15} />
                            Upload Excel
                        </button>
                        <button
                            onClick={validateAndSave}
                            className={`bg-green-500 text-white`}>
                            <Icons.CHECK size={15} />
                            Validate & Save
                        </button>
                    </div>

                    <div className="content__body__main">
                        <div
                            ref={univerContainerRef}
                            style={{
                                height: "450px",
                                width: "100%",
                                background: "#fff",
                                borderRadius: 8
                            }}>
                        </div>
                    </div>
                </div>
            </main >
        </>
    )
}

export default ItemBulkIport;