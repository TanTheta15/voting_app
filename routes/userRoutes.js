const express = require('express');
const router = express.Router();
const User = require('./../Models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');
 
//POST route to add a person 
router.post('/signup', async (req, res) => {
    try{
        const data = req.body; // Assuming the request body contains the person data 
        const newUser = new User(data);

        //Save the new user to the database
        const savedPerson = await newUser.save();
        console.log('Data saved');

        const payload = {
            id : savedPerson.id,
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log('Token is : ', token);

        res.status(200).json({response : savedPerson, token : token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error : 'Internal server error'});
    }
})

//Login Routes 
router.post('/login', async (req, res) => {
    try{
        //Extract aadharCardNumber  and password from request body
        const {aadharCardNumber, password} = req.body;

        //Find the user by username
        const user = await User.findOne({aadharCardNumber : aadharCardNumber});

        //If user doesn't exist or password doesn't match, return error
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error : 'Invalid username or password'});
        }

        //Generate token
        const payload = {
            id : user.id,
        }
        const token = generateToken(payload);

        //Return token as response 
        res.json({token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error : 'Internal server error'});
    }
})

//Profile route 
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try{
        const userData = req.user;
        const userId = userData.id;
        const user = await Person.findById(userId);
        res.status(200).json({user});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error : 'Internal server error'});
    }
})

router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try{
        const userId = req.user.id;     //Extract the id from the token
        const {currentPassword, newPassword} = req.body;//Extract the current and new password from the request body
        //Find the user by userId 
        const user = await User.findById(userId);

        //If password doesn't match, return error
        if(!(await user.comparePassword(password))){
            return res.status(401).json({error : 'Invalid username or password'});
        }

        //Update the user's password
        user.password = newPassword;
        await user.save();

        console.log('password updated');
        res.status(200).json({message : "Password updated"});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error : 'Internal server error'});
    }
})

//Comment added for testing purpose
module.exports = router;