const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();


const db = new sqlite3.Database("./test.db",sqlite3.OPEN_READWRITE, (err)=>{
  if (err) return console.error(err.message);

  console.log("connection successful");
});

db.close((err)=>{
  if (err) return console.error(err.message);
});





const apiUrl = "https://s3.amazonaws.com/roxiler.com/product_transaction.json";

async function fetchData() {
  try {
    const response = await fetch(apiUrl);

    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    
    const data = await response.json(); 

    
    console.log('Fetched data:', data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
}

fetchData();

router.get('/',function(req,res,next){
    res.send('Hello new node');
});

  

module.exports = router;