import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const DEFAULT_LOCAL_URI = "mongodb://127.0.0.1:27017/frameza";
const BATCH_SIZE = 500;

function getArg(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((a) => a.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

function getDbNameFromUri(uri, fallback) {
  if (!uri) return fallback;
  const match = uri.match(/\/([^/?]+)(\?|$)/);
  return match?.[1] || fallback;
}

async function copyCollection(sourceDb, targetDb, collectionName) {
  const sourceCollection = sourceDb.collection(collectionName);
  const targetCollection = targetDb.collection(collectionName);

  // Replace destination data so Atlas mirrors local state.
  await targetCollection.deleteMany({});

  const cursor = sourceCollection.find({});
  let batch = [];
  let copied = 0;

  for await (const doc of cursor) {
    batch.push(doc);
    if (batch.length >= BATCH_SIZE) {
      await targetCollection.insertMany(batch, { ordered: false });
      copied += batch.length;
      batch = [];
    }
  }

  if (batch.length) {
    await targetCollection.insertMany(batch, { ordered: false });
    copied += batch.length;
  }

  return copied;
}

async function run() {
  const sourceUri = getArg("source") || process.env.LOCAL_MONGO_URI || DEFAULT_LOCAL_URI;
  const targetUri = getArg("target") || process.env.ATLAS_MONGO_URI || process.env.MONGO_URI;

  if (!targetUri) {
    throw new Error("Missing target MongoDB URI. Set ATLAS_MONGO_URI or MONGO_URI.");
  }

  const sourceDbName = getArg("sourceDb") || getDbNameFromUri(sourceUri, "frameza");
  const targetDbName = getArg("targetDb") || getDbNameFromUri(targetUri, "frameza");

  const sourceClient = new MongoClient(sourceUri);
  const targetClient = new MongoClient(targetUri);

  try {
    await sourceClient.connect();
    await targetClient.connect();

    const sourceDb = sourceClient.db(sourceDbName);
    const targetDb = targetClient.db(targetDbName);

    const collections = await sourceDb.listCollections({}, { nameOnly: true }).toArray();
    const names = collections.map((c) => c.name).filter((n) => !n.startsWith("system."));

    if (!names.length) {
      console.log(`No collections found in source DB: ${sourceDbName}`);
      return;
    }

    console.log(`Source DB: ${sourceDbName}`);
    console.log(`Target DB: ${targetDbName}`);
    console.log(`Collections to copy: ${names.join(", ")}`);

    for (const name of names) {
      const copied = await copyCollection(sourceDb, targetDb, name);
      console.log(`Copied ${copied} docs -> ${name}`);
    }

    console.log("Migration completed successfully.");
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
