import { MongoClient, ServerApiVersion } from 'mongodb';

if (!process.env.MONGODB_URI) throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

const clientsScopePath = 'permissoes.clientes.escopo';

try {
  await client.connect();
  const users = client.db('crm').collection('users');
  const totalUsers = await users.countDocuments({});
  const beforeGlobalUsers = await users.countDocuments({ [clientsScopePath]: null });

  const updateResult = await users.updateMany({}, { $set: { [clientsScopePath]: null } });

  const afterGlobalUsers = await users.countDocuments({ [clientsScopePath]: null });
  const nonGlobalUsers = await users.countDocuments({
    $or: [{ [clientsScopePath]: { $exists: false } }, { [clientsScopePath]: { $ne: null } }],
  });

  if (afterGlobalUsers !== totalUsers || nonGlobalUsers !== 0) {
    throw new Error(
      `Verification failed: ${afterGlobalUsers}/${totalUsers} users have a global clients scope, ${nonGlobalUsers} are still non-global.`
    );
  }

  console.log(
    JSON.stringify(
      {
        totalUsers,
        beforeGlobalUsers,
        matchedUsers: updateResult.matchedCount,
        modifiedUsers: updateResult.modifiedCount,
        afterGlobalUsers,
        nonGlobalUsers,
      },
      null,
      2
    )
  );
} finally {
  await client.close();
}
