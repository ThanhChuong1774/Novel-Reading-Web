import express from "express";
import homeController from "../controller/homeController";
import multer from "multer";
import path from "path";
var appRoot = require('app-root-path');

let router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, appRoot + "/src/public/image");
    },

    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const imageFilter = function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

let upload = multer({ storage: storage, fileFilter: imageFilter });
let uploadMultipleFiles = multer({ storage: storage, fileFilter: imageFilter }).array('multiple_images', 3);

const initWebRoute = (app) => {
    router.get('/', homeController.getHomePage);
    router.get('/user-management', homeController.getUserManagementPage);
    router.get('/book-management', homeController.getBookManagementPage);
    router.get('/detail/user/:userId', homeController.getDetailPage);
    router.get('/create-user', homeController.getCreatePage);
    router.get('/edit-user/:userId', homeController.getEditPage);
    router.get('/upload-file', homeController.getUploadFilePage);
    router.get('/add-chapter/:bookId', homeController.getAddChapterPage);
    router.get('/detail-book/:bookId', homeController.getDetailBookPage);
    router.get('/about', (req, res) => {
        res.send(`I'm TC`)
    })

    router.post('/create-new-user', homeController.createNewUser);
    router.post('/create-new-book', homeController.createNewBook);
    router.post('/create-new-chapter', homeController.createNewChapter);
    router.post('/delete-user', homeController.deleteUser);
    router.post('/delete-book', homeController.deleteBook);
    router.post('/update-user', homeController.postUpdateUser);
    router.post('/upload-profile-pic', upload.single('profile-pic'), homeController.handleUploadFile);
    router.post('/upload-multiple-images', (req, res, next) => {
        uploadMultipleFiles(req, res, (err) => {
            if (err instanceof multer.MulterError && err.code === "LIMIT_UNEXPECTED_FILE") {
                res.send('LIMIT_UNEXPECTED_FILE');
            } else if (err) {
                res.send(err);
            } else {
                next();
            }
        })
    }, homeController.handleUploadMultipleFiles);

    return app.use('/', router);
}

export default initWebRoute;