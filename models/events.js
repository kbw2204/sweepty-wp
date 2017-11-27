var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;
// https://www.npmjs.com/package/mongoose-paginate
// bootstrap의 paginate와 비슷.
var schema = new Schema({
  //이벤트의 이름, 장소, 시작시간, 종료시간, 상세 설명, 등록 조직 이름, 등록 조직 설명
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  title: {type: String, trim: true, required: true},
  content: {type: String, trim: true, required: true},
  tags: [String],
  numLikes: {type: Number, default: 0},
  // photo: 
  // numAnswers: {type: Number, default: 0},
  // place: {type:String,trim: true, required: true},
  // starttime: {type: Date},
  // endtime: {type: Date},
  // stars : {type: Number, default: 0},
  
  cost: {type: Number},
  group_name : {type: String,trim: true, required: true},
  about_group : {type: String,trim: true, required: true},
  eventtype : {type: String,trim: true, required: true},
  eventtopic: {type: String,trim: true, required: true},
  numReads: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

schema.plugin(mongoosePaginate);//mongoosePaginate 함수를 추가해주는 기능.
var Event = mongoose.model('Event', schema); 

module.exports = Event;