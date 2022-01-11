// @ts-check

require("dotenv").config();

const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://1234:${process.env.MONGO_PASSWORD}@cluster0.qemkv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function main() {
  const c = await client.connect();

  const users = client.db("sy12").collection("users"); // 존재하지 않는 콜렉션을 지정하는 것만으로도 생성
  const cities = client.db("sy12").collection("cities");

  await users.deleteMany({}); // users collection을 비움
  await cities.deleteMany({}); // users collection을 비움

  await users.insertMany([
    {
      name: "Foo",
      birthYear: 2020,
      contacts: [
        { type: "phone", number: "+821000000000" },
        { type: "home", number: "+8220000000" }
      ],
      city: "Busan"
    },
    {
      name: "Bar",
      birthYear: 1995,
      contacts: [{ type: "phone" }],
      city: "Seoul"
    },
    {
      name: "Baz",
      birthYear: 1990,
      city: "Busan"
    },
    {
      name: "Poo",
      birthYear: 1997,
      city: "Daejeon"
    }
  ]);

  await cities.insertMany([
    {
      name: "Seoul",
      population: 980
    },
    {
      name: "Busan",
      population: 340
    },
    {
      name: "Daejeon",
      population: 150
    }
  ]);

  await users.updateOne(
    {
      name: "Baz"
    },
    {
      $set: {
        name: "Boo"
      }
    }
  );

  // await users.deleteOne({
  //   name: "Baz"
  // });

  const cursor = users.aggregate([
    {
      $lookup: {
        from: "cities",
        localField: "city",
        foreignField: "name",
        as: "city_info"
      }
    },
    {
      $match: {
        $and: [
          {
            "city_info.population": {
              $gte: 500
            }
          },
          {
            birthYear: {
              $gte: 1995
            }
          }
        ]
      }
    },
    {
      $count: "num_users"
    }
  ]);

  // const cursor = users.find(
  //   {
  //     "contacts.type": "phone", // nesting 된 데이터는 dot notion으로 접근 가능,
  //     city: "Busan"
  //   }
  //   // {
  //   //   birthYear: {
  //   //     $gte: 1990
  //   //   }
  //   // }
  //   // {
  //   //   sort: {
  //   //     birthYear: 1
  //   //   }
  //   // }
  // );

  await cursor.forEach(console.log);
  await client.close();
}

main();
