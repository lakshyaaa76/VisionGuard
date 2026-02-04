const express = require('express');
const router = express.Router();
const { createExam, addQuestionToExam, publishExam, getPublishedExams, getAllExams, archiveExam, updateExam, getExamById, unarchiveExam } = require('../controllers/examController');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');
const { check } = require('express-validator');

// Admin routes
router.post('/admin/exams', [authenticateJWT, authorizeRoles('ADMIN'), [
    check('title', 'Title is required').not().isEmpty(),
]], createExam);

router.post('/admin/exams/:id/questions', [authenticateJWT, authorizeRoles('ADMIN'), [
    check('questionText', 'Question text is required').not().isEmpty(),
    check('questionType', 'Question type is required').isIn(['MCQ', 'CODING', 'SUBJECTIVE']),
]], addQuestionToExam);

router.post('/admin/exams/:id/publish', [authenticateJWT, authorizeRoles('ADMIN')], publishExam);

router.get('/admin/exams', [authenticateJWT, authorizeRoles('ADMIN')], getAllExams);

router.post('/admin/exams/:id/archive', [authenticateJWT, authorizeRoles('ADMIN')], archiveExam);

router.put('/admin/exams/:id', [authenticateJWT, authorizeRoles('ADMIN')], updateExam);

router.get('/admin/exams/:id', [authenticateJWT, authorizeRoles('ADMIN')], getExamById);

router.post('/admin/exams/:id/unarchive', [authenticateJWT, authorizeRoles('ADMIN')], unarchiveExam);

// Public routes
router.get('/exams', getPublishedExams);


module.exports = router;
