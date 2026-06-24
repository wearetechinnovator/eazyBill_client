import { useEffect, useState } from "react";
import { Modal } from "rsuite";
import { Icons } from "../helper/icons";

const ConfirmModal = ({
    openConfirm,
    openStatus,
    title,
    isDel = true,
    fun
}) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(openConfirm);
    }, [openConfirm]);

    const handleClose = () => {
        setOpen(false);
        openStatus(false);
    };

    return (
        <Modal
            className="confirm__modal"
            open={open}
            onClose={handleClose}
            size="xs"
            centered
        >
            <Modal.Body>
                <div className="flex items-start gap-4">
                    <div className="shrink-0">
                        <Icons.WARNING className="text-[34px] text-yellow-500" />
                    </div>

                    <div className="flex-1">
                        <h5 className="text-[15px] font-semibold text-gray-800 mb-2">
                            Confirmation
                        </h5>
                        <p className="text-[13px] text-gray-600 leading-5">
                            {title}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        className="min-w-[90px] h-[34px] px-4 border border-gray-300 bg-white text-[13px] text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={handleClose}
                    >
                        Cancel
                    </button>

                    <button
                        className={`min-w-[90px] h-[34px] px-4 text-[13px] text-white transition-colors bg-red-600 hover:bg-red-700`}
                        onClick={() => fun && fun()}
                    >
                        {isDel ? "Delete" : "OK"}
                    </button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ConfirmModal;