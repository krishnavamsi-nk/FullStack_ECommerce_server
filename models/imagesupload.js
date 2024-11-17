const mongoose = require("mongoose");

const imagesuploadSchema =  mongoose.Schema({
    images: [
        {
          type: String,
          required: true,
        },
      ]
    
})

imagesuploadSchema.virtual('id').get(function(){
    return this._id.toHexString();
})

imagesuploadSchema.set("toJSON",{
    virtuals:true,
})


exports.imagesupload = mongoose.model("imagesupload", imagesuploadSchema);

// for schema
exports.imagesuploadSchema = imagesuploadSchema;
