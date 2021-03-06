const express = require('express');
const mongoose = require('mongoose')
const router = express.Router();
const {ensureAuthenticated} = require('../helpers/auth')



//Load idea Model
require('../models/Idea');
const Idea = mongoose.model('ideas');


//Idea Index Page
router.get('/', ensureAuthenticated, function(req, res){
  //Bring in the data from mongodb
  //only see user ideas coming from id that logged in as with "user: req.user.id"
  Idea.find({user: req.user.id})
    .sort({date: 'desc'})
    .then(function(ideas){
      res.render('ideas/index', {
        ideas: ideas
      })
    })
});

//Add idea form
router.get('/add', ensureAuthenticated, function(req, res){
  res.render('ideas/add')
});

//Edit idea form
router.get('/edit/:id', ensureAuthenticated, function(req, res){
  Idea.findOne({
    // req.params.id returns only the id value. req.params will return key value pair i.e. "id: 123455..."
    _id: req.params.id
  })
    .then(function(idea){
      if(idea.user != req.user.id){
        req.flash('error_msg', 'Not Authorized');
        res.redirect('/ideas')
      } else{
        res.render('ideas/edit', {
          idea: idea
        })
      }
    })
});


//Process Form
router.post('/', ensureAuthenticated, function(req, res){
  //Server side validation
  let errors = [];
  if(!req.body.title){
    errors.push({text: "Please add a Title"})
  }
  if(!req.body.details){
    errors.push({text: "Please add some Details"})
  }
  if(errors.length > 0){
    res.render('ideas/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details,
      //For making users

    })
    //end of validation
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details,
      user: req.user.id
    };
    new Idea(newUser)
      .save()
      .then(function(idea) {
        req.flash('success_msg', 'idea has been added');

        res.redirect('/ideas');
      })
  }
  // console.log(req.body);
  // res.send('ok')
});

//Edit Form Process

router.put('/:id', ensureAuthenticated, function(req, res){
  Idea.findOne({
    _id: req.params.id
  })
    .then(function(idea){
      //new values
      idea.title = req.body.title;
      idea.details = req.body.details;
      idea.save()
        .then(function(idea){
          req.flash('success_msg', 'idea has been updated');
          res.redirect('/ideas')
        })
    })
});

//Delete Idea
router.delete('/:id', ensureAuthenticated, function(req, res){
  Idea.deleteOne({_id: req.params.id})
    .then(function(){
      req.flash('success_msg', 'idea has been removed');
      res.redirect('/ideas')
    });
});

module.exports = router;