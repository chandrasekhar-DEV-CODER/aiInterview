import multer from "multer";
import fs from "fs"; // ✅ Import the file system module

// ✅ Check if the uploads folder exists. If not, create it automatically!
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Use the variable we defined above
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + filename + '-' + file.originalname);
    }
});

export const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });