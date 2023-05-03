import pool from "../config/connectDB";
import multer from 'multer';
const moment = require('moment');

let getHomePage = (req, res) => {

    return res.render('./user');
}

let getUserManagementPage = async (req, res) => {
    const [rows, fields] = await pool.execute('SELECT * FROM `users`');//Kết quả của await... gồm 2 phần tử nên dùng destructuring assignment [rows, field] được
    return res.render('./user-management', { dataUser: rows });
}

let getDetailPage = async (req, res) => {
    let id = req.params.userId;
    let [user] = await pool.execute(`select * from users where userId = ?`, [id]);

    console.log('check req param: ', user);
    return res.send(JSON.stringify(user));
}

let getCreatePage = (req, res) => {
    return res.render('./create-user');
}

let createNewUser = async (req, res) => {
    // console.log('check req: ', req.body);
    let { userName, email, address, role } = req.body;
    // let firstName = req.body.firstName;
    await pool.execute('insert into users(userName,email,address,role) values (? , ?, ?, ?) ',
        [userName, email, address, role]);
    return res.redirect('./user-management');
}

let deleteUser = async (req, res) => {
    let userId = req.body.userId;
    await pool.execute('delete from users where userId = ?', [userId]);
    return res.redirect('./user-management');
}

let getEditPage = async (req, res) => {
    let userId = req.params.userId;
    let [user] = await pool.execute('select * from users where userId = ?', [userId]);

    return res.render('./update-user', { dataUser: user[0] });
}

let postUpdateUser = async (req, res) => {
    let { userName, email, address, role, userId } = req.body;
    await pool.execute('update users set userName = ?, email = ?, address = ?, role = ? where userId = ?',
        [userName, email, address, role, userId]);
    return res.redirect('./user-management')
}

let getBookManagementPage = async (req, res) => {
    // const [rows, fields] = await pool.execute('SELECT books.bookId, books.bookName, books.imgLink, COUNT(chapters.chapterId) AS numChapters FROM books LEFT JOIN chapters ON books.bookId = chapters.bookId GROUP BY books.bookId');
    const [rows, fields] = await pool.execute('SELECT books.bookId, books.bookName, books.imgLink, COUNT(chapters.chapterId) AS numChapters FROM books LEFT JOIN chapters ON books.bookId = chapters.bookId WHERE books.status = "Enable" GROUP BY books.bookId');
    const [categoryRows, categoryFields] = await pool.execute('SELECT * FROM category')
    return res.render('./book-management', { dataBook: rows, dataCategory: categoryRows });
}

let createNewBook = async (req, res) => {
    // console.log('check req: ', req.body);
    let createdAt = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    let { bookName, authorName, description, categoryId, imgLink } = req.body;
    const [rows, fields] = await pool.execute('SELECT userId FROM `users` WHERE `userName` = ?', [authorName]);

    let authorId = rows[0].userId;

    await pool.execute('insert into books(bookName,authorId,description,imgLink,createdAt) values (?, ?, ? , ?, ?) ',
        [bookName, authorId, description, imgLink, createdAt]);
    const [bookRows, bookFields] = await pool.execute('SELECT bookId FROM `books` WHERE `bookName` = ? ', [bookName]);
    let bookId = bookRows[0].bookId;
    await pool.execute('insert into categories(categoryId,bookId) values (?, ?)', [categoryId, bookId]);
    return res.redirect('./book-management');
}

let deleteBook = async (req, res) => {
    let bookId = req.body.bookId;
    await pool.execute('update `books` set `status` = "Disable" where `bookId` = ?', [bookId]);
    return res.redirect('./book-management');
}

let getDetailBookPage = async (req, res) => {
    let bookId = req.params.bookId;
    console.log('>>> check req: ', bookId);
    return res.render('./book-detail-page', { bookId });
}

let getAddChapterPage = async (req, res) => {
    let bookId = req.params.bookId;
    //let [chapter] = await pool.execute('select * from users where userId = ?', [userId]);

    return res.render('./add-chapter-page', { bookId });
}

let createNewChapter = async (req, res) => {
    let createdAt = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    console.log('check req: ', req.body);
    let { title, content, bookId } = req.body;
    await pool.execute('insert into chapters(title,content,bookId,createdAt) values (?, ?, ?, ?)', [title, content, bookId, createdAt]);

    return res.redirect('./book-management');
}

let getUploadFilePage = async (req, res) => {

    return res.render('./upload-file');
}

const upload = multer().single('profile_pic');

let handleUploadFile = async (req, res) => {
    // 'profile_pic' is the name of our file input field in the HTML form
    //let upload = multer({ storage: storage, fileFilter: imageFilter }).single('profile_pic');
    console.log(req.file);

    upload(req, res, function (err) {
        // req.file contains information of uploaded file
        // req.body contains information of text fields, if there were any

        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }
        else if (!req.file) {
            return res.send('Please select an image to upload');
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        else if (err) {
            return res.send(err);
        }

        // Display uploaded image for user validation
        res.send(`You have uploaded this image: <hr/><img src="/image/${req.file.filename}" width="500"><hr /><a href="/upload-file">Upload another image</a>`);
    });
}

let handleUploadMultipleFiles = async (req, res) => {
    if (req.fileValidationError) {
        return res.send(req.fileValidationError);
    }
    else if (!req.files) {
        return res.send('Please select an image to upload');
    }

    let result = "You have uploaded these images: <hr />";
    const files = req.files;
    let index, len;

    // Loop through all the uploaded images and display them on frontend
    for (index = 0, len = files.length; index < len; ++index) {
        result += `<img src="/image/${files[index].filename}" width="300" style="margin-right: 20px;">`;
    }
    result += '<hr/><a href="/upload-file">Upload more images</a>';
    res.send(result);
}

module.exports = {
    getHomePage, getUserManagementPage, getBookManagementPage, getDetailPage, createNewUser, deleteUser, getEditPage,
    postUpdateUser, getCreatePage, getUploadFilePage, handleUploadFile, handleUploadMultipleFiles, createNewBook, deleteBook,
    getAddChapterPage, createNewChapter, getDetailBookPage
}