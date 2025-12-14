import Badge from '../models/Badge.js';
import User from '../models/User.js';
import Comments from '../models/Comments.js';
import { notification } from '../routes/notification.js';
import ActivityService from './activityService.js';
export async function UpdateBadge(UserId, category) {
    try {
        if (!UserId || !category) {
            throw new Error("Invalid parameters");
        }
          
        // REFETCH the user to get the updated totalUpvotes
        const user = await User.findById(UserId);
        console.log("Updating badge for user:", UserId, "Category:", category);
        console.log("Current totalUpvotes:", user.totalUpvotes); // Debug
        if (!user) throw new Error("User not found");
       
        // Handle UPVOTE badges
        if (category === 'upvote') {
            const totalUpvotes = user.totalUpvotes;

            if (totalUpvotes >= 5) {
                const badge = await Badge.findOne({ key: 'first5upvotes' });
                if (!badge) throw new Error("Badge not found");

                // Check if user already has badge
                const alreadyEarned = user.badges.some(b => 
                    b.badge === badge.key
                );

                if (!alreadyEarned) {
                    user.badges.push({
                        badge: badge.key,
                        awardedAt: new Date()
                    });
                    await user.save();
                    await notification(UserId, "You have received a badge for 5 upvoting products", "badge");
                    
                    // Log activity for badge earned
                    await ActivityService.logBadgeEarned(
                        UserId,
                        badge.name || '5 Upvotes Badge',
                        badge._id
                    );
                    
                    console.log("Badge awarded:", badge.key);
                }
            }
        }

        // Handle Comment badges
        if (category === 'comment') {
            const totalComments = await Comments.countDocuments({ userId: UserId });
            console.log("Total comments by user:", totalComments);
            
            if (totalComments >= 10) {
                const badge = await Badge.findOne({ key: 'first10comments' });
                if (!badge) throw new Error("Badge not found");
                
                const alreadyEarned = user.badges.some(b => 
                    b.badge === badge.key
                );
                
                if (!alreadyEarned) {
                    user.badges.push({
                        badge: badge.key,
                        awardedAt: new Date()
                    });
                    await user.save();
                    await notification(UserId, 'You Received a Badge for 10 comments', 'badge');
                    
                    // Log activity for badge earned
                    await ActivityService.logBadgeEarned(
                        UserId,
                        badge.name || '10 Comments Badge',
                        badge._id
                    );
                    
                    console.log("Badge awarded:", badge.key);
                }
            }
        }

        // Handle Login badge
        if (category === 'login') {
            const badge = await Badge.findOne({ key: 'firstLogin' });
            if (!badge) throw new Error("Badge not found");

            const alreadyEarned = user.badges.some(b => 
                b.badge === badge.key
            );
            
            if (!alreadyEarned) {
                user.badges.push({
                    badge: badge.key,
                    awardedAt: new Date()
                });
                await user.save();
                await notification(UserId, 'You Received a Badge for your first login!', 'badge');
                
                // Log activity for badge earned
                await ActivityService.logBadgeEarned(
                    UserId,
                    badge.name || 'First Login Badge',
                    badge._id
                );
                
                console.log("Badge awarded:", badge.key);
            }
        }

    } catch (error) {
        console.error("Error in UpdateBadge:", error.message);
    }
}
