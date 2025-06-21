import { db, assetsTable } from "@/lib/db";

export default async function TestDataPage() {
  const assets = await db.select().from(assetsTable).limit(5);

  return (
    <div>
      <h1>Test Data</h1>
      <pre>{JSON.stringify(assets, null, 2)}</pre>
    </div>
  );
}
