const Pilgrim = require('../model/Pilgrim')
const { tryCatch } = require('../../tryCatch')

const createPilgrim = tryCatch(async (req, res) => {
    const { id: uid, name: uName, photoURL: uPhoto } = req.user;
    const newPilgrim = new Pilgrim({ ...req.body, uid, uName, uPhoto });
    await newPilgrim.save();
    res.status(201).json({ success: true, result: newPilgrim });
  });

const getPilgrims = tryCatch(async (req, res) => {
    const pilgrims = await Pilgrim.find().sort({ _id: -1 });
    res.status(200).json({ success: true, result: pilgrims });
  });

module.exports = {
  createPilgrim,
  getPilgrims,
}