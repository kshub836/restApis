const userModel = require("../Model/user");
const bcrypt = require("bcrypt");
const { hashSync } = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretKey = "secretKey";
const uniqid = require('uniqid');
const Joi = require('@hapi/joi');

module.exports = {
    // api development

    async register(req, res) {
        try {
            let user = await userModel.findOne(
                {
                    $or: [{ emailAddress: req.body.emailAddress }, { phoneNumber: req.body.phoneNumber }],
                })
            let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            let phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
            if (req.body.emailAddress.match(emailRegex)) {
                if (req.body.phoneNumber.match(phoneRegex)) {
                    if (user) {
                        if (user.emailAddress == req.body.emailAddress) {
                            return res.status(400).send({
                                responseMessage: "Email already exists",
                                responseCode: 400,
                            });
                        } else if (user.phoneNumber == req.body.phoneNumber) {
                            return res.status(400).send({
                                responseMessage: "Mobile Number already exists",
                                responseCode: 400,
                            });
                        }
                    }
                    else {
                        var hashBusinessNum = hashSync(req.body.businessNumber, 10);
                        req.body.businessNumber = hashBusinessNum;
                        req.body.uniqueCode = uniqid();
                        req.body.externalReference = req.body.businessName;
                        let saveUser = await userModel.create(req.body)
                        if (!saveUser) {
                            return res.status(500).send({
                                responseMessage: "Internal server error",
                                responseCode: 500,
                            });
                        }
                        else {
                            return res.status(200).send({
                                responseMessage: "Registration success",
                                responseCode: 200,
                                res: saveUser
                            });
                        };
                    }
                }
                else {
                    return res.status(501).send({
                        responseMessage: "Phone number invalid",
                        responseCode: 501,
                    });
                }
            }
            else {
                return res.status(501).send({
                    responseMessage: "Email address invalid",
                    responseCode: 501,
                });
            }

        }
        catch (error) {
            console.log(error.message);
            return res.status(501).send({
                responseMessage: "Not Implemented",
                responseCode: 501,
            });
        }
    },

    async logIn(req, res) {
        try {
            var userId = req.body.userId;
            let userData = await userModel.findOne({
                $or: [
                    { emailAddress: userId },
                    { phoneNumber: userId },
                ]
            });
            if (userData) {
                var check = bcrypt.compareSync(req.body.businessNumber, userData.businessNumber);
                if (check == false) {
                    return res.status(403).send({
                        responseCode: 403,
                        responseMessage: "Incorrect Business number.",
                    });
                } else {
                    token = jwt.sign(
                        { _id: userData._id, emailAddress: userData.emailAddress },
                        "secretKey",
                        { expiresIn: "24H" }
                    );
                    return res.status(200).send({
                        responseMessage: "Login Success",
                        responseCode: 200,
                        token,
                        userData,
                    });
                }
            } else {
                return res.status(404).send({
                    responseCode: 404,
                    responseMessage: "User Not found...!!",
                });
            }
        } catch (error) {
            console.log(error.message);
            return res.status(501).send({
                responseCode: 501,
                responseMessage: "Something went wrong",
                error: error,
            });
        }
    },

    async viewUser(req, res) {
        const validationSchema = {
            _id: Joi.string().required()
        }
        try {
            const { _id } = await Joi.validate(req.params, validationSchema);
            let userResult = await userModel.findOne({ _id: _id });
            if (!userResult) {
                return res.status(404).send({
                    responseCode: 404,
                    responseMessage: "User Not Found!.",
                });
            }
            else {
                return res.status(200).send({
                    responseMessage: "User found successfully",
                    responseCode: 200,
                    res: userResult
                });
            }

        }
        catch (error) {
            console.log(error.message);
            return res.status(501).send({
                responseCode: 501,
                responseMessage: "Something went wrong",
                error: error,
            });
        }
    },

    async listAllUser(req, res) {
        const validationSchema = {
            search: Joi.string().optional(),
        }
        try {
            let query = { status: "Active" };
            const validatedBody = await Joi.validate(req.query, validationSchema);
            const { search } = validatedBody;
            if (search) {
                query.$or = [
                    { businessName: { $regex: search, $options: 'i' } },
                    { emailAddress: { $regex: search, $options: 'i' } },
                ]
            }
            let dataResults = await userModel.find(query).sort({ createdAt: -1 });
            return res.status(200).send({
                responseMessage: "Data Found",
                responseCode: 200,
                res: dataResults
            });
        }
        catch (error) {
            console.log(error.message);
            return res.status(501).send({
                responseMessage: "Not Implemented",
                responseCode: 501,
            });
        }
    },
    async updateUserWithId(req, res) {
        try {
            let userResult = await userModel.findOne({ _id: req.params });
            if (!userResult) {
                return res.status(404).send({
                    responseCode: 404,
                    responseMessage: "User Not Found!.",
                });
            }
            // if (req.body.emailAddress) {
            //    uniqueCheck = await userModel.find({ emailAddress: req.body.emailAddress,_id: { $ne: userResult._id }, status: { $ne:"Delete" } });
            //     if (uniqueCheck) {
            //         return res.status(409).send({
            //             responseCode: 409,
            //             responseMessage: "Email Exists!.",
            //           }); 
            //         }
            //         updated = await userModel.findByIdAndUpdate({_id:userResult._id},{$set:req.body,modifyDate: new Date()},{ new: true } );

            // }
            else {
                let updated = await userModel.findByIdAndUpdate({ _id: userResult._id }, { $set: req.body, modifyDate: new Date() }, { new: true });
                return res.status(200).send({
                    responseCode: 200,
                    responseMessage: "User profile Updated Successfully.",
                    res: updated
                });
            }

        } catch (error) {
            console.log(error.message);
            return res.status(501).send({
                responseMessage: "Not Implemented",
                responseCode: 501,
            });
        }
    },

    async updateUserWithToken(req, res) {
        try {
            let userResult = await userModel.findOne({ _id: req.userId });
            if (!userResult) {
                return res.status(404).send({
                    responseCode: 404,
                    responseMessage: "User Not Found!.",
                });
            }
            else {
                let updated = await userModel.findByIdAndUpdate({ _id: userResult._id }, { $set: req.body, modifyDate: new Date() }, { new: true });
                return res.status(200).send({
                    responseCode: 200,
                    responseMessage: "User profile Updated Successfully.",
                    res: updated
                });
            }

        } catch (error) {
            console.log(error.message);
            return res.status(501).send({
                responseMessage: "Not Implemented",
                responseCode: 501,
            });
        }
    },

    async deleteUser(req, res)  {
        const validationSchema = {
          _id: Joi.string().required(),
        }
        try {
          const { _id } = await Joi.validate(req.params, validationSchema);
          let userProfile = await userModel.find({ _id:_id });
          if (!userProfile) {
            return res.status(404).send({
              responseCode: 404,
              responseMessage: "User not Found",
            });
    
          }           
            else {
              await userModel.findByIdAndDelete(_id);
              return res.status(200).send({
                responseCode: 200,
                responseMessage: "User deleted successfully.",
              });
            }          
        } catch (error) {
          console.log(error)
          return res.status(501).send({
            responseCode: 501,
            responseMessage: "Something went wrong",
            error: error,
          })
        }
      },
    



};
