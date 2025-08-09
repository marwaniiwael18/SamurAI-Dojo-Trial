const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // AI Company Detection
  companyName: {
    type: String,
    maxlength: [255, 'Company name cannot exceed 255 characters']
  },
  companyIndustry: {
    type: String,
    maxlength: [100, 'Company industry cannot exceed 100 characters']
  },
  aiConfidence: {
    type: Number,
    min: [0, 'AI confidence must be between 0 and 1'],
    max: [1, 'AI confidence must be between 0 and 1'],
    default: 0
  },
  userConfirmed: {
    type: Boolean,
    default: false
  },
  
  // Profiling Wizard Data
  jobTitle: {
    type: String,
    maxlength: [200, 'Job title cannot exceed 200 characters']
  },
  department: {
    type: String,
    maxlength: [100, 'Department cannot exceed 100 characters']
  },
  seniorityLevel: {
    type: String,
    enum: {
      values: ['junior', 'mid', 'senior', 'executive', 'c-level'],
      message: 'Seniority level must be: junior, mid, senior, executive, or c-level'
    }
  },
  industry: {
    type: String,
    maxlength: [100, 'Industry cannot exceed 100 characters']
  },
  complianceRequirements: [{
    type: String,
    enum: {
      values: [
        'HIPAA', 'SOC2', 'GDPR', 'PCI DSS', 'ISO 27001', 'SOX', 'FedRAMP', 
        'NIST', 'CCPA', 'FISMA', 'COSO', 'COBIT', 'ITIL', 'None'
      ],
      message: 'Invalid compliance requirement'
    }
  }],
  securityFocus: {
    type: String,
    enum: {
      values: [
        'Application Security', 'Network Security', 'Cloud Security', 
        'Data Protection', 'Identity & Access Management', 'Compliance & Governance',
        'Incident Response', 'Security Architecture', 'DevSecOps', 'Risk Management'
      ],
      message: 'Invalid security focus area'
    }
  },
  budgetRange: {
    type: String,
    enum: {
      values: [
        'Under $10K', '$10K - $50K', '$50K - $100K', '$100K - $500K', 
        '$500K - $1M', 'Over $1M', 'Not specified'
      ],
      message: 'Invalid budget range'
    }
  },
  organizationSize: {
    type: String,
    enum: {
      values: [
        '1-10', '11-50', '51-200', '201-500', '501-1000', 
        '1001-5000', '5001-10000', '10000+', 'Not specified'
      ],
      message: 'Invalid organization size'
    }
  },
  
  // Additional profiling data
  biggestChallenge: {
    type: String,
    maxlength: [500, 'Biggest challenge cannot exceed 500 characters']
  },
  currentTools: [{
    name: String,
    category: String,
    satisfaction: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  securityMaturity: {
    type: String,
    enum: {
      values: ['Basic', 'Developing', 'Defined', 'Managed', 'Optimizing'],
      message: 'Invalid security maturity level'
    }
  },
  
  // Profile Completion (MANDATORY for workspace creation)
  profileCompleteness: {
    type: Number,
    min: [0, 'Profile completeness must be between 0 and 100'],
    max: [100, 'Profile completeness must be between 0 and 100'],
    default: 0
  },
  completedAt: {
    type: Date
  },
  
  // Profile completion tracking
  completedSections: {
    personalInfo: { type: Boolean, default: false },
    companyInfo: { type: Boolean, default: false },
    professionalInfo: { type: Boolean, default: false },
    industryCompliance: { type: Boolean, default: false },
    securityContext: { type: Boolean, default: false }
  },
  
  // AI recommendations and insights
  aiRecommendations: [{
    type: {
      type: String,
      enum: ['tool', 'framework', 'training', 'certification', 'practice']
    },
    title: String,
    description: String,
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    reasoning: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // User feedback on AI suggestions
  feedbackHistory: [{
    suggestionId: String,
    feedback: {
      type: String,
      enum: ['helpful', 'not_helpful', 'irrelevant', 'implemented']
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userProfileSchema.index({ userId: 1 });
userProfileSchema.index({ companyName: 1 });
userProfileSchema.index({ companyIndustry: 1 });
userProfileSchema.index({ industry: 1 });
userProfileSchema.index({ securityFocus: 1 });
userProfileSchema.index({ profileCompleteness: 1 });
userProfileSchema.index({ createdAt: 1 });

// Virtual for profile completion status
userProfileSchema.virtual('isProfileComplete').get(function() {
  return this.profileCompleteness >= 80;
});

// Virtual for completion percentage calculation
userProfileSchema.virtual('completionPercentage').get(function() {
  const sections = this.completedSections;
  const totalSections = Object.keys(sections).length;
  const completedCount = Object.values(sections).filter(Boolean).length;
  return Math.round((completedCount / totalSections) * 100);
});

// Pre-save middleware to calculate profile completeness
userProfileSchema.pre('save', function(next) {
  this.calculateCompleteness();
  next();
});

// Instance method to calculate profile completeness
userProfileSchema.methods.calculateCompleteness = function() {
  let score = 0;
  const weights = {
    companyName: 15,
    jobTitle: 15,
    department: 10,
    seniorityLevel: 10,
    industry: 15,
    complianceRequirements: 10,
    securityFocus: 15,
    organizationSize: 5,
    budgetRange: 5
  };
  
  // Calculate weighted score
  Object.keys(weights).forEach(field => {
    if (this[field] && (Array.isArray(this[field]) ? this[field].length > 0 : true)) {
      score += weights[field];
    }
  });
  
  this.profileCompleteness = score;
  
  // Update completed sections
  this.completedSections.personalInfo = !!(this.jobTitle && this.department && this.seniorityLevel);
  this.completedSections.companyInfo = !!(this.companyName && this.organizationSize);
  this.completedSections.professionalInfo = !!(this.jobTitle && this.seniorityLevel);
  this.completedSections.industryCompliance = !!(this.industry && this.complianceRequirements && this.complianceRequirements.length > 0);
  this.completedSections.securityContext = !!(this.securityFocus && this.budgetRange);
  
  // Set completion date if profile is complete
  if (this.profileCompleteness >= 80 && !this.completedAt) {
    this.completedAt = new Date();
  }
};

// Instance method to add AI recommendation
userProfileSchema.methods.addRecommendation = function(recommendation) {
  this.aiRecommendations.push({
    ...recommendation,
    createdAt: new Date()
  });
  return this.save();
};

// Instance method to add feedback
userProfileSchema.methods.addFeedback = function(suggestionId, feedback, comment) {
  this.feedbackHistory.push({
    suggestionId,
    feedback,
    comment,
    createdAt: new Date()
  });
  return this.save();
};

// Static method to get industry-specific job titles
userProfileSchema.statics.getJobTitlesByIndustry = function(industry) {
  const jobTitleMap = {
    'Technology': [
      'Security Engineer', 'Security Architect', 'CISO', 'Security Manager',
      'DevSecOps Engineer', 'Cybersecurity Analyst', 'Security Consultant',
      'Penetration Tester', 'Security Researcher', 'IT Security Specialist'
    ],
    'Healthcare': [
      'CISO', 'Security Manager', 'Compliance Officer', 'Privacy Officer',
      'Health Information Security Officer', 'Risk Manager', 'Security Analyst',
      'Healthcare IT Security Specialist'
    ],
    'Financial Services': [
      'CISO', 'Security Manager', 'Risk Manager', 'Compliance Officer',
      'Information Security Analyst', 'Fraud Prevention Specialist',
      'Financial Crime Analyst', 'Security Operations Manager'
    ],
    'Government': [
      'Information Systems Security Manager', 'Security Control Assessor',
      'Cybersecurity Specialist', 'IT Security Specialist', 'Security Analyst',
      'Risk Management Specialist', 'Compliance Officer'
    ]
  };
  
  return jobTitleMap[industry] || jobTitleMap['Technology'];
};

// Static method to get compliance requirements by industry
userProfileSchema.statics.getComplianceByIndustry = function(industry) {
  const complianceMap = {
    'Healthcare': ['HIPAA', 'SOC2', 'NIST'],
    'Financial Services': ['SOX', 'PCI DSS', 'SOC2', 'GDPR'],
    'Technology': ['SOC2', 'ISO 27001', 'GDPR'],
    'Government': ['FedRAMP', 'FISMA', 'NIST'],
    'Retail': ['PCI DSS', 'GDPR', 'CCPA'],
    'Education': ['FERPA', 'GDPR', 'SOC2']
  };
  
  return complianceMap[industry] || ['SOC2', 'ISO 27001'];
};

module.exports = mongoose.model('UserProfile', userProfileSchema);
