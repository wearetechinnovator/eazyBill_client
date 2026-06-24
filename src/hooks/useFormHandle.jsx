import useApi from './useApi';


const useFormHandle = () => {
    const { getApiData } = useApi();

    //========================================= [Add item row] ========================================;
    const addItem = (which, itemRowSet, setItemRows, setFormData, additionalRowSet, setAdditionalRow) => {
        if (which === 1) {
            setItemRows((prevItemRows) => {
                const newItem = {
                    ...itemRowSet,
                    rowItem: prevItemRows.length > 0 ? prevItemRows[prevItemRows.length - 1].rowItem + 1 : itemRowSet.rowItem,
                };
                const updatedItems = [...prevItemRows, newItem];

                // Update formData after itemRows is updated
                setFormData((prev) => ({
                    ...prev,
                    items: updatedItems,
                }));

                return updatedItems;
            });
        } else {
            setAdditionalRow((prevAdditionalRows) => {
                const newAdditionalRow = {
                    ...additionalRowSet,
                    additionalRowsItem: prevAdditionalRows.length > 0 ? prevAdditionalRows[prevAdditionalRows.length - 1].additionalRowsItem + 1 : additionalRowSet.additionalRowsItem,
                };
                const updatedAdditionalRows = [...prevAdditionalRows, newAdditionalRow];

                // Update formData after additionalRows is updated
                setFormData((prev) => ({
                    ...prev,
                    additionalCharge: updatedAdditionalRows,
                }));

                return updatedAdditionalRows;
            });
        }
    };

    // ===================================== [On Item chagne ]====================================;
    const onItemChange = async (value, index, tax, ItemRows, setItemRows, setItems) => {
        const data = await getApiData("item");
        setItems([...data.data]);

        const selectedItem = data.data.find(i => i._id === value);
        if (selectedItem) {
            const item = [...ItemRows];
            const currentUnit = [];
            const taxId = selectedItem.category?.tax || selectedItem.tax;
            const getTax = tax.filter((t, _) => t._id === taxId)[0];

            item[index].itemName = selectedItem.title;
            item[index].hsn = selectedItem.category?.hsn || selectedItem.hsn;
            // item[index].unit = selectedItem?.unit;
            item[index].selectedUnit = selectedItem.unit[0]?.unit
            item[index].price = selectedItem.salePrice;
            item[index].tax = getTax?.gst ?? 0.0;
            item[index].itemId = selectedItem?._id;

            selectedItem?.unit.forEach((u, _) => {
                currentUnit.push(u.unit);
            })
            item[index].unit = [...currentUnit];

            setItemRows(item);
        }

    }

    // ===================================[Delete item and additional row] ==============================;
    const deleteItem = (which, ItemId, setItemRows, setFormData, setAdditionalRow) => {
        // Item Row Delete
        if (which === 1) {
            setItemRows((prevItemRows) => {
                const updatedItems = prevItemRows.filter((_, index) => index !== ItemId);

                // Update formData after itemRows is updated
                setFormData((prev) => ({
                    ...prev,
                    items: updatedItems,
                }));

                return updatedItems;
            });
        }
        // Additional Row Delete
        else {
            setAdditionalRow((prevAdditionalRows) => {
                const updatedAdditionalRows = prevAdditionalRows.filter((_, index) => index !== ItemId);

                // Update formData after additionalRows is updated
                setFormData((prev) => ({
                    ...prev,
                    additionalCharge: updatedAdditionalRows,
                }));

                return updatedAdditionalRows;
            });
        }
    };


    // ========================= [When change discount type `before` `after` `no`] ==========================;
    const changeDiscountType = (e, ItemRows, formData, setFormData, setDiscountToggler, toast) => {
        if (e.target.value !== "no") {
            if (e.target.value === "before") {
                if (ItemRows.some((field) => parseInt(field.discountPerAmount) > 0)) {
                    toast("To apply discount before tax, remove discount on item", 'warning')
                    return;
                }

            }


            setFormData({ ...formData, discountType: e.target.value });
            setDiscountToggler(false);
        } else {
            setFormData({ ...formData, discountType: e.target.value });
            setFormData((pv) => ({
                ...pv,
                discountAmount: (0).toFixed(2),
                discountPercentage: (0).toFixed(2)
            }))
            setDiscountToggler(true);
        }

    }


    //======================================= [Calculate Final Amount] ===================================='
    const calculateFinalAmount = (additionalRows, formData, subTotal, autoRoundOff = false, roundOffAmount = 0, roundOffType = '0') => {
        let totalParticular = 0;
        let total = 0;

        // Total additionla amount and store
        additionalRows.forEach((d, _) => {
            if (d.amount) {
                totalParticular = totalParticular + Number(d.amount);
            }
        })

        if (formData.discountType === "no" || formData.discountType === "" || formData.discountType === "before") {
            total = Number(subTotal()('amount'));
        }
        else if (formData.discountType === "after") {
            total = Number((subTotal()('amount') - formData.discountAmount).toFixed(2));
        }

        // return !isNaN(totalParticular) ? (totalParticular) + total).toFixed(2) : total;

        if (autoRoundOff) {
            return !isNaN(totalParticular) ? (totalParticular + total).toFixed(0) : total;
        } else {
            let final = !isNaN(totalParticular) ? Number(totalParticular + total) : total;
            if (roundOffAmount) {
                if (roundOffAmount === ".") return;

                final = roundOffType === "0" ?
                    Number(final) - Number(roundOffAmount) :
                    Number(final) + Number(roundOffAmount);

            }
            return final
        }

    }


    const onPerDiscountAmountChange = (val, index, ItemRows, setItemRows, formData) => {
        let item = [...ItemRows];
        let amount = parseFloat(item[index].price) * parseFloat(item[index].qun);
        let percentage = ((parseFloat(val) / amount) * 100).toFixed(2);

        if (item[index].perDiscountType !== "percentage" || formData.discountType === "before") {
            item[index].discountPerAmount = isNaN(val) || val === 0 ? (0).toFixed(2) : val;
            item[index].discountPerPercentage = isNaN(percentage) ? (0).toFixed(2) : percentage;
        }
        setItemRows(item);

    }


    const onPerDiscountPercentageChange = (val, index, ItemRows, setItemRows, formData) => {
        let item = [...ItemRows];
        let amount = parseFloat(item[index].price) * parseFloat(item[index].qun);
        // let percentage = (parseFloat(val) / amount) * 100;
        let dis_amount = amount / 100 * val

        if (item[index].perDiscountType !== "amount" || formData.discountType === "before") {
            item[index].discountPerPercentage = val;
            item[index].discountPerAmount = (dis_amount).toFixed(2);
        }
        setItemRows(item);

    }

    const calculatePerTaxAmount = (index, ItemRows) => {
        const tax = ItemRows[index].tax / 100;
        const qun = ItemRows[index].qun;
        const price = ItemRows[index].price;
        const disAmount = ItemRows[index].discountPerAmount;
        const amount = ((qun * price) - disAmount);
        const taxamount = (amount * tax).toFixed(2);

        return Number(taxamount);
    }


    const calculatePerAmount = (index, ItemRows) => {
        const qun = Number(ItemRows[index].qun);
        const price = Number(ItemRows[index].price);
        const disAmount = Number(ItemRows[index].discountPerAmount);
        const totalPerAmount = (qun * price) - disAmount + calculatePerTaxAmount(index, ItemRows);

        return Number((totalPerAmount).toFixed(2));
    }


    const onDiscountAmountChange = (e, discountToggler, formData, setFormData, subTotal) => {
        if (discountToggler !== null) {
            const value = e.target.value || (0).toFixed(2);
            let per = ((value / subTotal()('amount')) * 100).toFixed(2) //Get percentage
            setFormData({ ...formData, discountAmount: e.target.value, discountPercentage: per });
        }

    }



    return {
        onItemChange, addItem, deleteItem,
        changeDiscountType, calculateFinalAmount,
        onPerDiscountAmountChange, onPerDiscountPercentageChange,
        calculatePerTaxAmount, calculatePerAmount,
        onDiscountAmountChange
    }

}


export default useFormHandle;
