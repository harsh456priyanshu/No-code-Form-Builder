const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true,
  },
  responses: {
    type: Array,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Submission', SubmissionSchema);