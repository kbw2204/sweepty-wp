const express = require('express');
const Events = require('../models/events');
const User = require('../models/user'); 
const Comment = require('../models/comments'); 
const catchErrors = require('../lib/async-error');
const router = express.Router();


// 동일한 코드가 users.js에도 있습니다. 이것은 나중에 수정합시다.
function needAuth(req, res, next) {
    if (req.isAuthenticated()){
      next();
    } else if (req.session.user) {
      next();
    } else {
      req.flash('danger', '로그인이 필요합니다.');
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

// 내가 만든 이벤트 참가리스트 확인
router.get('/:id/memberlist', needAuth, catchErrors(async (req, res, next) => {
  const event = await Events.findById(req.params.id);
  const user = req.session.user;
  if (event.author == user._id) {
    res.render('events/memberlist', {event: event});
  }
  else{
    req.flash('danger','신청자를 열람할 권한이 없습니다! 관리자만 가능합니다.');
    res.redirect('back');
  }
}));

router.get('/new', needAuth, (req, res, next) => {
  res.render('events/new', {event: {}});
});

//수정클릭 시 get
router.get('/:id/edit', needAuth, catchErrors(async (req, res, next) => {
  const event = await Events.findById(req.params.id);
  const user = req.session.user;

  if (event.author == user._id) {
    res.render('events/edit', {event: event});
  }
  else{
    req.flash('danger','수정할 권한이 없습니다! 관리자만 가능합니다.');
    res.redirect('back');
  }

}));

//참가 신청 get
router.get('/:id/participate', needAuth, catchErrors(async (req, res, next) => {
  const event = await Events.findById(req.params.id);
  if (event.total_p_num == 0) {
    req.flash('danger','참가신청이 마감되었습니다!');
    res.redirect('back');
  }
  res.render('events/participate', {event: event});
}));

//참가신청
router.post('/:id/participate', needAuth, catchErrors(async (req, res, next) => {
  const user = req.session.user;
  const event = await Events.findById(req.params.id);
  event.total_p_num--;
  event.members.push(user._id);
  event.company.push(req.body.company);
  event.reason.push(req.body.reason);
  await event.save();
  req.flash('success', '성공적으로 참가신청을 완료했습니다.');
  res.redirect('/events');
}));


router.get('/:id', catchErrors(async (req, res, next) => {
  const event = await Events.findById(req.params.id).populate('author');
  const comments = await Comment.find({event: event.id}).populate('author');
  event.numReads++;    // TODO: 동일한 사람이 본 경우에 Read가 증가하지 않도록???
  await event.save();
  res.render('events/show', {event: event, comments: comments});
}));

router.post('/:id', catchErrors(async (req, res, next) => {
  const event = await Events.findById(req.params.id);

  if (!event) {
    req.flash('danger', '이벤트가 존재하지 않습니다.');
    return res.redirect('back');
  }
  event.title = req.body.title;
  event.content = req.body.content;
  event.tags = req.body.tags.split(" ").map(e => e.trim());
  event.cost = req.body.cost,
  event.group_name = req.body.group_name,
  event.about_group = req.body.about_group,
  event.place = req.body.place,
  event.daterange = req.body.daterange,
  event.total_p_num = req.body.total_p_num,
  // event. = req.body,
  event.eventtype = req.body.eventtype,
  event.eventtopic = req.body.eventtopic;

  await event.save();
  req.flash('success', '성공적으로 수정했습니다.');
  res.redirect('/events');
}));

router.delete('/:id', needAuth, catchErrors(async (req, res, next) => {
  // await Events.findOneAndRemove({_id: req.params.id});
  const event = await Events.findById(req.params.id);
  const user = req.session.user;
  if (event.author == user._id) {
    await Events.findOneAndRemove({_id: req.params.id});
    req.flash('success', 'Successfully deleted');
    res.redirect('/events');
  }
  else{
    req.flash('danger','삭제할 권한이 없습니다! 관리자만 가능합니다.');
    res.redirect('back');
  }

}));

router.post('/', needAuth, catchErrors(async (req, res, next) => {
  const user = req.session.user;
  var event = new Events({
    title: req.body.title,
    author: user._id,
    content: req.body.content,
    tags: req.body.tags.split(" ").map(e => e.trim()),
    cost: req.body.cost,
    total_p_num: req.body.total_p_num,
    num_of_members: req.body.total_p_num,
    daterange: req.body.daterange,
    place: req.body.place,
    group_name: req.body.group_name,
    about_group: req.body.about_group,
    eventtype: req.body.eventtype,
    eventtopic: req.body.eventtopic,
  });
  await event.save();

  req.flash('success', '이벤트를 성공적으로 등록했습니다!');
  res.redirect('/events');
}));

// needAuth는 미들웨어
router.post('/:id/comments', needAuth, catchErrors(async (req, res, next) => {
  const user = req.session.user;
  const event = await Events.findById(req.params.id);

  if (!event) {
    req.flash('danger', '이벤트가 존재하지 않습니다.');
    return res.redirect('back');
  }

  var comment = new Comment({
    author: user._id,
    event: event._id,
    content: req.body.content
  });
  // 이 코드는 잠재적인 오류를 가지고 있다.
  // 많은 사람이 들어왔을 때가 문제 들어왔을 땐 0이었는데 그 때 두사람이 들어온 경우.... 
  // 근데 우리꺼에서는 신경쓰지 않겠다.
  await comment.save();
  event.numComments++;
  await event.save();

  req.flash('success', 'Successfully commented');
  res.redirect(`/events/${req.params.id}`);
}));

module.exports = router;
