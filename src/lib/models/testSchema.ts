import { Schema, model, models } from "mongoose";

const testSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  questions: [{
    text: { type: String, required: true },
    answers: [{
      text: { type: String, required: true },
      isCorrect: { type: Boolean, default: false }
    }]
  }],
  creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

const Test = models.Test || model("Test", testSchema);
export default Test;