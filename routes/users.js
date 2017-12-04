var express = require('express'),
    User = require('../models/user');
var router = express.Router();

function needAuth(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else if (req.session.user) {
      next();
    } else {
      req.flash('danger', '로그인이 필요합니다.');
      res.redirect('/signin');
    }
}

function validateForm(form, options) {
  var name = form.name || "";
  var email = form.email || "";
  name = name.trim();
  email = email.trim();

  if (!name) {
    return '이름을 입력해주세요.';
  }

  if (!email) {
    return '이메일을 입력해주세요.';
  }

  if (!form.password && options.needPassword) {
    return '비밀번호를 입력해주세요.';
  }

  if (form.password !== form.password_confirmation) {
    return '비밀번호가 일치하지 않습니다.';
  }

  if (form.password.length < 6) {
    return '비밀번호는 6자 이상이어야 합니다.';
  }

  return null;
}
/* GET users listing. */
router.get('/', needAuth, (req, res, next) => {
  const user = req.session.user;
  User.find({}, function(err, users) {

    if (err) {
      return next(err);
    }
    if (user._id == '5a2199ca3a84f50d51bf3c68') { //관리자만 가능하도록
      res.render('users/index', {users: users});
    }
    else{
      req.flash('danger','유저리스트를 열람할 권한이 없습니다! 관리자만 가능합니다.');
      res.redirect('back');
      
    }
  }); // TODO: pagination?
});

router.get('/new', (req, res, next) => {
  res.render('users/new', {messages: req.flash()});
});

router.get('/:id/edit', needAuth, (req, res, next) => {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    res.render('users/edit', {user: user});
  });
});

router.put('/:id', needAuth, (req, res, next) => {
  var err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }

  User.findById({_id: req.params.id}, function(err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('danger', '존재하지 않는 아아디입니다.');
      return res.redirect('back');
    }

    if (user.password !== req.body.current_password) {
      req.flash('danger', '비밀번호가 일치하지 않습니다.');
      return res.redirect('back');
    }

    user.name = req.body.name;
    user.email = req.body.email;
    if (req.body.password) {
      user.password = req.body.password;
    }

    user.save(function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', '성공적으로 수정했습니다.');
      res.redirect('/users');
    });
  });
});

router.delete('/:id', needAuth, (req, res, next) => {
  User.findOneAndRemove({_id: req.params.id}, function(err) {
    if (err) {
      return next(err);
    }
    req.flash('success', '성공적으로 삭제했습니다!');
    res.redirect('/users');
  });
});

router.get('/:id', (req, res, next) => {
  User.findById(req.params.id, function(err, user) {
    if (err) { ///:id에 들어간 부분은 params.id에 들어간다!
      return next(err);
    }
    res.render('users/show', {user: user});
  });
});

router.post('/', (req, res, next) => {
  var err = validateForm(req.body, {needPassword: true});
  if (err) {
    req.flash('danger', err);
    return res.redirect('/');
  }
  User.findOne({email: req.body.email}, function(err, user) {
    if (err) {
      return next(err);
    }
    if (user) {
      req.flash('danger', '이메일이 이미 존재합니다. 다른 이메일로 시도하세요.');
      res.redirect('back');
    }
    var newUser = new User({
      name: req.body.name,
      email: req.body.email,
    });
    newUser.password = req.body.password;

    newUser.save(function(err) {
      if (err) {
        return next(err);
      } else {
        req.flash('success', '성공적으로 등록했습니다! 다시 로그인해주세요 :)');
        res.redirect('/');
      }
    });
  });
});

module.exports = router;
