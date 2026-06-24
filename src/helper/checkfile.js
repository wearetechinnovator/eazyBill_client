// Check file before upload
/**
 * @params file: fileObject
 * @params type: file type in array
 * @params size: file size in mb
 */

const checkfile = (file, type = ["jpg", "png", 'jpeg'], size = 3) => {
    const INIT_SIZE = 1048576; //1MB in bytes;
    const FILE = file;


    return new Promise((resolve, reject) => {
        if (file === "" || file === undefined || file === null) {
            resolve("Select your file");
        }

        const filename = FILE.name;
        if (type.some((value) => filename.endsWith(value))) {
            if (FILE.size <= (INIT_SIZE * size)) {
                resolve(true);
            } else {
                resolve("Invalid filesize");
            }

        } else {
            resolve("Invaid filetype");
        }

    })

}

export default checkfile;

