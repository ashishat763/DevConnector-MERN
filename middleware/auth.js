const jwt = require('jsonwebtoken');
const config = require('config');


module.exports = function(req, res, next){

    //Get Token from Header
    const token = req.header('x-auth-token');

    //check if no token
    if(!token)
    {
        return res.status(401).json({errors: [{msg: "No token, Authorization Denied"}]});
    }

    //Verify Token
    try
    {
        const decoded = jwt.decode(token, config.get('jwtSecret'));

        //Basically id from the DB table. Set it to request
        req.user = decoded.user;

        next();
    }
    catch(err)
    {
        res.status(401).json({errors: [{msg: "Invalid Token"}]});
    }
}