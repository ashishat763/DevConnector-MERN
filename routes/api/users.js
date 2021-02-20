const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator/check');
const User = require('./../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');


// @route POST api/users
// @desc Register Route
// @access Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please provide valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({min: 6})

], async (req, res) => 
    {
        const errors = validationResult(req);
        if(!errors.isEmpty())
        {
            return res.status(400).json({errors: errors.array()});
        }

        const {name, email, password} = req.body;
        try{
            let user = await User.findOne({email});

            //Check of User exists
            if(user)
            {
                return res.status(400).json({errors: [{msg: "User already exists"}]});
            }

            //Get Users Gravatar
            const avatar = gravatar.url(email, {
                s:'200',
                r:'pg',
                d:'mm'
            });

            user = new User({
                name, 
                email,
                avatar,
                password

            });

            //Encrypt password
            const salt = await bcrypt.genSalt(10);
        
            user.password = await bcrypt.hash(password, salt);

            //Save User
            //NOTE: Ideally, we should not save the user here. If the token generation fails,
            //the user record is already inserted in the DB. We can do it in the callback of
            //jwt token sign below.
            await user.save();

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