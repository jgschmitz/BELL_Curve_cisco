const startDate = new Date("2024-01-01");
const endDate = new Date("2024-12-31");

const results = await collection.find({
  dateField: {
    $gte: startDate,
    $lte: endDate
  }
}).toArray();
