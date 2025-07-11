const fs = require('fs');
const readline = require('readline');
const typesenseClient = require('./typesenseClient');

async function importBooks() {
  const collectionName = 'books';

  const schema = {
    name: collectionName,
    fields: [
      { name: 'id', type: 'string' },
      { name: 'title', type: 'string' },
      { name: 'authors', type: 'string[]' },
      { name: 'publication_year', type: 'int32' },
      { name: 'average_rating', type: 'float' },
      { name: 'ratings_count', type: 'int32' },
      { name: 'image_url', type: 'string' },
    ],
    default_sorting_field: 'ratings_count',
  };

  
  try {
    await typesenseClient.collections(collectionName).retrieve();
    console.log(`Collection "${collectionName}" already exists.`);
  } catch {
    await typesenseClient.collections().create(schema);
    console.log(`Created collection "${collectionName}"`);
  }

  const fileStream = fs.createReadStream('data/books.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const BATCH_SIZE = 100;
  let batch = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    batch.push(line);

    if (batch.length >= BATCH_SIZE) {
      await typesenseClient
        .collections(collectionName)
        .documents()
        .import(batch.join('\n'), { action: 'upsert' });
      batch = [];
    }
  }

  
  if (batch.length > 0) {
    await typesenseClient
      .collections(collectionName)
      .documents()
      .import(batch.join('\n'), { action: 'upsert' });
  }

  console.log('Book data imported successfully.');
}

module.exports = importBooks;
