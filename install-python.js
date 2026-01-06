const { execSync } = require("child_process");

try {
  console.log("Checking Python3...");
  try {
    execSync("python3 --version", { stdio: "inherit" });
  } catch {
    console.log("Python3 not found. Installing...");
    execSync("sudo apt update", { stdio: "inherit" });
    execSync("sudo apt install -y python3 python3-pip", { stdio: "inherit" });
  }

  console.log("Installing Python packages...");
  execSync("pip3 install --no-cache-dir -r requirements.txt", { stdio: "inherit" });

  console.log("Python and dependencies installed successfully!");
} catch (err) {
  console.error("Installation failed:", err);
  process.exit(1);
}
