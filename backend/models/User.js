import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const userSchema = new mongoose.Schema(
  {
    userId: { type: Number, unique: true }, // <-- custom incremental ID
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contact: { type: String },
    resume: { type: String },
    profileImage: { type: String },
  },
  { timestamps: true }
);

// ✅ Auto-increment plugin
const AutoIncrement = AutoIncrementFactory(mongoose);
userSchema.plugin(AutoIncrement, { inc_field: "userId" });

export default mongoose.model("User", userSchema);
