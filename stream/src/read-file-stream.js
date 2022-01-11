const fs = require("fs");
const { log } = console;
const rs = fs.createReadStream("local/big-file", {
  encoding: "utf-8",
  highWaterMark: 65536 * 4
});

/** @type {Object.<string, number>} */
const numBlocksPerCharacter = {
  a: 0,
  b: 0
};

/** @type {string | undefined} */
let prevCharacter;
let chunkCnt = 0;

rs.on("data", data => {
  if (typeof data !== "string") return;

  chunkCnt += 1;

  for (let i = 0; i < data.length; i += 1) {
    if (data[i] !== prevCharacter) {
      const newCharacter = data[i];

      if (!newCharacter) continue;

      prevCharacter = newCharacter;
      numBlocksPerCharacter[newCharacter] += 1;
    }
  }
});
rs.on("end", () => {
  log("Event: end");
  log(numBlocksPerCharacter);
  log("chunkCnt", chunkCnt);
});
