const express = require('express');
const mongoose = require('mongoose');
const jwtManager = require('../../manager/jwt');
const bcrypt = require('bcrypt');
const sendMail = require('../../manager/email');

const userRegister = async (req, res) => {
  console.log(req.body);
  const { name, email, password } = req.body;
  const userModel = mongoose.model('user');

  if (!name || !email || !password) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please enter all fields',
    });
  }

  try {
    const user = await userModel.findOne({ email: email });
    if (user) {
      return res.status(400).json({
        status: 'fail',
        message: 'User already exists',
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const newData = await userModel.create({
      name: name,
      email: email,
      password: hash
    });

    console.log(newData);

    const accessToken = jwtManager(newData);

    await sendMail(email, 'Your Registration successfully', 'Thank you for registering with us');
  
    res.status(200).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: newData,
        accessToken: accessToken,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'fail',
      message: 'Internal Server Error',
    });
  }
};

module.exports = userRegister;
