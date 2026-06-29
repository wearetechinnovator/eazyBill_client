import React, { useEffect, useRef } from 'react';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Icons } from '../../helper/icons';
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

import ExcelJS from 'exceljs';



const ItemBulkIport = () => {
    const token = Cookies.get("token");
    const navigate = useNavigate();
    const univerContainerRef = useRef(null);
    const univerAPIRef = useRef(null);
    const workbookDataRef = useRef(null);


    useEffect(() => {
        console.log("Effect ran. Ref is:", univerAPIRef.current);

        const header = document.querySelector('[data-u-comp="ribbon-header-menu"]');

        if (header) {
            console.log("Found header! Parent is:", header.parentElement);
            header.parentElement.style.display = 'none';
        } else {
            console.log("Header NOT FOUND. It either hasn't loaded yet, or is inside a Shadow DOM.");
        }
    }, [univerAPIRef]);


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
                    container: univerContainerRef.current
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
                            4: { v: 'Tax Type', t: 1, s: { fs: 10, } },
                            5: { v: 'Purchase Price', t: 1, s: { fs: 10, } },
                            6: { v: 'Tax Type', t: 1, s: { fs: 10, } },
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
                            4: { v: 1, t: 2 },
                            5: { v: 100, t: 2 },
                            6: { v: 1, t: 2 },
                            7: { v: 5, t: 2 },
                            8: { v: 123456, t: 2 },
                            9: { v: 'PCS', t: 1 },
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
            .requireValueInList(['PCS', 'BOX', 'KG', 'LTR'], false)
            .build();
        unitRange.setDataValidation(unitDropdown);


        const itemType = sheet.getRange('B2:B1000');
        const itemTypeDropDown = univerAPI
            .newDataValidation()
            .requireValueInList(['Goods', 'Service'], false)
            .build();
        itemType.setDataValidation(itemTypeDropDown);

    }, []);


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

        // ✅ Dropdowns add karo
        const validations = [
            { col: 'B', formula: '"Goods,Service"' },
            { col: 'E', formula: '"inclusive,exclusive,none"' },
            { col: 'G', formula: '"inclusive,exclusive,none"' },
            { col: 'J', formula: '"PCS,BOX,KG,LTR"' },
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
                            onClick={() => navigate("/admin/item/bulk-import")}
                            className={`bg-gray-50 border`}>
                            <Icons.EXCEL size={15} />
                            Upload Excel
                        </button>
                        <button
                            onClick={() => navigate("/admin/item/bulk-import")}
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

export default ItemBulkIport