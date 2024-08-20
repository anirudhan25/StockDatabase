const Stock = require('../models/ListModel');

const getListByName = async (req, res) => {
    try {
        const list = await List.find({ Name: req.params.name });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getListByID = async (req, res) => {
    try {
        const list = await List.findById(req.params._id);
        if (!list) {
            return res.status(404).json({ error: "List not found" });
        }
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


const addList = async (req, res) => {
    const { Name, Products } = req.body;
    const list = new List({ Name, Products });
    await list.save();

    res.json(list);
}

const removeListByName = async (req, res) => {
    const list = await Stock.findById(req.params.name);
    await List.deleteOne(list);

    res.json(list);
}

const removeListByID = async (req, res) => {
    const list = await Stock.findById(req.params._id);
    await List.deleteOne(list);

    res.json(list);
}


// export functions within an object
module.exports = { getListByName, getListByID, addList, removeListByName, removeListByID } 