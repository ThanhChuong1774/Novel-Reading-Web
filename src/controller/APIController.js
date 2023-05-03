import { Router } from 'express';
import pool from '../config/connectDB';

let getAllUser = async (req, res) => {
    const [rows, fields] = await pool.execute('SELECT * FROM `users`');
    return res.status(200).json({
        message: 'ok',
        data: rows
    });
}

let createNewUser = async (req, res) => {
    let { firstName, lastName, email, address, role } = req.body;
    if (!firstName || !lastName || !email || !address || !role) {
        return res.status(200).json({
            message: 'missing require params'
        });
    }
    await pool.execute('insert into users(firstName,lastName,email,address,role) values (?, ? , ?, ?, ?) ',
        [firstName, lastName, email, address, role]);
    return res.status(200).json({
        message: 'ok'
    });
}

let updateUser = async (req, res) => {
    let { firstName, lastName, email, address, role, userId } = req.body;
    if (!firstName || !lastName || !email || !address || !role || !userId) {
        return res.status(200).json({
            message: 'missing require params'
        });
    }
    await pool.execute('update users set firstName = ?, lastName = ?, email = ?, address = ?, role = ? where userId = ?',
        [firstName, lastName, email, address, role, userId]);
    return res.status(200).json({
        message: 'ok'
    });
}

let deleteUser = async (req, res) => {
    let userId = req.params.userId;
    if (!userId) {
        return res.status(200).json({
            message: 'missing require params'
        });
    }
    await pool.execute('delete from users where userId = ?', [userId]);
    return res.status(200).json({
        message: 'ok'
    });
}

module.exports = {
    getAllUser, createNewUser, updateUser, deleteUser
}