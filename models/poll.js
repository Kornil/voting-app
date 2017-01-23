var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Poll = new Schema({
  title: String,
  options: Schema.Types.Mixed,
  user: String,
  hasVoted: []
});

module.exports = mongoose.model('Pool', Poll);