const {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction
} = require("@solana/web3.js");
const fs = require("fs");
const anchor = require("@coral-xyz/anchor");
const BN = anchor.BN;

async function main() {
  console.log("🚀 Initializing TipJar Platform...\n");

  // Connection to Devnet
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  // Load wallet
  const walletPath = process.env.ANCHOR_WALLET || `${process.env.HOME}/.config/solana/id.json`;
  const walletKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, "utf-8")))
  );

  console.log("Authority Wallet:", walletKeypair.publicKey.toString());

  // Program ID
  const programId = new PublicKey("4E55dXLQkqXn7zi75aeBh4LJMXeAZw4KPYwgijuSCjun");
  console.log("Program ID:", programId.toString());

  // Find Platform PDA
  const [platformPDA, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    programId
  );

  console.log("Platform PDA:", platformPDA.toString());
  console.log("Bump:", bump);

  // Check balance
  const balance = await connection.getBalance(walletKeypair.publicKey);
  console.log("Wallet Balance:", balance / 1e9, "SOL\n");

  if (balance < 0.1 * 1e9) {
    console.log("⚠️  Low balance! Getting airdrop...");
    try {
      const signature = await connection.requestAirdrop(
        walletKeypair.publicKey,
        2 * 1e9
      );
      await connection.confirmTransaction(signature);
      console.log("✅ Airdrop successful!\n");
    } catch (err) {
      console.log("Airdrop failed, continuing anyway...\n");
    }
  }

  // Check if platform already exists
  try {
    const accountInfo = await connection.getAccountInfo(platformPDA);
    if (accountInfo && accountInfo.data.length > 0) {
      console.log("✅ Platform already initialized!");
      console.log("Account size:", accountInfo.data.length, "bytes");
      console.log("Owner:", accountInfo.owner.toString());
      console.log("\n✨ Your TipJar P2P platform is ready to use!");
      return;
    }
  } catch (err) {
    // Platform doesn't exist yet
  }

  console.log("Platform not found, initializing...\n");

  // Load the IDL to get instruction discriminator
  const idl = JSON.parse(fs.readFileSync("target/idl/tipjar.json", "utf-8"));

  // Find initialize_platform instruction
  const initInstruction = idl.instructions.find(ix => ix.name === "initialize_platform");
  if (!initInstruction) {
    throw new Error("initialize_platform instruction not found in IDL");
  }

  // Create instruction discriminator (first 8 bytes of SHA256 hash)
  const discriminator = Buffer.from(initInstruction.discriminator);
  console.log("Instruction discriminator:", discriminator.toString("hex"));

  // Build instruction data (just the discriminator, no args)
  const data = discriminator;

  // Build accounts for the instruction
  const keys = [
    { pubkey: platformPDA, isSigner: false, isWritable: true },           // platform
    { pubkey: walletKeypair.publicKey, isSigner: true, isWritable: true }, // authority
    { pubkey: walletKeypair.publicKey, isSigner: false, isWritable: false }, // treasury (same as authority)
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
  ];

  // Create instruction
  const instruction = {
    keys,
    programId,
    data,
  };

  // Create and send transaction
  const transaction = new Transaction().add(instruction);

  console.log("Sending transaction...");

  try {
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [walletKeypair],
      {
        commitment: "confirmed",
        preflightCommitment: "confirmed",
      }
    );

    console.log("\n✅ Platform initialized successfully!");
    console.log("Transaction signature:", signature);
    console.log("Explorer:", `https://explorer.solana.com/tx/${signature}?cluster=devnet`);

    // Wait a bit for account to be available
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify platform was created
    const accountInfo = await connection.getAccountInfo(platformPDA);
    if (accountInfo) {
      console.log("\n📊 Platform Account Created:");
      console.log("Address:", platformPDA.toString());
      console.log("Data Size:", accountInfo.data.length, "bytes");
      console.log("Owner:", accountInfo.owner.toString());
      console.log("Lamports:", accountInfo.lamports / 1e9, "SOL");
    }

    console.log("\n✨ Your TipJar P2P platform is ready to use!");
  } catch (error) {
    console.error("\n❌ Error initializing platform:");

    if (error.logs) {
      console.error("\nTransaction logs:");
      error.logs.forEach(log => console.error(log));
    }

    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
