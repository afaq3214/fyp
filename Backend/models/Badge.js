import mongoose from "mongoose";

const BadgeSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // machine key e.g. "first_task"
  name: { type: String, required: true },
  description: { type: String, default: "" },
  icon: { type: String, default: "" }, // url or icon name
  meta: { type: Object, default: {} }, // optional criteria info
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Badge", BadgeSchema);