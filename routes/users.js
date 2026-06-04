const router = require('express').Router();
const {
  getUsers,
  createUser,
  updateOnlineStatus
} = require('../controllers/userController');

router.get('/',              getUsers);
router.post('/',             createUser);
router.patch('/:id/online',  updateOnlineStatus);

module.exports = router;
