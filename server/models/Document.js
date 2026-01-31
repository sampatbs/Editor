const mongoose = require("mongoose");


const DocumentSchema = new mongoose.Schema({
_id: String,
content: {
type: String,
default: ""
}
});


module.exports = mongoose.model("Document", DocumentSchema);