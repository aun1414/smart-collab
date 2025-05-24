import multer from "multer";
import path from "path";
import fs from "fs";

// Store uploads in temp directory
const storage = multer.diskStorage({
  destination: function (_, __, cb) {
    const dir = "uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (_, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage });
