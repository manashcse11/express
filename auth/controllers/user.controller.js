const User = require("../models/user.model.js");
const config = require("../config/config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
        console.log(user);
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
    // Validate request
    const {error} = loginValidation(req.body);        
    if (error) return res.status(400).send(ResponseFormatter.validationResponse(error.details));
    
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
            res.status(ResponseFormatter.HTTP_NOT_FOUND).send(ResponseFormatter.errorResponse(err.message, `Mobile/Email or Password is wrong`));
        }
        else {
            let error_data = {
                entity: 'User',
                model_obj: {param: req.params, body: req.body},
                error_obj: err,
                error_msg: err.message
            };
            res.status(ResponseFormatter.HTTP_SERVER_ERROR).send(ResponseFormatter.errorResponse(err.message, "Error retrieving User", error_data));
        }
        return;
    }
    
    
};

// Retrieve all users from the database with pagination.
exports.findAll = async (req, res) => {
    let start = req.query.start || 0;
    let limit = req.query.per_page || 100;
    let return_total = true;
    let sort_data = {sort_by: 'id', sort_dir: 'ASC'};
    let users = [];

    let query_params = Object.keys(req.query);

    let sort_by_allowed_values = ['id', 'email'];

    if( query_params.includes('sort_by') && sort_by_allowed_values.includes(req.query.sort_by) ) {
        sort_data.sort_by = req.query.sort_by;
    }
    else {
        sort_data.sort_by = 'id';
    }

    sort_data.sort_dir = ((typeof req.query.sort_dir != 'undefined') && (req.query.sort_dir.toUpperCase() == 'DESC')) ? 'DESC' : 'ASC';

    try {
        users = await User.getAll(start, limit, return_total, sort_data);
    }
    catch(err) {
        let error_data = {
            entity: 'User',
            model_obj: req.query,
            error_obj: err,
            error_msg: err.message
        };
        res.status(ResponseFormatter.HTTP_SERVER_ERROR).send(ResponseFormatter.errorResponse(err.message, "Some error occurred while retrieving users.", error_data));
        return;
    }

    let results = users.rows;
    res.status(ResponseFormatter.HTTP_SUCCESS).send(ResponseFormatter.findAllResponse(results, limit, start, users.total_rows));
};

// Find a single User with an id
exports.findOne = async (req, res) => {
    let data = {};

    try {
        data = await User.findBy({id: req.params.id}, 'id', true);
    }
    catch(err) {
        if( err instanceof NotFoundError ) {
            res.status(ResponseFormatter.HTTP_NOT_FOUND).send(ResponseFormatter.errorResponse(err.message, `Could not find User with id ${req.params.id}.`));
        }
        else {
            let error_data = {
                entity: 'User',
                model_obj: {param: req.params, body: req.body},
                error_obj: err,
                error_msg: err.message
            };
            res.status(ResponseFormatter.HTTP_SERVER_ERROR).send(ResponseFormatter.errorResponse(err.message, "Error retrieving User with id " + req.params.id, error_data));
        }
        return;
    }

    //data.product_images = data.product_images.map(item => fixImagePublicUrl(req, item));
    res.status(ResponseFormatter.HTTP_SUCCESS).send(ResponseFormatter.oneResponse(data));
};

// Get single user's address
exports.getAddress = async (req, res) => {
    let data = await User.getAddress(req.params.id).catch(error => {
        let error_data = {
            entity: 'UserAddress',
            model_obj: {param: req.params, body: req.body},
            error_obj: error,
            error_msg: error.message
        };
        res.status(ResponseFormatter.HTTP_SERVER_ERROR).send(ResponseFormatter.errorResponse(err.message, "Error retrieving user address with user ID " + req.params.id, error_data));
        return;
    });

    res.status(ResponseFormatter.HTTP_SUCCESS).send(ResponseFormatter.oneResponse(data));
};