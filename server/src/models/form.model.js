const mongoose = require('mongoose');

const FormSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fields: {
    type: Array,
    default: [],
  },
  styles: {
    type: Object,
    default: {
      backgroundColor: '#111827', 
      textColor: '#FFFFFF',      
      buttonColor: '#0891B2',   
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Form', FormSchema);