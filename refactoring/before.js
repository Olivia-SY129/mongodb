/* eslint-disable */

// 모든 가문의 캐릭터들을 놓고 봤을 때 가장 부정적인 가문과 가장 긍정적인 가문을 알아보자.
const resultsByHouseSlugs = {};

/**
 * @returns @typeof Character
 * @property  {string} slug
 * @property  {number} polarity
 * @property  {string} house
 */

/**
 * @typeof House
 * @property {string} slug
 * @property {Character[]} members
 */

const https = require("https");

const GOTAPI_PREFIX = "https://game-of-thrones-quotes.herokuapp.com/v1";

/**
 * @param {string} url
 * @returns {*}
 */
async function getHttpsJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let jsonStr = "";
      res.setEncoding("utf-8");
      res.on("data", data => {
        jsonStr += data;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(jsonStr);
          resolve(parsed);
        } catch (err) {
          reject(
            new Error("The server response was not a vaild JSON document.", err)
          );
        }
      });
    });
  });
}

/**
 * @returns {Promise<House[]>}
 */
async function getHouses() {
  return getHttpsJson(`${GOTAPI_PREFIX}/houses`);
}

/**
 * @param {string} quote
 * @returns {string}
 */
function sanitizeQuote(quote) {
  return quote.replace(/[^a-zA-Z0-9., ]/g, "");
}

/**
 * @param {string} slug
 * @returns {Promise<string>}
 */
async function getMergedQuotesOfCharacter(slug) {
  const character = await getHttpsJson(`${GOTAPI_PREFIX}/character/${slug}`);
  return sanitizeQuote(character[0].quotes.join(" "));
}

/**
 *
 * @param {string} quote
 *
 */
async function getSentimAPIResult(quote) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      text: quote
    });

    const postReq = https.request(
      {
        hostname: "sentim-api.herokuapp.com",
        method: "POST",
        path: "/api/v1/",
        headers: {
          Accept: "application/json; encoding=utf-8",
          "Content-Type": "application/json; encoding=utf-8",
          "Content-Length": body.length
        }
      },
      res => {
        let jsonStr = "";
        res.setEncoding("utf-8");
        res.on("data", data => {
          jsonStr += data;
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(jsonStr));
          } catch (err) {
            reject(
              new Error(
                "The server response was not a vaild JSON document.",
                err
              )
            );
          }
        });
      }
    );

    postReq.write(body);
  });
}

/**
 *
 * @param {number[]} numbers
 * @returns {number}
 */
function sum(numbers) {
  return numbers.reduce((sum, curr) => sum + curr, 0);
}

async function main() {
  const houses = await getHouses();
  const characters = await Promise.all(
    houses
      .map(house =>
        house.members.map(member =>
          getMergedQuotesOfCharacter(member.slug).then(quote => ({
            house: house.slug,
            character: member.slug,
            quote
          }))
        )
      )
      .flat()
  );

  const charactersWithPolarity = await Promise.all(
    characters.map(async character => {
      const result = await getSentimAPIResult(character.quote);
      return {
        ...character,
        polarity: result.result.polarity
      };
    })
  );

  /**
   * @type {Object.<string, Character[]> *}
   */
  const charactersByHouseSlugs = {};

  charactersWithPolarity.forEach(character => {
    charactersByHouseSlugs[character.house] =
      charactersByHouseSlugs[character.house] || [];
    charactersByHouseSlugs[character.house].push(character);
  });

  const houseSlugs = Object.keys(charactersByHouseSlugs);

  const result = houseSlugs
    .map(houseSlug => {
      const charactersOfHouse = charactersByHouseSlugs[houseSlug];
      if (!charactersOfHouse) return undefined;

      const sumPolarity = sum(
        charactersOfHouse.map(character => character.polarity)
      );
      const averagePolarity = sumPolarity / charactersOfHouse.length;

      return [houseSlug, averagePolarity];
    })
    .sort((a, b) => a[1] - b[1]);

  console.log(result);
}

main();
