const mongoose = require('mongoose');

const workspaceMemberSchema = new mongoose.Schema({
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Role within workspace (creator IS the admin)
  role: {
    type: String,
    enum: {
      values: ['creator', 'admin', 'manager', 'member', 'viewer'],
      message: 'Role must be: creator, admin, manager, member, or viewer'
    },
    default: 'member'
  },
  
  // Granular permissions
  permissions: {
    // Workspace management
    manageWorkspace: { type: Boolean, default: false },
    deleteWorkspace: { type: Boolean, default: false },
    editWorkspaceSettings: { type: Boolean, default: false },
    
    // Member management
    inviteMembers: { type: Boolean, default: false },
    removeMembers: { type: Boolean, default: false },
    editMemberRoles: { type: Boolean, default: false },
    
    // Project management
    createProjects: { type: Boolean, default: true },
    editProjects: { type: Boolean, default: true },
    deleteProjects: { type: Boolean, default: false },
    manageProjectAccess: { type: Boolean, default: false },
    
    // Content and collaboration
    viewAllProjects: { type: Boolean, default: true },
    editAllProjects: { type: Boolean, default: false },
    collaborate: { type: Boolean, default: true },
    productSearch: { type: Boolean, default: true },
    
    // Advanced features
    labsAccess: { type: Boolean, default: true },
    advancedAnalytics: { type: Boolean, default: false },
    exportData: { type: Boolean, default: false },
    
    // AI and recommendations
    aiRecommendations: { type: Boolean, default: true },
    trainAI: { type: Boolean, default: false }
  },
  
  // Membership metadata
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  inviteToken: {
    type: String,
    select: false
  },
  inviteExpiresAt: {
    type: Date,
    select: false
  },
  
  // Status and activity
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'inactive'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  
  // Activity tracking
  activityStats: {
    projectsCreated: { type: Number, default: 0 },
    projectsEdited: { type: Number, default: 0 },
    searchesPerformed: { type: Number, default: 0 },
    collaborationEvents: { type: Number, default: 0 },
    lastLoginAt: { type: Date }
  },
  
  // Notification preferences
  notifications: {
    email: {
      invites: { type: Boolean, default: true },
      projectUpdates: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: true }
    },
    push: {
      mentions: { type: Boolean, default: true },
      projectUpdates: { type: Boolean, default: false }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes
workspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });
workspaceMemberSchema.index({ workspaceId: 1, role: 1 });
workspaceMemberSchema.index({ userId: 1, isActive: 1 });
workspaceMemberSchema.index({ inviteToken: 1 });
workspaceMemberSchema.index({ status: 1 });
workspaceMemberSchema.index({ createdAt: 1 });

// Virtual for user details
workspaceMemberSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for workspace details
workspaceMemberSchema.virtual('workspace', {
  ref: 'Workspace',
  localField: 'workspaceId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to set role-based permissions
workspaceMemberSchema.pre('save', function(next) {
  if (this.isModified('role') || this.isNew) {
    this.setRolePermissions();
  }
  next();
});

// Instance method to set permissions based on role
workspaceMemberSchema.methods.setRolePermissions = function() {
  const rolePermissions = {
    creator: {
      manageWorkspace: true,
      deleteWorkspace: true,
      editWorkspaceSettings: true,
      inviteMembers: true,
      removeMembers: true,
      editMemberRoles: true,
      createProjects: true,
      editProjects: true,
      deleteProjects: true,
      manageProjectAccess: true,
      viewAllProjects: true,
      editAllProjects: true,
      collaborate: true,
      productSearch: true,
      labsAccess: true,
      advancedAnalytics: true,
      exportData: true,
      aiRecommendations: true,
      trainAI: true
    },
    admin: {
      manageWorkspace: false,
      deleteWorkspace: false,
      editWorkspaceSettings: true,
      inviteMembers: true,
      removeMembers: true,
      editMemberRoles: true,
      createProjects: true,
      editProjects: true,
      deleteProjects: true,
      manageProjectAccess: true,
      viewAllProjects: true,
      editAllProjects: true,
      collaborate: true,
      productSearch: true,
      labsAccess: true,
      advancedAnalytics: true,
      exportData: true,
      aiRecommendations: true,
      trainAI: false
    },
    manager: {
      manageWorkspace: false,
      deleteWorkspace: false,
      editWorkspaceSettings: false,
      inviteMembers: true,
      removeMembers: false,
      editMemberRoles: false,
      createProjects: true,
      editProjects: true,
      deleteProjects: false,
      manageProjectAccess: true,
      viewAllProjects: true,
      editAllProjects: false,
      collaborate: true,
      productSearch: true,
      labsAccess: true,
      advancedAnalytics: false,
      exportData: false,
      aiRecommendations: true,
      trainAI: false
    },
    member: {
      manageWorkspace: false,
      deleteWorkspace: false,
      editWorkspaceSettings: false,
      inviteMembers: false,
      removeMembers: false,
      editMemberRoles: false,
      createProjects: true,
      editProjects: true,
      deleteProjects: false,
      manageProjectAccess: false,
      viewAllProjects: true,
      editAllProjects: false,
      collaborate: true,
      productSearch: true,
      labsAccess: true,
      advancedAnalytics: false,
      exportData: false,
      aiRecommendations: true,
      trainAI: false
    },
    viewer: {
      manageWorkspace: false,
      deleteWorkspace: false,
      editWorkspaceSettings: false,
      inviteMembers: false,
      removeMembers: false,
      editMemberRoles: false,
      createProjects: false,
      editProjects: false,
      deleteProjects: false,
      manageProjectAccess: false,
      viewAllProjects: true,
      editAllProjects: false,
      collaborate: false,
      productSearch: true,
      labsAccess: false,
      advancedAnalytics: false,
      exportData: false,
      aiRecommendations: true,
      trainAI: false
    }
  };
  
  if (rolePermissions[this.role]) {
    this.permissions = { ...this.permissions, ...rolePermissions[this.role] };
  }
};

// Instance method to check specific permission
workspaceMemberSchema.methods.hasPermission = function(permission) {
  return this.permissions[permission] === true;
};

// Instance method to update activity
workspaceMemberSchema.methods.updateActivity = function(activityType = null) {
  this.lastActiveAt = new Date();
  
  if (activityType && this.activityStats[activityType] !== undefined) {
    this.activityStats[activityType] += 1;
  }
  
  return this.save();
};

// Static method to find user's workspace memberships
workspaceMemberSchema.statics.findUserMemberships = function(userId, options = {}) {
  const query = { userId, isActive: true };
  
  if (options.role) {
    query.role = options.role;
  }
  
  return this.find(query)
    .populate('workspace')
    .sort({ createdAt: -1 });
};

// Static method to find workspace members
workspaceMemberSchema.statics.findWorkspaceMembers = function(workspaceId, options = {}) {
  const query = { workspaceId, isActive: true };
  
  if (options.role) {
    query.role = options.role;
  }
  
  return this.find(query)
    .populate('user', 'firstName lastName email avatar')
    .sort({ role: 1, createdAt: 1 });
};

// Static method to check if user can join workspace
workspaceMemberSchema.statics.canUserJoinWorkspace = async function(userId, workspaceId) {
  const User = mongoose.model('User');
  const Workspace = mongoose.model('Workspace');
  
  const [user, workspace, existingMembership] = await Promise.all([
    User.findById(userId),
    Workspace.findById(workspaceId),
    this.findOne({ userId, workspaceId })
  ]);
  
  if (!user || !workspace) {
    return { canJoin: false, reason: 'User or workspace not found' };
  }
  
  if (existingMembership) {
    return { canJoin: false, reason: 'User is already a member' };
  }
  
  // Check domain matching for team workspaces
  if (workspace.type === 'team' && user.emailDomain !== workspace.domain) {
    return { canJoin: false, reason: 'Email domain does not match workspace domain' };
  }
  
  // Check workspace member limit
  const memberCount = await this.countDocuments({ workspaceId, isActive: true });
  if (memberCount >= workspace.settings.maxMembers) {
    return { canJoin: false, reason: 'Workspace has reached member limit' };
  }
  
  return { canJoin: true };
};

module.exports = mongoose.model('WorkspaceMember', workspaceMemberSchema);
