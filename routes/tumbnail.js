const tumbnailContoller = require('../controllers/tumbnailController');
module.exports = async function (fastify, opts) {
  fastify.post('/tumbnails', {
    preHandler: fastify.multipart(),
    schema: {
      body: {
        type: 'object',
        properties: {
          file: { type: 'string', format: 'binary' },
          fieldname: { type: 'string' }
        },
        required: ['file']
      }
    }
  }, tumbnailContoller.getTumbnails);
}
exports.getTumbnails = async (request, reply) => {
  try {
    const parts = request.parts();
    let fields = {};
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
exports.updateTumbnail = async (request, reply) => {
  try {
    const { id } = request.params;
    const tumbnail = await Tumbnail.findById(id);
    if (!tumbnail) {
      return reply.status(404).send({ error: 'Tumbnail not found' });
    }
    const parts = request.parts();
    let fields = {};    
    let filename;
    for await (const part of parts) {
      if (part.file) {
        // Handle file upload
        filename = part.filename;
        const filePath = path.join(__dirname, '../uploads', filename);
        const writeStream = fs.createWriteStream(filePath);
        await pipelineasync(part.file, writeStream);
        
        // Update the file information in the database
        tumbnail.filename = filename;
        tumbnail.filepath = filePath;
      } else if (part.fieldname) {
        // Handle form fields
        fields[part.fieldname] = part.value;
      }
    }
    await tumbnail.save();
    reply.send({ message: 'Tumbnail updated successfully' });
  } catch (error) {
    console.error("Error updating tumbnail:", error);
    reply.status(500).send({ error: 'Internal Server Error' });
  }
}
exports.deleteTumbnail = async (request, reply) => {
  try {
    const { id } = request.params;
    const tumbnail = await Tumbnail.findById(id);
    if (!tumbnail) {
      return reply.status(404).send({ error: 'Tumbnail not found' });
    }   
    // Delete the file from the filesystem
   const filePath = path.join(__dirname, '../uploads', tumbnail.filename);
   fs.unlink(filePath, (err) => {
     if (err) {
       console.error("Error deleting file:", err);
       return reply.status(500).send({ error: 'Internal Server Error' });
     }
     reply.send({ message: 'Tumbnail deleted successfully' });
   });
  } catch (error) {
    console.error("Error deleting tumbnail:", error);
    reply.status(500).send({ error: 'Internal Server Error' });
  }

exports.DeleteAllTumbnails = async (request, reply) => {
    try {
        const tumbnails = await Tumbnail.find({user:request.user._id});
        if (tumbnails.length === 0) {
            return reply.status(404).send({ error: 'No tumbnails found' });
        }
    } catch (error) {
        console.error("Error deleting all tumbnails:", error);
        reply.status(500).send({ error: 'Internal Server Error' });
        
    }
}
}
module.exports = async function (fastify, opts) {   
    fastify.get('/tumbnails', tumbnailContoller.getTumbnails);
    fastify.put('/tumbnails/:id', {
        preHandler: fastify.multipart(),
        schema: {
        params: {
            type: 'object',
            properties: {
            id: { type: 'string' }
            },
            required: ['id']
        }
        }
    }, tumbnailContoller.updateTumbnail);
    fastify.delete('/tumbnails/:id', tumbnailContoller.deleteTumbnail);
    fastify.delete('/tumbnails', tumbnailContoller.DeleteAllTumbnails);
    }



























