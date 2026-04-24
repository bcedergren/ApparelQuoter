import mongoose, { Document, Schema } from 'mongoose';

export interface IDesignComment {
  _id?: mongoose.Schema.Types.ObjectId;
  text: string;
  authorId: mongoose.Schema.Types.ObjectId;
  authorName: string;
  createdAt: Date;
  position?: {
    x: number;
    y: number;
  };
  resolved: boolean;
  resolvedBy?: mongoose.Schema.Types.ObjectId;
  resolvedAt?: Date;
}

export interface IDesignVersion {
  _id?: mongoose.Schema.Types.ObjectId;
  versionNumber: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: mongoose.Schema.Types.ObjectId;
  uploadedAt: Date;
  isApproved: boolean;
  approvedBy?: mongoose.Schema.Types.ObjectId;
  approvedAt?: Date;
  notes?: string;
}

export interface IDesignPlacement {
  apparelImageUrl: string;
  areaId: 'front' | 'back' | 'left_sleeve' | 'right_sleeve';
  logoVersionId: mongoose.Schema.Types.ObjectId;
  position: {
    x: number; // normalized 0..1
    y: number; // normalized 0..1
  };
  widthInches: number;
  rotation: number; // degrees
}

export interface IDesign extends Document {
  companyId: mongoose.Schema.Types.ObjectId;
  customerId: mongoose.Schema.Types.ObjectId;
  quoteId?: mongoose.Schema.Types.ObjectId;
  title: string;
  description?: string;
  status: 'draft' | 'in_review' | 'approved' | 'rejected' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'apparel' | 'logo' | 'graphic' | 'layout' | 'other';
  tags: string[];
  versions: IDesignVersion[];
  comments: IDesignComment[];
  assignedTo?: mongoose.Schema.Types.ObjectId;
  dueDate?: Date;
  completedAt?: Date;
  createdBy: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  placement?: IDesignPlacement;
}

const DesignCommentSchema = new Schema<IDesignComment>({
  text: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  position: {
    x: { type: Number },
    y: { type: Number }
  },
  resolved: { type: Boolean, default: false },
  resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date }
});

const DesignVersionSchema = new Schema<IDesignVersion>({
  versionNumber: { type: String, required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt: { type: Date, default: Date.now },
  isApproved: { type: Boolean, default: false },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  notes: { type: String }
});

const DesignPlacementSchema = new Schema<IDesignPlacement>({
  apparelImageUrl: { type: String, required: true },
  areaId: {
    type: String,
    enum: ['front', 'back', 'left_sleeve', 'right_sleeve'],
    required: true
  },
  logoVersionId: { type: Schema.Types.ObjectId, required: true },
  position: {
    x: { type: Number, required: true, min: 0, max: 1 },
    y: { type: Number, required: true, min: 0, max: 1 }
  },
  widthInches: { type: Number, required: true, min: 0 },
  rotation: { type: Number, required: true }
});

const DesignSchema = new Schema<IDesign>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  quoteId: { type: Schema.Types.ObjectId, ref: 'Quotes' },
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['draft', 'in_review', 'approved', 'rejected', 'completed'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['apparel', 'logo', 'graphic', 'layout', 'other'],
    default: 'apparel'
  },
  tags: [{ type: String }],
  versions: { type: [DesignVersionSchema], default: [] },
  comments: { type: [DesignCommentSchema], default: [] },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  dueDate: { type: Date },
  completedAt: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  placement: { type: DesignPlacementSchema, required: false }
});

// Pre-save middleware
DesignSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Set completedAt when status changes to completed
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  next();
});

// Indexes for efficient queries
DesignSchema.index({ companyId: 1, status: 1 });
DesignSchema.index({ customerId: 1 });
DesignSchema.index({ quoteId: 1 });
DesignSchema.index({ assignedTo: 1 });
DesignSchema.index({ createdAt: -1 });

export default mongoose.models.Design || mongoose.model<IDesign>('Design', DesignSchema);
