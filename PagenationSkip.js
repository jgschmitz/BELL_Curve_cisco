const page = 2;
const pageSize = 10;

const results = await collection.find()
  .skip(page * pageSize)
  .limit(pageSize)
  .toArray();
