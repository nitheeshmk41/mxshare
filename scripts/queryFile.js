// Simple script to query the Files collection by id or title
// Usage: node scripts/queryFile.js <id-or-title>

require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not found in .env');
  process.exit(1);
}

const FileSchema = new mongoose.Schema({}, { strict: false, collection: 'files' });
const File = mongoose.model('File', FileSchema);

async function run() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Provide an id or title to search');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { dbName: 'mxshare' });
    console.log('Connected to MongoDB');

    // if arg looks like ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(arg);
    let doc = null;
    if (isObjectId) {
      doc = await File.findById(arg).lean();
      if (doc) {
        console.log('Found by _id:');
        console.log(JSON.stringify(doc, null, 2));
        process.exit(0);
      }
    }

    // try exact title
    doc = await File.findOne({ title: arg }).lean();
    if (doc) {
      console.log('Found by title (exact):');
      console.log(JSON.stringify(doc, null, 2));
      process.exit(0);
    }

    // case-insensitive title
    doc = await File.findOne({ title: { $regex: `^${arg}$`, $options: 'i' } }).lean();
    if (doc) {
      console.log('Found by title (case-insensitive):');
      console.log(JSON.stringify(doc, null, 2));
      process.exit(0);
    }

    // driveUrl contains
    doc = await File.findOne({ driveUrl: { $regex: arg, $options: 'i' } }).lean();
    if (doc) {
      console.log('Found by driveUrl contains:');
      console.log(JSON.stringify(doc, null, 2));
      process.exit(0);
    }

    console.log('No document found for:', arg);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
