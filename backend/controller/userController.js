const expressasyncHandler = require('express-async-handler');
const admin = require('../config/firebaseAdmin');
const db = admin.firestore();
const axios = require('axios');
require('dotenv').config();

const sign_up = expressasyncHandler(async (req, res) => {
   const {name,email, password} = req.body;
   if(!name || !email || !password){
       res.status(400);
       throw new Error("Please fill all the fields");
   }
   try {
        const record = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: name
        });
        await db.collection('users').doc(record.uid).set({
            name: name,
            email: email,
            palmdata : null,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(201).json({message: "User registered successfully", uid: record.uid});
   }
    catch (error) { 
        console.log(error);
        if(error.code === 'auth/email-already-exists'){
            res.status(400);
            throw new Error("Email already in use");
        }
        res.status(500).json({message: "Internal Server Error"});
    }
});

const sign_in = expressasyncHandler(async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
        res.status(400);
        throw new Error("Please fill all the fields");
    }
    try {
          const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`;
          const firebaseResponse = await axios.post(url, {
                email: email,
                password: password,
                returnSecureToken: true
            });
            const {idToken, localId,refreshToken} = firebaseResponse.data;
                        // Ensure a user profile document exists in Firestore. If missing, create a basic profile.
                        try {
                            const userDocRef = db.collection('users').doc(localId);
                            const userSnap = await userDocRef.get();
                            if(!userSnap.exists) {
                                // fetch user record from Firebase Auth to get displayName/email
                                let displayName = ''
                                try{
                                    const authRecord = await admin.auth().getUser(localId)
                                    displayName = authRecord.displayName || ''
                                }catch(e){
                                    console.warn('Unable to fetch auth record for user', localId, e)
                                }
                                await userDocRef.set({
                                    name: displayName,
                                    email: email,
                                    palmdata: null,
                                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                                })
                                console.log('Created missing user profile for', localId)
                            }
                        } catch (e) {
                            console.error('Error ensuring user profile exists:', e)
                        }

                        res.status(200).json({message: "User signed in successfully", uid: localId, idToken, refreshToken});
    }
    catch (error) {
        console.log("Firebase login error:", error?.response?.data || error);
        const errorMessage = error?.response?.data?.error?.message;
        if(errorMessage === 'EMAIL_NOT_FOUND' || errorMessage === 'INVALID_PASSWORD'){
            res.status(400);
            throw new Error("Invalid email or password");
        }
        res.status(500).json({message: "Internal Server Error"});
    }
});

const profile = expressasyncHandler(async (req, res) => {
    const uid = req.user?.uid;
    if(!uid){
        res.status(401);
        throw new Error('Unauthorized');
    }
    try{
        const userDoc = await db.collection('users').doc(uid).get();
        if(!userDoc.exists){
            res.status(404);
            throw new Error('Profile not found');
        }
        const data = userDoc.data();
        res.status(200).json(data);
    }catch(err){
        console.error('Error fetching profile:', err);
        res.status(500).json({message: 'Internal Server Error'});
    }
});


module.exports = {sign_in, sign_up, profile};