/**
 * @file returnClaim.routes.js
 */

const express = require('express');
const router = express.Router();
const returnClaimController = require('../controllers/returnClaimController');
const { optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.post('/claims', optionalAuth, validate(schemas.createReturnClaim), returnClaimController.createClaim);

module.exports = router;
