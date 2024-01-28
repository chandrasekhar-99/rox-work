const express = require("express");
const path = require("path");
const cors = require('cors');
const {open} = require('sqlite');
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json())
app.use(cors());

const dbPath = path.join(__dirname,"test.db");

let db = null;

const initializeDBAndServer = async () =>{
  try{
    db = await open({
      filename:dbPath,
      driver : sqlite3.Database,
    });
    app.listen(8000, ()=>{
      console.log("server running at http://localhost:8000/");
    });
    createTable();
  }
  catch(e){
    console.log(`DB error:${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const createTable = async () => {
  const firstQuery = `
  CREATE TABLE IF NOT EXISTS productsData(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    price REAL,
    description TEXT,
    category TEXT,
    image TEXT,
    sold BOOLEAN,
    dataOfSale DATETIME,
  );`;
  await db.run(firstQuery);
}


app.get("/input-data", async (req,res)=>{
  const apiUrl = "https://s3.amazonaws.com/roxiler.com/product_transaction.json";
  const response = await fetch(apiUrl);
  const fetchData = await response.json(); 
  for (const productData of fetchData){
    const insertQuery = `
    INSERT INTO productData (id,title,price,description,category,image,sold,dateOfsale)
    VALUES (?,?,?,?,?,?,?,?);`;

    const dbResponse = await db.run(insertQuery,[
      productData.id,
      productData.title,
      productData.price,
      productData.description,
      productData.category,
      productData.image,
      productData.sold,
      productData.dateOfsale,
    ]);
  }
    res.send({msg : 'initailized db successfully'})
});

app.get('/transactions', async (req,res) => {
  const {month = "", t_query = "", limit = 10, offset = 0} = req.query;

  const transactionQuery = `
    SELECT
    *
    FROM productData
    WHERE 
    (title LIKE ? OR price LIKE ? OR description LIKE)
    AND strftime LIKE ('%m', dateOfsale) LIKE ?
    LIMIT ? OFFSET ? ;`;

  const params = [
    `${t_query}`,
    `${t_query}`,
    `${t_query}`,
    `${month}`,
    limit,
    offset,
  ];

  const totalQuery = `
    SELECT COUNT(id) AS total
    FROM productData
    WHERE 
    (title LIKE ? OR price LIKE ? OR description LIKE)
    AND strftime LIKE ('%m', dateOfsale) LIKE ? ;`;

  const totalParams = [
    `${t_query}`,
    `${t_query}`,
    `${t_query}`,
    `${month}`,
  ];

  const data = await db.all(transactionQuery,params);
  const totalData = await db.get(totalQuery,totalParams);
  res.json({transactionData: data,totalData})
});

module.exports = app;