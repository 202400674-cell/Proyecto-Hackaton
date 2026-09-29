import { FinCoreClient } from "@fincore/sdk";

const client = new FinCoreClient({
  baseUrl: process.env.FINCORE_BASE_URL!,
  apiKey: process.env.FINCORE_API_KEY!,
});

const demo = await client.demo({
  idempotencyKey: client.idempotencyKey("demo"),
  source: "sdk",
});
console.log("demo tx", demo.data.txId, demo.data.dashboardUrl);

const execution = await client.execution.executeIntent(
  {
    intentType: "vaultDeposit",
    deploymentId: "official-rail-v0-anvil-individual-vault",
    parameters: { amount: "1000" },
  },
);
console.log("execution", execution.data.executionId, execution.data.status);