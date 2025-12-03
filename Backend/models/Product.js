// models/Product.js
import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    // Basic info
    title: { type: String, required: true },
    pitch: { type: String, required: true},
    description: { type: String },
    category: { type: String },
    

    // Media & showcase
    media: [String],
    websiteUrl: String,
    demoUrl: String,
    repoUrl: String,
    // Submission & AI
    
    autoTags: [String],
  
    // Interaction & Community
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        rating: { type: Number, min: 1, max: 5 },
        emojiTags: [String],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    
    // AI moderation
    flagged: { type: Boolean, default: false },
    moderationNotes: String,

    // SEO
    slug: { type: String, unique: true, sparse: true }, // ← added `sparse: true`
   

    // Creator info
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    author_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    author_name: { type: String },
    author_profile: { type: String },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // System
   
  },
  { timestamps: true }
);

// ✅ Auto-generate slug before saving
productSchema.pre("save", async function (next) {
  if (!this.slug && this.title) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug uniqueness
    while (await mongoose.models.Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    this.slug = slug;
  }
  next();
});

export default mongoose.model("Product", productSchema);
