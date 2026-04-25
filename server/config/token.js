import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


const genToken=async (userId)=>{
    
    try {
    
    const jwt=require('jsonwebtoken');
    const token=jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:'7d'});
    return token;   
}
catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Token generation failed');
}
}

export default genToken;