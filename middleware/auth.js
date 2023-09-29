const userModel = require("../Model/user");
const jwt = require("jsonwebtoken");
module.exports = {
    verifyToken: async (req, res, next) => {
      try {
        let token = await jwt.verify(req.headers.token, "secretKey")
        if (!token) {
          return res.send({
            responseCode: 501,
            responseMessage: " Please provide token",
          });
        }
        else {
          let userData = await userModel.findOne({ _id: token._id })
          if (!userData) {
            return res.send({
              responseCode: 404,
              responseMessage: "User not found..!!",
            });
          }
          if (userData.status == "BLOCK") {
            return res.send({
              responseCode: 403,
              responseMessage: "User has been Blocked",
            });
          }
          else if (userData.status == "DELETE") {
            return res.send({
              responseCode: 401,
              responseMessage: "User has been deleted",
            });
          }
          else {
            req.userId = userData._id;
            next();
          }
        }
      } catch (error) {
        console.log(error)
        return res.send({
          responseCode: 500,
          responseMessage: "Internal Server Error",
          responseResult: error,
        });
      }
    },
  };