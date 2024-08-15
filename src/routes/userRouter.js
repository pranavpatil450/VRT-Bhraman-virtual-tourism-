const { Router } = require('express')
const { register,login,updateProfile } = require('../controller/user')
const{ auth } = require('../middleware/auth')
const express = require('express')

const userRouter = Router()
userRouter.post('/register' , register);
userRouter.post('/login', login);
userRouter.patch('/updateProfile', auth, updateProfile);

module.exports = userRouter