import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { Input, InputGroup, Modal, Toggle } from 'rsuite'
import { Icons } from '../helper/icons';
import { toggleBarCodeModal } from '../store/barcodeModalSlice';

const BarCodeModal = ({data}) => {
    const dispatch = useDispatch();
    const barCodeModal = useSelector(state=> state.barcodeModal.show);
    const [barCodeSettings, setBarCodeSettings] = useState({
        enabled: false,
        itemCode: true,
        itemName: true,
        itemPrice: true,
        numberOfPrint: 1,
    });

    const downloadBarCode = async () => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = `https://api-bwipjs.metafloor.com/?bcid=code128&text=${data?.itemCode}`;

        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 250;
            canvas.height = 100;

            const ctx = canvas.getContext("2d");

            // White background
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw barcode
            ctx.drawImage(img, 90, 10, 120, 40);

            let y = 60;

            // Item code
            if (barCodeSettings.itemCode) {
                ctx.font = "12px sans-serif";
                ctx.fillStyle = "#000";
                ctx.fillText(data?.itemCode || "", 110, y);
                y += 15;
            }

            // Item name
            if (barCodeSettings.itemName) {
                ctx.font = "12px sans-serif";
                ctx.fillText((data?.title || "").slice(0, 10), 110, y);
                y += 15;
            }

            // Price
            if (barCodeSettings.itemPrice) {
                ctx.font = "12px sans-serif";
                ctx.fillText(
                    `Price: ${parseFloat(data?.salePrice || 0).toFixed(2)}`,
                    100,
                    y
                );
            }

            // Convert to image
            const link = document.createElement("a");
            link.download = `${data?.itemCode || "barcode"}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        };
    }


    const printBarcode = () => {
        let html = `
    <div style="display: flex; flex-wrap: wrap; gap: 10px; padding: 10px;">
  `;

        for (let i = 0; i < barCodeSettings.numberOfPrint; i++) {
            html += `
      <div style="display: flex; flex-direction: column; align-items: center; width: 140px; border: 1px solid #ddd; padding: 4px;">
        <img style="height:30px; width:120px"
          src="https://api-bwipjs.metafloor.com/?bcid=code128&text=${data?.itemCode || ''}"
        />

        ${barCodeSettings.itemCode ? `
          <label style="font-size:10px">${data?.itemCode}</label>
        ` : ''}

        ${barCodeSettings.itemName ? `
          <label style="font-size:10px">${(data?.title || '').slice(0, 10)}</label>
        ` : ''}

        ${barCodeSettings.itemPrice ? `
          <label style="font-size:10px">Price: ${parseFloat(data?.salePrice || 0).toFixed(2)}</label>
        ` : ''}
      </div>
    `;
        }

        html += `</div>`;

        // Replace document body with the barcode layout
        document.body.innerHTML = html;

        window.print();
        window.location.reload();
    }

    return (
        <Modal
            size='xs'
            open={barCodeModal}
            onClose={() => {
                dispatch(toggleBarCodeModal(false));
                setBarCodeSettings({ ...barCodeSettings, enabled: false })
            }}
        >
            <Modal.Header>
                <div className='w-full pr-2 flex items-center justify-between'>
                    <p className='font-semibold'>View Barcode</p>
                    <Icons.SETTING
                        className={'cursor-pointer transition-all' + (barCodeSettings.enabled ? ' rotate-90' : '')}
                        onClick={() => {
                            setBarCodeSettings({ ...barCodeSettings, enabled: !barCodeSettings.enabled })
                        }}
                    />
                </div>
            </Modal.Header>
            <Modal.Body>
                <div className='flex flex-col items-center justify-center w-[95%] p-2 rounded bg-white mx-auto'>
                    <img
                        className='h-[30px] w-[120px]'
                        src={`https://api-bwipjs.metafloor.com/?bcid=code128&text=${data?.itemCode}`}
                        alt="Barcode"
                    />
                    {barCodeSettings.itemCode && <label className='text-[10px]'>{data?.itemCode}</label>}
                    {barCodeSettings.itemName && <label className='text-[10px]'>{(data?.title)?.slice(0, 10)}</label>}
                    {barCodeSettings.itemPrice && <label className='text-[10px]'>Price: {parseFloat(data?.salePrice).toFixed(2)}</label>}
                </div>
                <div className='w-[95%] mt-4 px-2 flex items-center justify-between'>
                    <p className='text-[11px]'>
                        Number of barcode you want to print
                    </p>

                    <InputGroup size='sm' style={{ width: '100px' }}>
                        <InputGroup.Addon
                            className='cursor-pointer'
                            onClick={() => {
                                if (barCodeSettings.numberOfPrint > 1) {
                                    setBarCodeSettings({ ...barCodeSettings, numberOfPrint: barCodeSettings.numberOfPrint - 1 })
                                }
                            }}
                        >
                            -
                        </InputGroup.Addon>
                        <Input
                            onChange={(v) => {
                                if (v < 1) v = 1;
                                setBarCodeSettings({ ...barCodeSettings, numberOfPrint: v })
                            }}
                            value={barCodeSettings.numberOfPrint}
                        />
                        <InputGroup.Addon
                            className='cursor-pointer'
                            onClick={() => {
                                setBarCodeSettings({ ...barCodeSettings, numberOfPrint: barCodeSettings.numberOfPrint + 1 })
                            }}
                        >
                            +
                        </InputGroup.Addon>
                    </InputGroup>
                </div>

                {/* ======== [Settings] ======= */}
                {
                    barCodeSettings.enabled && <div className='mx-auto w-[95%] mt-4 p-1 flex flex-col text-xs'>
                        <div className='flex items-center justify-between border-b pb-1'>
                            <p>Show item code</p>
                            <Toggle
                                size='sm'
                                checked={barCodeSettings.itemCode}
                                onChange={(e) => setBarCodeSettings({ ...barCodeSettings, itemCode: e })}
                            />
                        </div>
                        <div className='flex items-center justify-between border-b py-1'>
                            <p>Show item name</p>
                            <Toggle
                                size='sm'
                                checked={barCodeSettings.itemName}
                                onChange={(e) => setBarCodeSettings({ ...barCodeSettings, itemName: e })}
                            />
                        </div>
                        <div className='flex items-center justify-between border-b py-1'>
                            <p>Show item price</p>
                            <Toggle
                                size='sm'
                                checked={barCodeSettings.itemPrice}
                                onChange={(e) => setBarCodeSettings({ ...barCodeSettings, itemPrice: e })}
                            />
                        </div>
                    </div>
                }
            </Modal.Body>
            <Modal.Footer>
                <div className='w-full flex items-center gap-2'>
                    <button
                        className='justify-center text-xs flex w-full items-center gap-1 border border-gray-300 hover:border-blue-300 px-2 py-1 rounded'
                        onClick={downloadBarCode}
                    >
                        DOWNLOAD
                        <Icons.DOWNLOAD />
                    </button>

                    <button
                        className='justify-center text-xs flex w-full items-center gap-1 bg-blue-400 hover:bg-blue-500 text-white px-2 py-1 rounded'
                        onClick={printBarcode}
                    >
                        PRINT
                        <Icons.PRINTER />
                    </button>
                </div>
            </Modal.Footer>
        </Modal>
    )
}

export default BarCodeModal