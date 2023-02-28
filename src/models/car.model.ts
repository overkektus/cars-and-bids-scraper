import mongoose, { Schema } from "mongoose";

import { ICar, ThreadEvent } from "./car.interface";

const CarSchema: Schema = new Schema({
  url: { type: String, required: true },
  userId: { type: Number, require: true },
  carTitle: { type: String, require: true },
  lastEventId: { type: String }
});

export default mongoose.model<ICar>('Car', CarSchema);
