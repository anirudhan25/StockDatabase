const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Stock = require('../models/StockModel');

const getAllStock = async (req, res) => {
    try {
        const items = await Stock.find({});

        // sending back the found items as a response
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getStockBySupplier = async (req, res) => {
    try {
        // querying the database for items from specified Supplier
        const items = await Stock.find({ Supplier: req.params.supplier });

        // sending back the found items as a response
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getStockByName = async (req, res) => {
    try {
        const items = await Stock.find({ Product: req.params.item });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getStockByQuantity = async (req, res) => {
    try {
        // gets items of similar quantity (e.g. 30g, 10x30g, 30Gx5)
        const items = await Stock.find({ Quantity: { $regex: req.params.quantity, $options: 'i' } });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getSimilarStockByName = async (req, res) => {
    try {
        const items = await Stock.find({ Product: { $regex: req.params.item, $options: 'i' } });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getQuantity = async (req, res) => {
    try {
        const items = await Stock.find({ Product: req.params.item });
        quantities = items.map(item => item = item.Quantity);

        res.json(quantities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getSupplier = async (req, res) => {
    try {
        const items = await Stock.find({ Product: req.params.item });
        suppliers = items.map(item => item = item.Supplier);

        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const addItem = async (req, res) => {
    try {
        console.log("adding item");

        // destructure body
        const { Product, Quantity, Supplier } = req.body;

        // create a new instance of Stock model
        const item = new Stock({ Product, Quantity, Supplier });

        // save the new item to the database
        await item.save();

        // respond with the created item
        res.status(201).json({ item });
    } catch (err) {
        console.error("Error adding item:", err);
        res.status(500).json({ error: err.message });
    }
}

const updateDatabase = async (req, res) => {
    const uri = process.env.MONGODB_URI;
    console.log(`uri: ${uri}`);
    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000
    });

    const maxRetries = 3;
    let retries = 0;
    while (retries < maxRetries) {
        try {
            console.log('connecting to DB')
            await client.connect();
            const database = client.db('StockDB');
            const collection = database.collection('Stock');

            const { toAdd, toRemove, selectedChanges} = req.body;
            const itemsToAdd = toAdd.flat();
            const itemsToRemove = toRemove.flat();

            if (itemsToAdd.length > 0) {
                await collection.insertMany(itemsToAdd);
            }
    
            await collection.updateMany({}, { $set: { selected: false } });
            const result = await collection.updateMany(
                { Product: { $in: selectedChanges } },
                { $set: { selected: true } }
            );

            console.log(`separating object & string Ids`);
            const idsToRemove = itemsToRemove.map(item => item._id || item.id);
            const objectIds = idsToRemove.filter(id => mongoose.Types.ObjectId.isValid(id));
            const stringIds = idsToRemove.filter(id => !mongoose.Types.ObjectId.isValid(id));

            if (stringIds.length > 0) {
                await collection.deleteMany({ id: { $in: stringIds } });
            }

            if (objectIds.length > 0) {
                await collection.deleteMany({ _id: { $in: objectIds } });
            }

            res.status(201).json('Database updated.');
            return;
        } catch (err) {
            retries++;
            if (retries >= maxRetries) {
                console.error("Error updating database:", err);
                res.status(500).json({ error: err.message });
            } else {
                console.warn(`Retrying... (${retries}/${maxRetries})`);
            }
        } finally {
            await client.close();
        }
    }
};




const removeItem = async (req, res) => {
    try {
        const itemName = req.params.item;
        const item = await Stock.findOneAndDelete({ Product: itemName });

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        console.log("Deleted item:", item);
        res.json(item);
    } catch (err) {
        console.error("Error deleting item:", err);
        res.status(500).json({ error: err.message });
    }
};

const exportExcel = async (req, res) => {
    console.log('exporting to excel.');
    const uri = process.env.MONGODB_URI
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('database connected');
        const database = client.db('StockDB');
        const collection = database.collection('Stock');

        const data = await collection.find({}).toArray();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('output');

        // add columns and rows
        worksheet.columns = [
            { header: 'Product Name', key: 'Product', width: 40 },
            { header: 'Quantity', key: 'Quantity', width: 16 },
            { header: 'Supplier', key: 'Supplier', width: 16 },
            { header: 'Frozen', key: 'Frozen', width: 6 }
        ];

        data.sort((a, b) => {
            if (a.Product < b.Product) return -1;
            if (a.Product > b.Product) return 1;
            return 0;
        });

        data.forEach(item => {
            worksheet.addRow(item);
        });
        
        const buffer = await workbook.xlsx.writeBuffer();

        // set response headers to indicate a file attachment
        res.setHeader('Content-Disposition', 'attachment; filename="output.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        res.send(buffer);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        res.status(500).send('Failed to export data');
    }
}

const exportPDF = async (req, res) => {
    console.log('\nexporting to pdf');
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);

    try {
        console.log(`trying to connect...`);
        await client.connect();
        console.log(`database connected`);
        const database = client.db('StockDB');
        const collection = database.collection('Stock');
        let data;

        if (Object.keys(req.body).length > 0) {
            console.log(`exporting based on filter`);
            // field like { items: ["item1", "item2", "item3"] }
            const itemNames = req.body.items;
            console.log(`items: ${itemNames}`)
            
            // filter collection based on item names provided in the request body
            data = await collection.find({ Product: { $in: itemNames } }).toArray();
        } 
        else {
            console.log(`exporting all`)
            // if no filter is provided, retrieve all items
            data = await collection.find({}).toArray();
        }

        console.log(`sorting data`);
        data.sort((a, b) => {
            if (a.Product < b.Product) return -1;
            if (a.Product > b.Product) return 1;
            return 0;
        });

        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        console.log(`setting response headers`);
        res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
        res.setHeader('Content-Type', 'application/pdf');

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            res.send(pdfData);
        });

        doc.fontSize(20).text('Database Stock', { align: 'center' });
        doc.moveDown();

        const headers = ['Product Name,  ', 'Quantity,  ', 'Supplier'];
        const columnWidths = [400, 200, 250];

        // print headers
        headers.forEach((header, i) => {
            doc.fontSize(12).text(header, { width: columnWidths[i], continued: i < headers.length - 1 });
        });

        doc.moveDown();
        doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(250, doc.y).stroke();
        doc.moveDown();

        const middleX = doc.page.width / 2;
        let currentX = 50;
        let currentY = doc.y;
        let startY = doc.y;

        data.forEach((item, index) => {
            // Start a new page if we reach the bottom of the current page
            if (currentY + 20 > doc.page.height - doc.page.margins.bottom) {
                doc.addPage();
                currentX = 50;
                currentY = doc.y;
                startY = doc.y;

                headers.forEach((header, i) => {
                    doc.fontSize(12).text(header, { width: columnWidths[i], continued: i < headers.length - 1 });
                });
                doc.moveDown();
                doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(250, doc.y).stroke();
                doc.moveDown();

                currentY = doc.y;
            }

            doc.fontSize(12);

            // product name
            doc.font('Helvetica-Bold').text(item.Product, currentX, currentY, {
                width: columnWidths[0],
                continued: true
            });

            // quantity
            doc.font('Helvetica').text(' ' + item.Quantity, {
                width: columnWidths[1],
                continued: true
            });

            // supplier
            doc.text(' ' + item.Supplier, {
                width: columnWidths[2]
            });

            currentY += 20;
        });
        console.log(`rendered pdf`);

        doc.end();
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        res.status(500).send('Failed to export data');
    } finally {
        await client.close();
    }
};



// export functions within an object
module.exports = { getAllStock, getStockBySupplier, getStockByName, getStockByQuantity, getSimilarStockByName, getQuantity, getSupplier, addItem, updateDatabase, removeItem, exportExcel, exportPDF } 