const fs = require("fs");

/** @param {number} highWaterMark */

function processJSON(highWaterMark) {
  const rs = fs.createReadStream("local/jsons", {
    encoding: "utf-8",
    highWaterMark
  });

  let totalSum = 0;
  let accumulatedJsonStr = "";

  rs.on("data", chunk => {
    // console.log("Event: chunk", chunk);

    if (typeof chunk !== "string") return;

    accumulatedJsonStr += chunk;

    const lastNewLineIndex = accumulatedJsonStr.lastIndexOf("\n");

    const jsonLinesStr = accumulatedJsonStr.substring(0, lastNewLineIndex);
    accumulatedJsonStr = accumulatedJsonStr.substring(lastNewLineIndex);

    totalSum += jsonLinesStr
      .split("\n")
      .map(jsonLine => {
        try {
          return JSON.parse(jsonLine);
        } catch (err) {
          return undefined;
        }
      })
      .filter(json => json)
      .map(json => json.data)
      .reduce((sum, curr) => sum + curr, 0);
  });
  rs.on("end", () => {
    console.log("Event: end");
    console.log("heighWaterMark: " + highWaterMark, totalSum);
  });
}

for (let waterMark = 1; waterMark < 50; waterMark += 1) {
  processJSON(waterMark);
}
