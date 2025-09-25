const Form = require('../models/form.model');
const Submission = require('../models/submission.model');

exports.createForm = async (req, res) => {
  const newForm = new Form({
    title: req.body.title,
    fields: req.body.fields,
    createdBy: req.user.id,
  });
  try {
    const savedForm = await newForm.save();
    res.status(201).json(savedForm);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getUserForms = async (req, res) => {
  try {
    const forms = await Form.find({ createdBy: req.user.id });
    res.status(200).json(forms);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.deleteForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (form.createdBy.toString() !== req.user.id) {
      return res.status(403).json("You can only delete your own forms!");
    }
    await form.deleteOne();
    res.status(200).json("The form has been deleted.");
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getPublicForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json("Form not found!");
    res.status(200).json(form);
  } catch (err) {
    res.status(500).json(err);
  }
};


exports.createSubmission = async (req, res) => {
  try {
    const newSubmission = new Submission({
      formId: req.params.formId,
      responses: req.body.responses,
    });
    const savedSubmission = await newSubmission.save();
    res.status(201).json(savedSubmission);
  } catch (err) {
    res.status(500).json(err);
  }
};


exports.getFormSubmissions = async (req, res) => {
  try {
    // First, check if the user owns the form
    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json("Form not found");
    if (form.createdBy.toString() !== req.user.id) {
      return res.status(403).json("You are not authorized to view these submissions!");
    }

    const submissions = await Submission.find({ formId: req.params.formId }); 
    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).json(err);
  }
};



exports.updateForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (form.createdBy.toString() !== req.user.id) {
      return res.status(403).json("You can only update your own forms!");
    }

    const updatedForm = await Form.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, 
      { new: true }
    );
    res.status(200).json(updatedForm);
  } catch (err) {
    res.status(500).json(err);
  }
};