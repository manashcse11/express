const User = require("../models/user.model.js");
const config = require("../config/config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {NotFoundError} = require("../helpers/utility");

// Register a new User
exports.register = async (req, res) => {
    
    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hasPassword = await bcrypt.hash(req.body.password, salt);

    // Create an user object
    const user = new User({
        mobile: req.body.mobile,
        email: req.body.email,
        name: req.body.name,
        password: hasPassword,
        status: req.body.status || 1
    });
    // Save User in the database
    try {
        const id = await User.create(user);
        user.id = id;
        delete user.password;
        res.send(user);
    }
    catch (err){
        res.status(500).send(err);
    }    
};

// Login
exports.login = async (req, res) => {
    try {
        // Check user exist
        const user = await User.login(req.body.mobile_or_email);
        if (user) {
            const validPass = await bcrypt.compare(req.body.password, user.password);
            if (!validPass) return res.status(400).send("Mobile/Email or Password is wrong");

            // Create and assign token
            const token = jwt.sign({id: user.id, user_type_id: user.user_type_id}, config.TOKEN_SECRET);
            res.header("auth-token", token).send({"token": token});
            // res.send("Logged IN");
        }
    }
    catch (err) {
        if( err instanceof NotFoundError ) {
            res.status(401).send(`Mobile/Email or Password is wrong`);
        }
        else {
            let error_data = {
                entity: 'User',
                model_obj: {param: req.params, body: req.body},
                error_obj: err,
                error_msg: err.message
            };
            res.status(500).send("Error retrieving User");
        }
    }   
    
};