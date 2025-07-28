// solveCaptcha.js
const axios = require("axios");

const CAPMONSTER_API_KEY = process.env.CAPMONSTER_API_KEY;

async function solveCaptcha(base64Image) {
  try {
    // 1. Create task
    const createTaskRes = await axios.post("https://api.capmonster.cloud/createTask", {
      clientKey: CAPMONSTER_API_KEY,
      task: {
        type: "ImageToTextTask",
        body: base64Image
      }
    });

    const taskId = createTaskRes.data.taskId;
    if (!taskId) throw new Error("Failed to create CapMonster task");

    // 2. Poll for result
    let solution = null;
    for (let i = 0; i < 10; i++) {
      await new Promise(res => setTimeout(res, 3000)); // wait 3 sec

      const res = await axios.post("https://api.capmonster.cloud/getTaskResult", {
        clientKey: CAPMONSTER_API_KEY,
        taskId
      });

      if (res.data.status === "ready") {
        solution = res.data.solution.text;
        break;
      }
    }

    if (!solution) throw new Error("Captcha solution not ready");

    return { success: true, text: solution };
  } catch (err) {
    console.error("❌ CapMonster error:", err.message);
    return { success: false, error: err.message };
  }
}

module.exports = solveCaptcha;
