import express from "express";
import mongoose from "mongoose";
import Upvotes from "../models/Upvotes.js";
import { updateDailyProgress } from "../services/updateDailyProgress.js";
import User from "../models/User.js";
import { UpdateBadge } from "../services/badgeService.js";
import Product from "../models/Product.js";
import { notification } from "./notification.js";
const router = express.Router();

async function IncrementUserUpvoteCount(userId) {
    try {
        const FindUser = await User.findById(userId);
        if (FindUser) {
            FindUser.totalUpvotes += 1;
            await FindUser.save();
            await UpdateBadge(userId,'upvote');
            console.log("User upvote count incremented successfully",FindUser.totalUpvotes);
        }
    } catch (error) {
        console.error("Error incrementing user upvote count:", error);
    }
}
async function DecrementUserUpvoteCount(userId) {
    try {
        const FindUser = await User.findById(userId);
        if (FindUser) {
            FindUser.totalUpvotes -= 1;
            await FindUser.save();
            console.log("User upvote count decremented successfully",FindUser.totalUpvotes);
        }
    } catch (error) {
        console.error("Error decrementing user upvote count:", error);
    }
}    
router.post('/getproductupvotes',async(req,res)=>{
    try {
        const { productId } = req.body;
        const upvote = await Upvotes.findOne({ productId: productId });
        return res.status(200).json({
            message: "Product upvotes retrieved successfully",
            upvote
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error retrieving product upvotes",
            error: error.message
        });
    }
})
router.post('/upvote', async (req, res) => {
    try {
        const { userIds, productId } = req.body;
        const product = await Product.findById(productId)
        if (!userIds || !productId) {
            return res.status(400).json({
                message: "userIds and productId are required",
                received: { userIds, productId }
            });
        }
        const progress= await updateDailyProgress(userIds,"upvote")
        const userIdObj = new mongoose.Types.ObjectId(userIds);
        const productIdObj = new mongoose.Types.ObjectId(productId);
        
        
        if (progress.error) {
            return res.status(400).json({
                message: progress.error
            });
        }
        await IncrementUserUpvoteCount(userIds);
        // Find upvote document for this product
        let upvote = await Upvotes.findOne({ productId: productIdObj });
     
        if (upvote) {
            // If already upvoted
            const already = upvote.userIds.some(id => id.toString() === userIds);
            if (already) {
                return res.status(400).json({
                    message: "You have already upvoted this product"
                    
                });
            }

            // Add new user ID
            upvote.userIds.push(userIdObj);
            await upvote.save();
            // Update Product's upvotes array
            await Product.findByIdAndUpdate(productId, {
                $addToSet: { upvotes: userIdObj }
            });
            try {
                await notification(product.author_id, "You have received an upvote on your product", "upvote");
            } catch (notifError) {
                console.error("Error sending notification:", notifError);
            }
            return res.status(200).json({
                message: "Product upvoted successfully",
                upvote
            });
        }

        // Create new document
        const newUpvote = new Upvotes({
            productId: productIdObj,
            userIds: [userIdObj]
        });

        await newUpvote.save();

        // Update Product's upvotes array
        await Product.findByIdAndUpdate(productId, {
            $addToSet: { upvotes: userIdObj }
        });

        try {
            await notification(product.author_id, "You have received an upvote on your product", "upvote");
        } catch (notifError) {
            console.error("Error sending notification:", notifError);
        }

        return res.status(201).json({
            message: "Product upvoted successfully",
            upvote: newUpvote
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error processing upvote",
            error: error.message
        });
    }
});
router.get('/check-upvote', async (req, res) => {
    try {
        const { userIds, productId } = req.query; // Changed from req.body to req.query
        
        if (!userIds || !productId) {
            return res.status(400).json({
                message: "Missing required parameters",
                upvote: false
            });
        }

        const userIdObj = new mongoose.Types.ObjectId(userIds);
        const productIdObj = new mongoose.Types.ObjectId(productId);
        const upvote = await Upvotes.findOne({ productId: productIdObj });

        if (upvote) {
            const already = upvote.userIds.some(id => id.toString() === userIds);
            return res.status(200).json({
                message: already ? "You have already upvoted this product" : "User has not upvoted this product",
                upvote: already
            });
        }

        // If no upvote record exists for this product
        return res.status(200).json({
            message: "No upvotes for this product yet",
            upvote: false
        });

    } catch (error) {
        console.error('Error checking upvote:', error);
        return res.status(500).json({
            message: "Error checking upvote status",
            error: error.message,
            upvote: false
        });
    }
});
router.post('/remove-upvote', async (req, res) => {
    try {
        const { userIds, productId } = req.body;

        if (!userIds || !productId) {
            return res.status(400).json({
                message: "userIds and productId are required",
                received: { userIds, productId }
            });
        }

        const userIdObj = new mongoose.Types.ObjectId(userIds);
        const productIdObj = new mongoose.Types.ObjectId(productId);
        await DecrementUserUpvoteCount(userIds);
        // Find upvote document
        let upvote = await Upvotes.findOne({ productId: productIdObj });

        if (!upvote) {
            return res.status(404).json({ 
                message: "No upvotes found for this product" 
            });
        }

        // Check if user has upvoted
        const hasUpvoted = upvote.userIds.some(id => id.toString() === userIds);

        if (!hasUpvoted) {
            return res.status(400).json({
                message: "You have not upvoted this product"
            });
        }

        // Remove the user from the upvote array
        upvote.userIds = upvote.userIds.filter(id => id.toString() !== userIds);

        // Update Product's upvotes array
        await Product.findByIdAndUpdate(productId, {
            $pull: { upvotes: userIdObj }
        });

        // If after removing, the array is empty → delete the document
        if (upvote.userIds.length === 0) {
            await Upvotes.deleteOne({ productId: productIdObj });
            return res.status(200).json({
                message: "Upvote removed, no users left so document deleted"
            });
        }

        // Save updated document
        await upvote.save();

        return res.status(200).json({
            message: "Upvote removed successfully",
            upvote
        });

    } catch (error) {
        console.error("Remove upvote error:", error);
        return res.status(500).json({
            message: "Error removing upvote",
            error: error.message
        });
    }
});

export default router;