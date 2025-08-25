import mongoose from 'mongoose';
import 'dotenv/config';

export async function connectMongo() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(process.env.MONGO_URI, {
    autoIndex: true
  });
  console.log('✅ MongoDB connected');
}

const deviceStatusSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true, index: true },
   deviceType: { type: String, required: true }, 
  status:   { type: String, required: true },
  updatedAt:{ type: Date, default: Date.now }
});

export const DeviceStatus = mongoose.model('DeviceStatus', deviceStatusSchema);
