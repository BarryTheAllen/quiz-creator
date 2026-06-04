import { Schema, model, models } from "mongoose";

const testSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  questions: [{
    id: { type: String },
    text: { type: String, default: "" },
    answers: [{
      id: { type: String },
      text: { type: String, default: "" },
      isCorrect: { type: Boolean, default: false }
    }]
  }],
  creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

const Test = models.Test || model("Test", testSchema);
export default Test;
