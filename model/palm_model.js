const ort = require("onnxruntime-node");

let session = null;

async function loadPalmModel() {
    if (!session) {
        session = await ort.InferenceSession.create("./model/palm_model.onnx");
        console.log("Palm Model Loaded (ONNX)");
    }
    return session;
}

module.exports = loadPalmModel;