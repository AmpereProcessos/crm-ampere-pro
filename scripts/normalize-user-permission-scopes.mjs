import { MongoClient, ServerApiVersion } from 'mongodb';

if (!process.env.MONGODB_URI) throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

const scopePaths = [
  'permissoes.propostas.escopo',
  'permissoes.oportunidades.escopo',
  'permissoes.analisesTecnicas.escopo',
  'permissoes.homologacoes.escopo',
  'permissoes.clientes.escopo',
  'permissoes.projetos.escopo',
  'permissoes.parceiros.escopo',
  'permissoes.resultados.escopo',
];

try {
  await client.connect();
  const users = client.db('crm').collection('users');
  const totalUsers = await users.countDocuments({});
  const beforeMissingByScope = {};

  for (const scopePath of scopePaths) {
    beforeMissingByScope[scopePath] = await users.countDocuments({ [scopePath]: { $exists: false } });
  }

  const setScopes = Object.fromEntries(
    scopePaths.map((scopePath) => [scopePath, { $ifNull: [`$${scopePath}`, null] }])
  );
  const updateResult = await users.updateMany({}, [{ $set: setScopes }]);

  const missingByScope = {};
  const emptyByScope = {};
  for (const scopePath of scopePaths) {
    missingByScope[scopePath] = await users.countDocuments({ [scopePath]: { $exists: false } });
    emptyByScope[scopePath] = await users.countDocuments({ [scopePath]: { $size: 0 } });
  }

  const remainingMissing = Object.values(missingByScope).reduce((total, count) => total + count, 0);
  if (remainingMissing !== 0) {
    throw new Error(`Verification failed: ${remainingMissing} scope fields are still missing.`);
  }

  console.log(
    JSON.stringify(
      {
        totalUsers,
        beforeMissingByScope,
        matchedUsers: updateResult.matchedCount,
        modifiedUsers: updateResult.modifiedCount,
        missingByScope,
        emptyByScope,
      },
      null,
      2
    )
  );
} finally {
  await client.close();
}
