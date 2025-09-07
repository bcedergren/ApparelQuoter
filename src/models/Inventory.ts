import mongoose, { Document, Schema } from 'mongoose'

export interface IInventory extends Document {
  companyId: mongoose.Schema.Types.ObjectId
  itemName: string
  description?: string
  category: string
  quantity: number
  minimumStock: number
  unitPrice: number
  supplier?: string
  location?: string
  createdAt: Date
  updatedAt: Date
}

const InventorySchema = new Schema<IInventory>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  itemName: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  minimumStock: { type: Number, required: true, default: 0 },
  unitPrice: { type: Number, required: true },
  supplier: { type: String },
  location: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export default mongoose.models.Inventory ||
  mongoose.model<IInventory>('Inventory', InventorySchema)
