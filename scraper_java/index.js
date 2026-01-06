// scraper_java/index.js
const { spawn } = require("child_process");
const path = require("path");
const mongoose = require("mongoose");

// اتصال به MongoDB (داخل Docker باید اسم کانتینر MongoDB داده شود)
const MONGO_URI = "mongodb://mymongo:27017/mymongo"; // به جای localhost از اسم کانتینر استفاده کن
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// مدل ساده برای ذخیره نتایج
const ScraperResultSchema = new mongoose.Schema({
  channel: String,
  data: Object,
  createdAt: { type: Date, default: Date.now }
});

const ScraperResult = mongoose.model("ScraperResult", ScraperResultSchema);

// اجرای Python scraper
function runScraperForChannel(channel) {
  return new Promise((resolve, reject) => {
    if (!channel || typeof channel !== "string") {
      return reject(new Error("Invalid channel input"));
    }

    const pythonScriptPath = path.resolve(__dirname, "main.py");
    const py = spawn("python", [pythonScriptPath, channel]);

    let stdoutData = "";
    let stderrData = "";

    py.stdout.on("data", chunk => {
      stdoutData += chunk.toString("utf8");
    });

    py.stderr.on("data", chunk => {
      stderrData += chunk.toString("utf8");
    });

    py.on("error", err => {
      reject(new Error("Failed to start Python: " + err.message));
    });

    py.on("close", async code => {
      if (code !== 0) {
        return reject(new Error(`Python exited with code ${code}:\n${stderrData}`));
      }

      try {
        const json = JSON.parse(stdoutData);
        if (json.error) {
          return reject(new Error(json.error));
        }

        // ذخیره در MongoDB
        const result = new ScraperResult({ channel, data: json });
        await result.save();

        resolve(json);
      } catch (err) {
        reject(
          new Error(
            "Failed to parse JSON from Python:\n" +
            err.message +
            "\nRAW OUTPUT:\n" +
            stdoutData
          )
        );
      }
    });
  });
}

// CLI support
if (require.main === module) {
  const channelArg = process.argv[2];

  if (!channelArg) {
    console.error(JSON.stringify({ error: "Usage: node index.js <channel>" }));
    process.exit(1);
  }

  runScraperForChannel(channelArg)
    .then(out => {
      console.log("Data saved to MongoDB successfully");
      process.stdout.write(JSON.stringify(out, null, 2));
      mongoose.connection.close();
    })
    .catch(err => {
      console.error(JSON.stringify({ error: err.message }));
      mongoose.connection.close();
      process.exit(1);
    });
}

module.exports = { runScraperForChannel };
