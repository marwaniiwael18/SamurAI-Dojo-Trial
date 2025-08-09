const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  // Basic company information
  name: {
    type: String,
    required: [true, 'Company name is required'],
    maxlength: [255, 'Company name cannot exceed 255 characters'],
    trim: true
  },
  domain: {
    type: String,
    required: [true, 'Company domain is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  alternativeDomains: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  
  // Industry classification
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    maxlength: [100, 'Industry cannot exceed 100 characters']
  },
  subIndustry: {
    type: String,
    maxlength: [100, 'Sub-industry cannot exceed 100 characters']
  },
  
  // Company details
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  website: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Website must be a valid URL'
    }
  },
  
  // Company size and metrics
  employeeCount: {
    range: {
      type: String,
      enum: [
        '1-10', '11-50', '51-200', '201-500', '501-1000', 
        '1001-5000', '5001-10000', '10000+', 'Unknown'
      ]
    },
    estimated: Number
  },
  
  // Location information
  headquarters: {
    country: String,
    state: String,
    city: String,
    address: String
  },
  
  // Financial information
  revenue: {
    range: {
      type: String,
      enum: [
        'Under $1M', '$1M-$10M', '$10M-$50M', '$50M-$100M', 
        '$100M-$500M', '$500M-$1B', 'Over $1B', 'Unknown'
      ]
    },
    estimated: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // AI Detection confidence and validation
  aiDetection: {
    confidence: {
      type: Number,
      min: [0, 'Confidence must be between 0 and 1'],
      max: [1, 'Confidence must be between 0 and 1'],
      default: 0
    },
    source: {
      type: String,
      enum: ['clearbit', 'manual', 'domain_analysis', 'user_input', 'ml_model'],
      default: 'domain_analysis'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  
  // Security and compliance context
  securityProfile: {
    commonFrameworks: [{
      type: String,
      enum: [
        'HIPAA', 'SOC2', 'GDPR', 'PCI DSS', 'ISO 27001', 'SOX', 'FedRAMP', 
        'NIST', 'CCPA', 'FISMA', 'COSO', 'COBIT', 'ITIL'
      ]
    }],
    securityMaturity: {
      type: String,
      enum: ['Basic', 'Developing', 'Defined', 'Managed', 'Optimizing']
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical']
    }
  },
  
  // Technology stack insights
  technologyStack: {
    cloudProviders: [String],
    securityTools: [String],
    programmingLanguages: [String],
    databases: [String]
  },
  
  // Company metrics and engagement
  metrics: {
    userCount: {
      type: Number,
      default: 0
    },
    workspaceCount: {
      type: Number,
      default: 0
    },
    lastUserActivity: Date,
    engagementScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  
  // External data sources
  externalData: {
    clearbit: {
      id: String,
      lastSync: Date,
      data: mongoose.Schema.Types.Mixed
    },
    linkedin: {
      id: String,
      url: String,
      followers: Number
    },
    crunchbase: {
      id: String,
      url: String,
      funding: mongoose.Schema.Types.Mixed
    }
  },
  
  // Status and flags
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  flags: {
    isStartup: { type: Boolean, default: false },
    isPublicCompany: { type: Boolean, default: false },
    isGovernment: { type: Boolean, default: false },
    isNonProfit: { type: Boolean, default: false }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
companySchema.index({ domain: 1 });
companySchema.index({ alternativeDomains: 1 });
companySchema.index({ industry: 1 });
companySchema.index({ 'employeeCount.range': 1 });
companySchema.index({ 'aiDetection.confidence': 1 });
companySchema.index({ 'aiDetection.verified': 1 });
companySchema.index({ isActive: 1, isVerified: 1 });
companySchema.index({ createdAt: 1 });

// Text search index
companySchema.index({
  name: 'text',
  description: 'text',
  industry: 'text'
});

// Virtual for all domains (primary + alternatives)
companySchema.virtual('allDomains').get(function() {
  return [this.domain, ...this.alternativeDomains];
});

// Virtual for company size category
companySchema.virtual('sizeCategory').get(function() {
  const range = this.employeeCount?.range;
  if (!range) return 'Unknown';
  
  if (['1-10', '11-50'].includes(range)) return 'Small';
  if (['51-200', '201-500'].includes(range)) return 'Medium';
  if (['501-1000', '1001-5000'].includes(range)) return 'Large';
  if (['5001-10000', '10000+'].includes(range)) return 'Enterprise';
  
  return 'Unknown';
});

// Static method to find company by domain
companySchema.statics.findByDomain = function(domain) {
  const searchDomain = domain.toLowerCase();
  return this.findOne({
    $or: [
      { domain: searchDomain },
      { alternativeDomains: { $in: [searchDomain] } }
    ],
    isActive: true
  });
};

// Static method to detect company from email domain
companySchema.statics.detectFromDomain = async function(domain) {
  const company = await this.findByDomain(domain);
  
  if (company) {
    return {
      found: true,
      company,
      confidence: company.aiDetection.confidence,
      source: 'database'
    };
  }
  
  // If not found, attempt AI detection
  return this.performAIDetection(domain);
};

// Static method to perform AI detection
companySchema.statics.performAIDetection = async function(domain) {
  // This would integrate with external APIs like Clearbit
  // For now, we'll implement basic domain analysis
  
  const domainParts = domain.split('.');
  const companyName = domainParts[0]
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Basic industry detection based on domain patterns
  const industryPatterns = {
    'Technology': ['tech', 'software', 'app', 'digital', 'cloud', 'ai', 'data'],
    'Healthcare': ['health', 'medical', 'pharma', 'bio', 'clinic', 'hospital'],
    'Financial Services': ['bank', 'finance', 'invest', 'capital', 'fund', 'credit'],
    'Education': ['edu', 'university', 'college', 'school', 'academy'],
    'Government': ['gov', 'mil', 'state', 'federal'],
    'Retail': ['shop', 'store', 'retail', 'commerce', 'market'],
    'Manufacturing': ['mfg', 'manufacturing', 'industrial', 'factory']
  };
  
  let detectedIndustry = 'Other';
  let confidence = 0.3; // Low confidence for basic detection
  
  for (const [industry, patterns] of Object.entries(industryPatterns)) {
    if (patterns.some(pattern => domain.includes(pattern))) {
      detectedIndustry = industry;
      confidence = 0.7;
      break;
    }
  }
  
  return {
    found: false,
    suggestion: {
      name: companyName,
      domain,
      industry: detectedIndustry,
      aiDetection: {
        confidence,
        source: 'domain_analysis'
      }
    },
    confidence,
    source: 'ai_detection'
  };
};

// Static method to get industry-specific recommendations
companySchema.statics.getIndustryRecommendations = function(industry) {
  const recommendations = {
    'Technology': {
      compliance: ['SOC2', 'ISO 27001', 'GDPR'],
      securityFocus: ['Application Security', 'Cloud Security', 'DevSecOps'],
      commonTools: ['SIEM', 'SOAR', 'Vulnerability Scanner', 'Code Analysis']
    },
    'Healthcare': {
      compliance: ['HIPAA', 'SOC2', 'NIST'],
      securityFocus: ['Data Protection', 'Privacy', 'Compliance & Governance'],
      commonTools: ['Encryption', 'Access Control', 'Audit Logging', 'DLP']
    },
    'Financial Services': {
      compliance: ['SOX', 'PCI DSS', 'SOC2', 'GDPR'],
      securityFocus: ['Risk Management', 'Fraud Prevention', 'Compliance'],
      commonTools: ['Fraud Detection', 'Transaction Monitoring', 'KYC/AML']
    },
    'Government': {
      compliance: ['FedRAMP', 'FISMA', 'NIST'],
      securityFocus: ['Risk Management', 'Compliance & Governance'],
      commonTools: ['SIEM', 'Compliance Management', 'Risk Assessment']
    }
  };
  
  return recommendations[industry] || recommendations['Technology'];
};

// Instance method to update AI confidence
companySchema.methods.updateAIConfidence = function(newConfidence, source = 'manual') {
  this.aiDetection.confidence = newConfidence;
  this.aiDetection.source = source;
  this.aiDetection.lastUpdated = new Date();
  return this.save();
};

// Instance method to verify company
companySchema.methods.verify = function() {
  this.isVerified = true;
  this.aiDetection.verified = true;
  return this.save();
};

// Instance method to update metrics
companySchema.methods.updateMetrics = async function() {
  const User = mongoose.model('User');
  const Workspace = mongoose.model('Workspace');
  
  const [userCount, workspaceCount] = await Promise.all([
    User.countDocuments({ emailDomain: this.domain, isActive: true }),
    Workspace.countDocuments({ domain: this.domain, isActive: true })
  ]);
  
  this.metrics.userCount = userCount;
  this.metrics.workspaceCount = workspaceCount;
  this.metrics.lastUserActivity = new Date();
  
  // Simple engagement score calculation
  this.metrics.engagementScore = Math.min(100, (userCount * 10) + (workspaceCount * 20));
  
  return this.save();
};

module.exports = mongoose.model('Company', companySchema);
