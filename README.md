# Bell Curve for Cisco for Marco Wu
Simplified runbook to simulate a bell curve in MongoDB Atlas Charts by preprocessing data in MongoDB

Bell Curve Simulation Runbook
Define Your Dataset: Assume a dataset where each document contains a numeric field you want to analyze. Let's call this field value.

```
{
  "_id": 1,
  "value": 5.4
}
```
Calculate Mean and Standard Deviation: Use MongoDB’s aggregation pipeline to calculate the mean and standard deviation of value.
```
db.collection.aggregate([
  {
    $group: {
      _id: null,
      avgValue: { $avg: "$value" },
      stdDev: { $stdDevSamp: "$value" }
    }
  }
]);
```
Output: This aggregation returns the mean (avgValue) and standard deviation (stdDev) of the value field. Note these values for later use.
Classify Data by Standard Deviation Ranges: Use an aggregation pipeline to categorize values based on their deviation from the mean. Here’s an example that groups values into ranges: -1 to +1, +1 to +2, etc.
```
const mean = /* Output from step 2 avgValue */;
const stdDev = /* Output from step 2 stdDev */;
```
```
db.collection.aggregate([
  {
    $addFields: {
      stdDevRange: {
        $switch: {
          branches: [
            { case: { $lt: [ { $abs: { $subtract: [ "$value", mean ] } }, stdDev ] }, then: "Within 1 SD" },
            { case: { $and: [ { $gte: [ { $abs: { $subtract: [ "$value", mean ] } }, stdDev ] }, { $lt: [ { $abs: { $subtract: [ "$value", mean ] } }, 2 * stdDev ] } ] }, then: "Within 2 SD" },
            { case: { $and: [ { $gte: [ { $abs: { $subtract: [ "$value", mean ] } }, 2 * stdDev ] }, { $lt: [ { $abs: { $subtract: [ "$value", mean ] } }, 3 * stdDev ] } ] }, then: "Within 3 SD" },
            { case: { $gte: [ { $abs: { $subtract: [ "$value", mean ] } }, 3 * stdDev ] }, then: "Beyond 3 SD" }
          ],
          default: "Unknown"
        }
      }
    }
  },
  {
    $group: {
      _id: "$stdDevRange",
      count: { $sum: 1 }
    }
  }
]);
```
Explanation:
This pipeline classifies each document based on its distance from the mean (in terms of standard deviations) and groups them accordingly.
The $group stage then counts the documents in each range.
Load Aggregated Data into Atlas Charts:

In Atlas Charts, create a bar chart where each bar represents the count of documents within each standard deviation range.
Label each bar according to its standard deviation range (Within 1 SD, Within 2 SD, etc.).
Adjust the Chart Display for a Bell Curve Appearance:

Sort the ranges in ascending order (e.g., Within 1 SD, Within 2 SD, etc.).
Select “smooth” for the line if using a line chart or overlay it to mimic a bell curve.
Full Example in JavaScript (Node.js)
Below is a runnable Node.js script that uses MongoDB’s aggregation pipeline to achieve the bell curve effect:
```
const { MongoClient } = require("mongodb");

async function createBellCurveData() {
  const uri = "YOUR_MONGODB_CONNECTION_STRING";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("yourDatabase");
    const collection = db.collection("yourCollection");

    // Step 1: Calculate Mean and Standard Deviation
    const stats = await collection.aggregate([
      {
        $group: {
          _id: null,
          avgValue: { $avg: "$value" },
          stdDev: { $stdDevSamp: "$value" }
        }
      }
    ]).toArray();

    const mean = stats[0].avgValue;
    const stdDev = stats[0].stdDev;

    // Step 2: Classify Data by Standard Deviation Ranges
    const bellCurveData = await collection.aggregate([
      {
        $addFields: {
          stdDevRange: {
            $switch: {
              branches: [
                { case: { $lt: [ { $abs: { $subtract: [ "$value", mean ] } }, stdDev ] }, then: "Within 1 SD" },
                { case: { $and: [ { $gte: [ { $abs: { $subtract: [ "$value", mean ] } }, stdDev ] }, { $lt: [ { $abs: { $subtract: [ "$value", mean ] } }, 2 * stdDev ] } ] }, then: "Within 2 SD" },
                { case: { $and: [ { $gte: [ { $abs: { $subtract: [ "$value", mean ] } }, 2 * stdDev ] }, { $lt: [ { $abs: { $subtract: [ "$value", mean ] } }, 3 * stdDev ] } ] }, then: "Within 3 SD" },
                { case: { $gte: [ { $abs: { $subtract: [ "$value", mean ] } }, 3 * stdDev ] }, then: "Beyond 3 SD" }
              ],
              default: "Unknown"
            }
          }
        }
      },
      {
        $group: {
          _id: "$stdDevRange",
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    console.log("Bell Curve Data:", bellCurveData);

  } finally {
    await client.close();
  }
}

createBellCurveData().catch(console.error);
```

