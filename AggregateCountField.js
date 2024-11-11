#Aggregate Count by Field
const counts = await collection.aggregate([
  {
    $group: {
      _id: "$status",
      count: { $sum: 1 }
    }
  }
]).toArray();
