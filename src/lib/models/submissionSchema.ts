import { Schema, model, models } from "mongoose";

const submissionSchema = new Schema(
  {
    test: { type: Schema.Types.ObjectId, ref: "Test", required: true },
    studentName: { type: String, required: true },
    answers: [
      {
        questionIndex: { type: Number, required: true },
        selectedOptionIndex: { type: Number, required: true },
      },
    ],
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    grade: { type: Number, required: true },
  },
  { timestamps: true }
);

const Submission = models.Submission || model("Submission", submissionSchema);

export default Submission;
