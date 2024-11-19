import mongoose from "mongoose";
import Order from "../models/order.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import { generateOTP } from "../utility/otp.js";

export const addOrder = async (req, res) => {
    try {
        const {
            productId,
            noOfDays
        } = req.body

        await Order.create({
            product: productId,
            noOfDays,
            borrower: req.user._id
        })

        return res.status(200).json({
            success: true,
            message: "Requested successfully"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        })
    }
}

export const cancelProductRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.query;

        const deletedOrder = await Order.findOneAndDelete({
            borrower: userId,
            product: productId,
            status: 'requested' 
        });

        if (!deletedOrder) {
            return res.status(404).json({
                success: false,
                message: "No requested order found for the specified user and product"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Requested order has been cancelled successfully"
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        })
    }
}

export const acceptOrder = async (req, res) => {
    try {
        const { productId } = req.body; 
        if(!productId) {
            return res.status(400).json({
                success: false,
                error: "Invalid Product"
            })
        }

        const productOwner = await Product.findById(productId);
        
        if(productOwner == req.user._id) {
            return res.status(400).json({
                success: false,
                error : "Cannot buy your own product"
            })
        }

        //adding borrower in the product desc.
        await Product.findByIdAndUpdate(productId, { borrower: req.user._id})

        //change the status of order to accepted
        await Order.findOneAndUpdate(
            {
                product: productId,
                borrower: req.user._id, 
                status: "requested"
            },
            {
                status: "accepted",
                pickupOTP: generateOTP(),
            }
        );

        return res.status(200).json({
            success: true,
            message: "Successfully accepted order"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        })
    }
}

export const returnOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction(); 
    try {
        const { productId, returnOTP } = req.body; 
        if(!productId) {
            return res.status(400).json({
                success: false,
                error: "Invalid Product"
            })
        }

        const product = await Product.findById(productId).populate('category').session(session);
        
        if(product.owner == req.user._id) {
            return res.status(400).json({
                success: false,
                error : "Cannot return your own product"
            })
        }

        if(!product.category.isReturnable) {
            return res.status(400).json({
                success: false,
                error: "Non returnable item"
            })
        }

        const order = await Order.findOne({
            product: productId,
            borrower: req.user._id, 
            status: "inuse"
        }).session(session);

        if(order.returnOTP !== returnOTP) {
            return res.status(400).json({
                success: false,
                error: "Wrong return OTP"
            })
        }

        await Product.findByIdAndUpdate(productId, {
            borrower: null
        }).session(session);
        
        await Order.findByIdAndUpdate(order._id, {
            status: "returned"
        }).session(session);

        await session.commitTransaction();
        session.endSession();
        
        
        return res.status(200).json({
            success: true,
            message: "Successfully returned"
        })

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error)
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        })     
    }
}

export const closeOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { productId } = req.body;
        

        if(!productId) {
            return res.status(400).json({
                success: false,
                error: "Invalid Product"
            })
        }
        
        const product = await Product.findById(productId).populate("category").session(session);

        if(product.owner !== req.user._id) {
            return res.status(500).json({
                success: false,
                error: "Denied access to close order"
            })
        }

        if(!product.category.isReturnable) {
            return res.status(500).json({
                success: false,
                error: "Item is non returnable, it is automatically closed once ordered"
            })
        }

        await Order.findOneAndUpdate(
            {
                product: productId,
                status: { $ne: "closed"}
            },
            {
                status: "closed"
            }
        ).session(session);

        await session.commitTransaction();
        session.endSession();
        
        return res.status(200).json({
            success: true,
            message: "Successfully closed order"
        })
    } catch(error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        })
    }
}

export const orderHistoryOfProduct = async (req, res) => {
    try {
        const { productId } = req.body;

        if(!productId) {
            return res.status(400).json({
                success: false,
                error: "Invalid Product"
            })
        }

        const orders = await Order.find({
            product: productId,
            status: "closed"
        })
        .select('-pickupOTP -returnOTP -transactions')
        .populate('borrower');

         return res.status(200).json({
            success: true,
            orders
         })
    } catch (error) {
        console.log();
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        })
    }
}

export const pickupProduct = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { productId, pickupOTP } = req.body;
        if(!productId || !pickupOTP) {
            return res.status(200).json({
                success: false,
                error: "Invalid product or OTP"
            })
        }

        const order = await Order.findOne({
            product: productId,
            borrower: req.user._id,
            status: "accepted"
        }).session(session);

        if(pickupOTP !== order.pickupOTP) {
            return res.status(200).json({
                success: false,
                error: "Wrong OTP"
            })
        }

        await Order.findByIdAndUpdate(order._id, {
            status: "inuse",
            returnOTP: generateOTP(),
            pickupDate: Date.now()
        }).session(session)

        session.commitTransaction();
        session.endSession();
        
        return res.status(200).json({
            success: true,
            message: "Successfully picked up by user"
        })
    } catch(error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        })
    }
}