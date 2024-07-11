//require('dotenv').config({path: './.env'})
//import express from "express"
import dotenv from "dotenv"
//import cookieParser from "cookie-parser";
//import cors from "cors";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
    path:'./.env'
})


/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import express from "express";
const app=express()


;(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERRR:",error);
            throw error
            })

        app.listen(process.env.PORT,()=>{
            console.log(`app is listening on port ${process.env.PORT}`)
        })

    }catch(error){
        console.log("Error",error)
        throw error
    }
})()*/


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`Server is running at port : ${process.env.PORT}`);

    })
})
.catch((err) => {
    console.log("MONGO DB CONNECTION FAILED !!!", err)
})