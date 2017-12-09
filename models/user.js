var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

var schema = new Schema({
  name: {type: String, required: true, trim: true},
  email: {type: String, required: true, index: true, unique: true, trim: true},
  password: {type: String},
  facebook: {id:String,token:String,photo:String},
  createdAt: {type: Date, default: Date.now},
  stars : [{type: Schema.Types.ObjectId, ref: 'Event'}],
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.methods.generateHash = function(password) {
  return bcrypt.hash(password, 10); 
  // return Promise 뒤에 salt를 10글자를 붙여준다. asyc하게 도니까 awit를 써주면 된다.
};

schema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password); // return Promise
};
var User = mongoose.model('User', schema);

module.exports = User;
