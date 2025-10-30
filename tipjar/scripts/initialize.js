const anchor = require("@coral-xyz/anchor");
const { PublicKey, SystemProgram } = require("@solana/web3.js");

async function main() {
  // Configure the client
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Load the program
  const idl = require("../target/idl/tipjar.json");
  const programId = new PublicKey(idl.address);
  const program = new anchor.Program(idl, programId, provider);

  console.log("🚀 Initializing TipJar Platform...");
  console.log("Program ID:", program.programId.toString());
  console.log("Authority:", provider.wallet.publicKey.toString());

  // Get Platform PDA
  const [platformPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    program.programId
  );

  console.log("Platform PDA:", platformPDA.toString());

  // Treasury (usar la misma wallet por ahora)
  const treasury = provider.wallet.publicKey;

  try {
    // Check if platform already exists
    try {
      const platformAccount = await program.account.platform.fetch(platformPDA);
      console.log("✅ Platform already initialized!");
      console.log("Platform data:", {
        authority: platformAccount.authority.toString(),
        treasury: platformAccount.treasury.toString(),
        feeBps: platformAccount.feeBps.toString(),
        totalVolume: platformAccount.totalVolume.toString(),
        totalTransactions: platformAccount.totalTransactions.toString(),
        isActive: platformAccount.isActive,
      });
      return;
    } catch (err) {
      // Platform doesn't exist, continue to initialize
      console.log("Platform not initialized yet, proceeding...");
    }

    // Initialize platform
    const tx = await program.methods
      .initializePlatform()
      .accounts({
        platform: platformPDA,
        authority: provider.wallet.publicKey,
        treasury: treasury,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Platform initialized successfully!");
    console.log("Transaction signature:", tx);
    console.log("Explorer:", `https://explorer.solana.com/tx/${tx}?cluster=devnet`);

    // Fetch and display platform data
    const platformAccount = await program.account.platform.fetch(platformPDA);
    console.log("\n📊 Platform Data:");
    console.log("Authority:", platformAccount.authority.toString());
    console.log("Treasury:", platformAccount.treasury.toString());
    console.log("Fee (BPS):", platformAccount.feeBps.toString(), "(0.5%)");
    console.log("Total Volume:", platformAccount.totalVolume.toString());
    console.log("Total Transactions:", platformAccount.totalTransactions.toString());
    console.log("Is Active:", platformAccount.isActive);

    console.log("\n✨ Your TipJar P2P platform is ready to use!");
  } catch (error) {
    console.error("❌ Error initializing platform:");
    console.error(error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
