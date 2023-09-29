const mongoose =require('mongoose')

mongoose.set("strictQuery", false);

const DBURL ="mongodb://127.0.0.1:27017/userData";
mongoose.connect(DBURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => { 
    console.log("DB Connected.........................................");
  })
  .catch((err) => {    
    console.log("Error in connection❌");
  });