
function checkNumber(n) {
    if (/^\d*\.?\d*$/.test(n)) {
        return n;
    }
    return "";
}


module.exports = {
    checkNumber
};