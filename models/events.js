var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;
var schema = new Schema({
  //이벤트의 이름, 장소, 시작시간, 종료시간, 상세 설명, 등록 조직 이름, 등록 조직 설명
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  title: {type: String, trim: true, required: true},
  content: {type: String, trim: true, required: true},
  tags: [String],
  numLikes: {type: Number, default: 0},
  place: {type:String,trim: true, required: true},
  daterange: [{type: String,required: true}],
  stars : {type: Number, default: 0},
  stars_people: [{type: Schema.Types.ObjectId, ref: 'User'}],
  total_p_num: {type: Number,required:true},
  num_of_members: {type: Number},
  cost: {type: Number, default: 0},
  group_name : {type: String,trim: true, required: true},
  about_group : {type: String,trim: true, required: true},
  eventtype : {type: String,trim: true, required: true},
  eventtopic: {type: String,trim: true, required: true},
  company: [{type: String,trim: true}],
  reason: [{type: String,trim: true}],
  // members: [{type: Schema.Types.ObjectId, ref: 'User'}],
  m_name: [{type: String,trim: true}],
  m_email: [{type: String,trim: true}],
  numReads: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

schema.plugin(mongoosePaginate);//mongoosePaginate 함수를 추가해주는 기능.
var Event = mongoose.model('Event', schema); 

module.exports = Event;