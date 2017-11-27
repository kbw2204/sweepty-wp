const express = require('express');
const Participation = require('../models/participation');
const router = express.Router();

function needAuth(req, res, next) {
    if (req.isAuthenticated()){
      next();
    } else if (req.session.user) {
      next();
    } else {
      req.flash('danger', 'Please signin first.');
      res.redirect('/signin');
    }
}