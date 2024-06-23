import mongoose from "mongoose";

 const initDB = async () => {
   try {
     const { connection } = await mongoose.connect(
       process.env.MONGO_URI as string
     );
     if (connection.readyState === 1) {
       console.log("MongoDB Connected");
       return Promise.resolve(true);
     }
   } catch (error) {
     console.error(error);
     return Promise.reject(error);
   }
 };

export default initDB;
