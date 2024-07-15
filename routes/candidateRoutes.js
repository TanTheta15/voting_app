const express = require('express');
const router = express.Router();
const Candidate = require('./../Models/candidate');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');
const User = require('../Models/user');
const { JsonWebTokenError } = require('jsonwebtoken');
 

const checkAdminRole = async (userId) => {
    try{
        const user = await User.findById(userId);
        return user.role === 'admin';
    }
    catch(err){
        return false;
    }
}

//POST route to add a candidate 
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try{
        if(!await checkAdminRole(req.user.id)) {
            return res.status(403).json({message : "User does not have admin role"});
        }
        const data = req.body; // Assuming the request body contains the candidate data 
        const newCandidate = new Candidate(data);

        //Save the new user to the database
        const savedPerson = await newCandidate.save();
        console.log('Data saved');

        res.status(200).json({response : savedPerson});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error : 'Internal server error'});
    }
})

router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try{
        if(!await checkAdminRole(req.user.id)) {
            return res.status(403).json({message : "User does not have admin role"});
        }

        const candidateId = req.params.candidateID // Extract the id from the URL parameter
        const updatedCandidateData = req.body; //Update the data for the person 

        const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
            new : true,     //Return the updated document 
            runValidators : true,    //Run mongoose validation
        })
        if(!response){
            return res.status(404).json({error : 'Candidate not found'});
        }

        console.log('Candidate data updated');
        res.status(200).json(response);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error : 'Internal server error'});
    }
})

router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try{
        if(!await checkAdminRole(req.user.id)) {
            return res.status(403).json({message : "User does not have admin role"});
        }

        const candidateId = req.params.candidateID // Extract the id from the URL parameter
        const response = await Candidate.findByIdAndDelete(candidateId);

        if(!response){
            return res.status(404).json({error : 'Candidate not found'});
        }

        console.log('Candidate deleted');
        res.status(200).json(response);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error : 'Internal server error'});
    }
})

//Let's start voting 
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    //no admin can vote
    //user can only vote 
    const candidateID = req.params.candidateID;
    const userId = req.user.id;

    try{
        //Find the Candidate document with the specified candidateID
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({message : 'Candidate not found'});
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message : 'User not found'});
        }
        if(user.isVoted){
            res.status(400).json({message : "You have already voted"});
        }
        if(user.role == 'admin'){
            res.status(403).json({message : "admin is not allowed to vote"});
        }
        //Update the candidate document to record the vote
        candidate.votes.push({user : userId});
        candidate.voteCount++;
        await candidate.save();

        //update the user document
        user.isVoted = true;
        await user.save();

        res.status(200).json({message : "Vote recorded successfully"});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error : 'Internal server error'});
    }
})

//vote count
router.get('/vote/count', async (req, res) => {
    try{
        //Find all the candidates and sort them by voteCount in descending order
        const candidate = await Candidate.find().sort({voteCount : 'desc'});

        //Map the candidate to only return their name and voteCount
        const voteRecord = candidate.map((data) => {
            return {
                party : data.party,
                count : data.voteCount
            }
        });

        return res.status(200).json(voteRecord);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error : 'Internal server error'});
    }
})

//list of candidate
router.get('/candidateList', jwtAuthMiddleware, async (req, res) => {
    try{
        const candidate = await Candidate.find();
        const candidateList = candidate.map((data) => {
            return {
                name : data.name,
                party : data.party
            }
        });
        return res.status(200).json(candidateList);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error : 'Internal server error'});
    }
})

//Comment added for testing purpose
module.exports = router;