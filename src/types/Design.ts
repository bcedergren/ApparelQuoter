export interface Design {
  _id: string;
  companyId: string;
  customerId: string;
  quoteId?: string;
  title: string;
  description?: string;
  status: 'draft' | 'in_review' | 'approved' | 'rejected' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'apparel' | 'logo' | 'graphic' | 'layout' | 'other';
  tags: string[];
  versions: DesignVersion[];
  comments: DesignComment[];
  assignedTo?: string;
  dueDate?: Date;
  completedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DesignVersion {
  _id?: string;
  versionNumber: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
}

export interface DesignComment {
  _id?: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  position?: {
    x: number;
    y: number;
  };
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface CreateDesignRequest {
  customerId: string;
  quoteId?: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'apparel' | 'logo' | 'graphic' | 'layout' | 'other';
  tags: string[];
  assignedTo?: string;
  dueDate?: Date;
}

export interface UpdateDesignRequest {
  title?: string;
  description?: string;
  status?: 'draft' | 'in_review' | 'approved' | 'rejected' | 'completed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'apparel' | 'logo' | 'graphic' | 'layout' | 'other';
  tags?: string[];
  assignedTo?: string;
  dueDate?: Date;
}

export interface AddCommentRequest {
  text: string;
  position?: {
    x: number;
    y: number;
  };
}

export interface UploadVersionRequest {
  versionNumber: string;
  notes?: string;
}

export interface DesignFilter {
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
  customerId?: string;
  search?: string;
  tags?: string[];
}
