const express = require('express');
const Events = require('../models/events');
const User = require('../models/user'); 
// const Comment = require('../models/comment'); 
const catchErrors = require('../lib/async-error');
const router = express.Router();

// 동일한 코드가 users.js에도 있습니다. 이것은 나중에 수정합시다.
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

/* GET Events listing. */
router.get('/', catchErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1; // 아무것도 없으면 1부터
  const limit = parseInt(req.query.limit) || 10;

  var query = {};
  const term = req.query.term;
  if (term) {
    query = {$or: [
      {title: {'$regex': term, '$options': 'i'}},
      {content: {'$regex': term, '$options': 'i'}}
    ]};
  }
  const events = await Events.paginate(query, {
    sort: {createdAt: -1}, 
    populate: 'author', 
    page: page, limit: limit
  });
  res.render('Events/index', {events: events, term: term});
}));

router.get('/new', needAuth, (req, res, next) => {
  res.render('events/new', {event: {}});
});

router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const event = await Events.findById(req.params.id);
  res.render('events/edit', {event: event});
}));

router.get('/:id', catchErrors(async (req, res, next) => {
  const event = await Events.findById(req.params.id).populate('author');
  // const comments = await Comment.find({event: event.id}).populate('author');
  event.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???
  await event.save();
  // res.render('events/show', {event: event, comments: comments});
  res.render('events/show', {event: event});
}));

router.put('/:id', catchErrors(async (req, res, next) => {
  const event = await Events.findById(req.params.id);

  if (!event) {
    req.flash('danger', 'Not exist event');
    return res.redirect('back');
  }
  event.title = req.body.title;
  event.content = req.body.content;
  event.tags = req.body.tags.split(" ").map(e => e.trim());
  //
  // event.cost = req.body.cost,
  // event.group_name: req.body.group_name,
  // event.about_group : req.body.about_group,
  // event.eventtype : req.body.eventtype,
  // event.eventtopic: req.body.eventtopic;

  await event.save();
  req.flash('success', 'Successfully updated');
  res.redirect('/events');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  await Events.findOneAndRemove({_id: req.params.id});
  req.flash('success', 'Successfully deleted');
  res.redirect('/events');
}));

router.post('/', needAuth, catchErrors(async (req, res, next) => {
  const user = req.session.user; //du
  var event = new Events({
    title: req.body.title,
    author: user._id,
    content: req.body.content,
    tags: req.body.tags.split(" ").map(e => e.trim()),
    // cost: req.body.cost,
    // group_name: req.body.group_name,
    // about_group: req.body.about_group,
    // eventtype: req.body.eventtype,
    // eventtopic: req.body.eventtopic,
  });
  await event.save();
  req.flash('success', 'Successfully posted');
  res.redirect('/events');
}));
//needAuth는 미들웨어
// router.post('/:id/answers', needAuth, catchErrors(async (req, res, next) => {
//   const user = req.session.user;
//   const event = await Events.findById(req.params.id);

//   if (!event) {
//     req.flash('danger', 'Not exist events');
//     return res.redirect('back');
//   }

//   var comment = new Comment({
//     author: user._id,
//     event: event._id,
//     content: req.body.content
//   });
//   이 코드는 잠재적인 오류를 가지고 있다.
//   많은 사람이 들어왔을 때가 문제 들어왔을 땐 0이었는데 그 때 두사람이 들어온 경우.... 
//   근데 우리꺼에서는 신경쓰지 않겠다.
//   await comment.save();
//   event.numAnswers++;
//   await event.save();

//   req.flash('success', 'Successfully answered');
//   res.redirect(`/events/${req.params.id}`);
// }));



module.exports = router;
