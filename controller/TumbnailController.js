const Tumbnail = require('../models/Tumbnail');
const path = require('path');
const fs = require('fs');
const{pipeline} = require("stream");
const util = require("util");
const pipelineasync =util.promisify(pipeline);


ezports.getTumbnails = async (request,reply)=>{
    try {
        const parts =request.part();
        let fields={};
        let filename;
        for await (const part of parts) {
            if (part.file) {
                // Handle file upload
                filename = part.filename;
                const filePath = path.join(__dirname, '../uploads', filename);
                const writeStream = fs.createWriteStream(filePath);
                await pipelineasync(part.file, writeStream);
                
                // Save the file information to the database
                const tumbnail = new Tumbnail({
                    filename: filename,
                    filepath: filePath
                });
                await tumbnail.save();
            } else if (part.fieldname) {
                // Handle form fields
                fields[part.fieldname] = part.value;
            }
        }
    } catch (error) {
        console.error("Error fetching tumbnails:", error);
        reply.status(500).send({ error: 'Internal Server Error' });
        
    }
}












