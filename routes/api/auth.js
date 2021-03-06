const express = require('express');
const User = require('./../../models/User');
const auth = require('./../../middleware/auth');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator/check');
const bcrypt = require('bcryptjs');
// @route GET api/auth
// @desc Test Route
// @access Public
router.get('/', auth, async (req, res) => 
    {
        try
        {
            const user = await User.findById(req.user.id).select('-password');
            res.json(user);
        }
        catch(err)
        {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    }
)

// @route POST api/auth
// @desc Authenticate User & get Token
// @access Public
router.post('/', [
    check('email', 'Please provide valid email').isEmail(),
    check('password', 'Password is required').exists()

], async (req, res) => 
    {
        const errors = validationResult(req);
        if(!errors.isEmpty())
        {
            return res.status(400).json({errors: errors.array()});
        }

        const {email, password} = req.body;
        try{
            let user = await User.findOne({email});

            //Check of User exists
            if(!user)
            {
                return res.status(400).json({errors: [{msg: "Invalid credentials"}]});
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if(!isMatch)
            {
                return res.status(400).json({errors: [{msg: "Invalid credentials"}]});
            }
            //Return json webtoken
            const payload = {
                user:{
                    id: user.id
                }
            }
            //Should change expiresIn to 3600 for production
            jwt.sign(payload, config.get('jwtSecret'), {expiresIn: 36000}, (err, token)=>{
                if(err) throw err;
                
                res.json({token});
            })
        }
        catch(err)
        {
            console.error(err.message);
            return res.status(500).send("Server Error");
        }

        
    }
)


module.exports = router;