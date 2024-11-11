const result = await collection.updateMany(
  { status: "pending" },
  { $set: { status: "processed" } }
);
console.log(`Updated ${result.modifiedCount} documents`);
