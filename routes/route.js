const userRouter = require("express").Router();
const user = require("../controller/user");
const auth = require("../middleware/auth");

userRouter.post("/register",user.register);
userRouter.post("/login", user.logIn); 
userRouter.get("/viewUser/:_id", user.viewUser); 
userRouter.get("/listAllUser", user.listAllUser); 
userRouter.put("/updateUserWithId/:_id", user.updateUserWithId); 
userRouter.put("/updateUserWithToken",auth.verifyToken,user.updateUserWithToken); 
userRouter.delete("/deleteUser/:_id",user.deleteUser);
module.exports = userRouter;