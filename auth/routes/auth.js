const router = require('express').Router();

router.post('/register', (req, res) => {
    res.send('Reg');
});

module.exports = router;