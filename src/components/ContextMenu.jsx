import { useEffect, useRef } from "react"
import { Icons } from "../helper/icons"



// Only Call This Component and add a class `view` in `content__body__main`;
// =========================================================================
const ContextMenu = ({ print, copy, pdf, excel }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const win = document.querySelector(".view");
        const contentBody = document.querySelector(".content__body");
        const menu = menuRef.current;

        if (!win || !contentBody || !menu) return;

        const handleContextMenu = (e) => {
            e.preventDefault();

            menu.style.display = "flex";
            menu.style.left = `${e.pageX}px`;
            menu.style.top = `${e.pageY}px`;
        };

        const handleClick = () => {
            menu.style.display = "none";
        };

        win.addEventListener("contextmenu", handleContextMenu);
        contentBody.addEventListener("click", handleClick);

        
        return () => {
            win.removeEventListener("contextmenu", handleContextMenu);
            contentBody.removeEventListener("click", handleClick);
        };

    }, [print, copy, pdf, excel]);
    return (
        <div ref={menuRef} className='context__menu'>
            <div className='download__menu border-b' onClick={() => window.location.reload()} >
                <Icons.RESET className='text-[16px]' />
                Reload
            </div>
            <div className='download__menu' onClick={() => {
                menuRef.current.style.display = "none";
                print();
            }} >
                <Icons.PRINTER className='text-[16px]' />
                Print Table
            </div>
            <div className='download__menu' onClick={() => {
                menuRef.current.style.display = "none";
                copy()
            }}>
                <Icons.COPY className='text-[16px]' />
                Copy Table
            </div>
            <div className='download__menu' onClick={() => {
                menuRef.current.style.display = "none";
                pdf()
            }}>
                <Icons.PDF className="text-[16px]" />
                Download Pdf
            </div>
            <div className='download__menu' onClick={() => {
                menuRef.current.style.display = "none";
                excel()
            }} >
                <Icons.EXCEL className='text-[16px]' />
                Download Excel
            </div>
        </div>
    )
}

export default ContextMenu;