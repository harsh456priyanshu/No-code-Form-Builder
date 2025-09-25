const router = require('express').Router();
const formController = require('../controllers/form.controller');
const verifyToken = require('../middlewares/auth.middleware');

router.get('/public/:id', formController.getPublicForm);
router.post('/public/:formId/submit', formController.createSubmission);


router.use(verifyToken);

router.post('/', formController.createForm);
router.get('/', formController.getUserForms);
router.delete('/:id', formController.deleteForm);
router.get('/:formId/submissions', formController.getFormSubmissions);
router.put('/:id', formController.updateForm);

module.exports = router;