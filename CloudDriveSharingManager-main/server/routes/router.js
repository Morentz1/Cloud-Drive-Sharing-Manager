const express = require('express');
const router = express.Router();

const SnapshotController = require('../controllers/snapshot-controller');
const UserController = require('../controllers/user-controller');

router.patch('/acrs/:index', UserController.deleteACR);
router.patch('/history', UserController.deleteHistory);
router.get('/snapshots/:id', SnapshotController.getSnapshot);
router.get('/users/:profile', UserController.getUser);
router.post('/acrs', UserController.addACR);
router.post('/groupsnapshots', UserController.addGroupSnapshot);
router.post('/history', UserController.addHistory);
router.post('/queries', UserController.addQuery);
router.post('/snapshots', SnapshotController.addSnapshot);

module.exports = router;
