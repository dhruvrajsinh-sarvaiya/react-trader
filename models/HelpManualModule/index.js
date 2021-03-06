const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var Int32 = require('mongoose-int32');

// Create Schema
const HelpManualModuleSchema = new Schema({
    module_id: { type: Int32 },
    locale: {},
    sort_order: { type: String },
    status: { type: Int32, default: 1 },
    date_created: { type: Date, default: Date.now },
    date_modified: { type: Date, default: Date.now },
    created_by: { type: String },
    modified_by: { type: String }
});

module.exports = HelpManualModules = mongoose.model('helpmanualmodules', HelpManualModuleSchema);