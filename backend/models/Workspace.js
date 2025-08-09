const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workspace name is required'],
    maxlength: [255, 'Workspace name cannot exceed 255 characters'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    trim: true
  },
  domain: {
    type: String,
    required: [true, 'Corporate domain is required'],
    lowercase: true,
    trim: true
  },
  
  // Workspace type
  type: {
    type: String,
    enum: {
      values: ['personal', 'team', 'enterprise'],
      message: 'Workspace type must be: personal, team, or enterprise'
    },
    default: 'personal'
  },
  
  // Workspace settings
  settings: {
    visibility: {
      type: String,
      enum: ['private', 'domain', 'public'],
      default: 'private'
    },
    allowInvites: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    maxMembers: {
      type: Number,
      default: 50
    }
  },
  
  // Creator and metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Workspace features and integrations
  features: {
    aiRecommendations: {
      type: Boolean,
      default: true
    },
    complianceTracking: {
      type: Boolean,
      default: true
    },
    collaborativeSearch: {
      type: Boolean,
      default: true
    },
    advancedAnalytics: {
      type: Boolean,
      default: false
    }
  },
  
  // Workspace statistics
  stats: {
    memberCount: {
      type: Number,
      default: 1
    },
    projectCount: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  
  // Workspace status
  isActive: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  },
  
  // Billing and subscription (for future use)
  subscription: {
    plan: {
      type: String,
      enum: ['trial', 'basic', 'professional', 'enterprise'],
      default: 'trial'
    },
    expiresAt: {
      type: Date
    },
    features: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
workspaceSchema.index({ createdBy: 1 });
workspaceSchema.index({ domain: 1 });
workspaceSchema.index({ type: 1 });
workspaceSchema.index({ 'settings.visibility': 1 });
workspaceSchema.index({ isActive: 1 });
workspaceSchema.index({ createdAt: 1 });

// Virtual for member count from workspace_members collection
workspaceSchema.virtual('members', {
  ref: 'WorkspaceMember',
  localField: '_id',
  foreignField: 'workspaceId'
});

// Pre-save middleware to update stats
workspaceSchema.pre('save', function(next) {
  if (this.isModified('isActive') && !this.isActive) {
    this.archivedAt = new Date();
    this.isArchived = true;
  }
  next();
});

// Instance method to add member count
workspaceSchema.methods.updateMemberCount = async function() {
  const WorkspaceMember = mongoose.model('WorkspaceMember');
  const count = await WorkspaceMember.countDocuments({ 
    workspaceId: this._id,
    isActive: true 
  });
  this.stats.memberCount = count;
  return this.save();
};

// Instance method to update last activity
workspaceSchema.methods.updateActivity = function() {
  this.stats.lastActivity = new Date();
  return this.save();
};

// Static method to find workspaces by domain
workspaceSchema.statics.findByDomain = function(domain) {
  return this.find({ 
    domain: domain.toLowerCase(),
    isActive: true,
    'settings.visibility': { $in: ['domain', 'public'] }
  });
};

module.exports = mongoose.model('Workspace', workspaceSchema);
