var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var schema_comment = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  event : { type: Schema.Types.ObjectId, ref: 'Event' },
  content: {type: String, trim: true, required: true},
  numLikes: {type: Number, default: 0},
  numAnswers: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
var schema_answer = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
  content: {type: String, trim: true, required: true},
  numLikes: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema_comment.plugin(mongoosePaginate);
var Comment = mongoose.model('Comment', schema_comment);
var Answer = mongoose.model('Answer', schema_answer);
module.exports = Comment;