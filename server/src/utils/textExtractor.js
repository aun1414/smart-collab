//Function to extract text from a txt file

import fs from "fs";


export const extractTxt = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            reject(err);
        } else {
            resolve(data);
        }
        });
    });
    }

