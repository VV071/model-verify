const admin = require('../config/firebaseAdmin');
const expressasyncHandler = require('express-async-handler');
const loadPalmModel = require("../model/palm_model");
const ort = require("onnxruntime-node"); 
const db = admin.firestore();

function cosineSimilarity(a, b) {
    const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dot / (magA * magB);
}

const register = expressasyncHandler(async (req, res) => {
    const {palmdata} = req.body;
    if(!palmdata){
        res.status(400);
        throw new Error("Palm data is required");
    }
    try {
        const uid = req.user.uid;
        console.log('Register request headers.authorization=', req.headers.authorization);
        console.log('Register: uid=', uid, 'palmdata type=', Array.isArray(palmdata) ? 'array' : typeof palmdata, 'length=', palmdata?.length);
        if (Array.isArray(palmdata) && palmdata.length === 0) {
            console.warn('Register: palmdata is empty array');
        }
        // Use set with merge to create or update the document (avoids failure when doc missing)
        await db.collection('users').doc(uid).set({
            palmdata: palmdata,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        // Read back the saved doc for verification
        const saved = await db.collection('users').doc(uid).get();
        const savedData = saved.exists ? saved.data() : null;
        console.log('Saved user doc exists=', !!savedData, 'savedPalmLength=', savedData?.palmdata?.length);
        res.status(200).json({message: "Palm data registered successfully", saved: !!savedData, savedPalmLength: savedData?.palmdata?.length || 0});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal Server Error"});
    }
});

const verify = expressasyncHandler(async (req, res) => {
    const {palmdata} = req.body;
    if(!palmdata){
        res.status(400);
        throw new Error("Palm data is required");
    }
    try {
        const uid = req.user.uid;
        const userDoc = await db.collection('users').doc(uid).get();
        if(!userDoc.exists){
            res.status(404);
            throw new Error("User not found");
        }
        const storedPalm = userDoc.data().palmdata;
        if (!storedPalm) {
            res.status(400);
            throw new Error("Palm data not registered");
        }
        const session = await loadPalmModel();
        const flattenPalm = (arr) => arr.flatMap(pt => [pt.x, pt.y, pt.z]);

        const liveFlat = Float32Array.from(flattenPalm(palmdata));
        const storedFlat = Float32Array.from(flattenPalm(storedPalm));
        const inputSize = liveFlat.length; 

        const liveTensor = new ort.Tensor("float32", liveFlat, [1, inputSize]);
        const storedTensor = new ort.Tensor("float32", storedFlat, [1, inputSize]);
        const liveOutput = await session.run({ input_rebuild: liveTensor });
        const storedOutput = await session.run({ input_rebuild: storedTensor });

        const liveEmb = liveOutput["dense"].data;
        const storedEmb = storedOutput["dense"].data;
        const similarity = cosineSimilarity(liveEmb, storedEmb);

        const threshold = 0.85;
        const verified = similarity >= threshold;

        return res.json({
            verified,
            similarity,
            threshold
        });

    } catch (error) {
        console.error("Palm verification error:", error);
        res.status(500).json({ error: "Server error during verification" });
    }
});

const deletePalm = expressasyncHandler(async (req, res) => {
    try {
        console.log('DeletePalm request headers.authorization=', req.headers.authorization);
        const uid = req.user.uid;
        // clear the palmdata field (set to null) so frontend sees no data
        await db.collection('users').doc(uid).set({
            palmdata: null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // read back to confirm
        const saved = await db.collection('users').doc(uid).get();
        const savedData = saved.exists ? saved.data() : null;
        console.log('DeletePalm: uid=', uid, 'savedPalmLength=', savedData?.palmdata?.length);

        res.status(200).json({ message: 'Palm data deleted', saved: !!savedData, savedPalmLength: savedData?.palmdata?.length || 0 });
    } catch (error) {
        console.error('Error deleting palm data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = { register, verify, deletePalm };