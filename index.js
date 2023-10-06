const express = require('express')
const app = express()
const User = require('./Models/users')
const bcrypt = require('bcrypt')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const isAuthenticated = require('./Models/auth')
const port = 8080
const mongoose = require('mongoose')
const { error } = require('console')
const connstring = 'mongodb+srv://amankwaajrcoudjoe:JxFvRz23Ju0uCT5b@cluster0.yzljveb.mongodb.net/'
mongoose.connect(connstring, {useNewUrlParser: true, useUnifiedTopology: true})
.then(client => {
    console.log('Connection established Successfully')
})
.catch(error => {
    console.error('Connection to Mongodb has failed', error)
})

app.use(express.json())

const Task = require('./Models/tasks')

app.post('/tasks',isAuthenticated, async (req, res) => {
    const newTask = req.body
    try{
        const newTaskData = await Task.create(newTask)
        res.status(201).json(newTaskData)
    }
    catch(error)
      {res.status(500).json({error: 'error occured'})}
    
})

//Create a secure account
const saltRound = 10
app.post('/register', (req, res) => {
    bcrypt.hash(req.body.password, saltRound)
    .then(hash => {
        const user = new User({
            username: req.body.username,
            password: hash
        })
        user.save()
        .then(result => {
           res.status(201).json({message: 'User saved successfuly'})
        })
        .catch(error => {
            res.status(500).json({error: 'Failed '})
        })
    })
    .catch(err => {
        res.status(500).json({error: 'Failed to hash'})
    })
})

//Bcrypt.compare
app.post('/login', (req, res) => {
    const { username, password } = req.body
    User.findOne({ username })
    .then(user =>{
        if(!user){
            return res.status(401).json({error: 'User does not exist'})
        }
        bcrypt.compare(password, user.password)
        .then(match => {
            if(match) {
                const token = jwt.sign({username: user.username, userid: user._id},
                    'MywebtokenStringToSecureMyToken', {expiresIn: '1h'})
                res.status(200).json({message: 'Welcome' + username, token: token})
            }else{
                res.status(401).json({error: 'Authentication failed'})
            }
            
        })
        .catch(err => {
            res.status(500).json({error: 'Please check password or username'})
        })
    })
    .catch(err => {
         res.status(500).json({error: 'User does not exist'})
    })
})

//Read from MongoDB
app.get('/tasks', isAuthenticated, (req, res)=>{
    Task.find()
    .then((newTask) => {
        res.json({
            message: "Tasks found",
            newTask: newTask
        })
    })
})




//Delete from MongoDB with ID
app.delete('./tasks/:id', isAuthenticated, (req, res) => {
    Task.deleteOne({ id: req.params.id})
    .then((result) => {
        res.status (200).json({message: 'Task removed successfully'})
    })
})





console.log("Helo World!!!")

module.exports = app