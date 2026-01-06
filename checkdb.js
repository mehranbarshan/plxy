const mongoose = require("mongoose");

const MONGO_URI = "mongodb://localhost:27017/mymongo"; // مسیر دیتابیس خودت

const ScraperResultSchema = new mongoose.Schema({
  channel: String,
  data: Object,
  createdAt: { type: Date, default: Date.now }
});

const ScraperResult = mongoose.model("ScraperResult", ScraperResultSchema);

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const results = await ScraperResult.find();
    console.log("تعداد رکوردها:", results.length);
    if (results.length > 0) {
      console.log("آخرین رکورد ذخیره شده:");
      console.log(results[results.length - 1]);
    }
    mongoose.connection.close();
  })
  .catch(err => console.error("خطا در اتصال به MongoDB:", err));
