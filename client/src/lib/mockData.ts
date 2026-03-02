// Mock data for API Hub prototype
// Simulates the data that would come from a real backend

export interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  name: string;
  description: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  responseExample?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number; // monthly price in USD, 0 = free
  billingCycle: 'monthly' | 'yearly';
  requestLimit: number; // per month, -1 = unlimited
  features: string[];
  recommended?: boolean;
  ctaLabel: string;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  content: string;
  helpful: number;
}

export interface ApiProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  developer: string;
  developerAvatar?: string;
  logo: string;
  rating: number;
  reviewCount: number;
  subscriberCount: number;
  version: string;
  lastUpdated: string;
  baseUrl: string;
  tags: string[];
  endpoints: ApiEndpoint[];
  plans: PricingPlan[];
  reviews: Review[];
  features: { icon: string; title: string; description: string }[];
  useCases: { title: string; description: string }[];
  stats: { label: string; value: string }[];
}

export const sharePointApi: ApiProduct = {
  id: 'sharepoint-rest-api',
  name: 'SharePoint REST API',
  tagline: 'Enterprise-grade collaboration and content management for your applications',
  description: `The SharePoint REST API provides a comprehensive set of endpoints to interact with Microsoft SharePoint's powerful collaboration platform. Whether you need to manage documents, lists, users, or site permissions, this API gives you full programmatic access to SharePoint's capabilities.

Built on RESTful principles, it supports standard HTTP methods and returns JSON responses, making it easy to integrate with any modern application stack. The API is battle-tested in enterprise environments and supports OAuth 2.0 authentication for secure access.`,
  category: 'Team Collaboration',
  developer: 'yangfei',
  logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Microsoft_Office_SharePoint_%282019%E2%80%93present%29.svg/120px-Microsoft_Office_SharePoint_%282019%E2%80%93present%29.svg.png',
  rating: 4.7,
  reviewCount: 128,
  subscriberCount: 3500,
  version: '2.1.0',
  lastUpdated: '2026-01-15',
  baseUrl: 'https://api.hub.example.com/sharepoint/v2',
  tags: ['Microsoft', 'SharePoint', 'Collaboration', 'Enterprise', 'Document Management'],
  features: [
    {
      icon: '📁',
      title: 'Document Management',
      description: 'Full CRUD operations on SharePoint document libraries, folders, and files with version control support.'
    },
    {
      icon: '📋',
      title: 'List & Data Operations',
      description: 'Create, read, update, and delete SharePoint lists and list items with support for complex queries.'
    },
    {
      icon: '👥',
      title: 'User & Permission Management',
      description: 'Manage site users, groups, and role assignments programmatically for fine-grained access control.'
    },
    {
      icon: '🔍',
      title: 'Search & Query',
      description: 'Powerful search capabilities across SharePoint content with support for CAML queries and OData filters.'
    }
  ],
  useCases: [
    {
      title: 'Document Workflow Automation',
      description: 'Automate document approval workflows, trigger notifications on file changes, and sync content across systems.'
    },
    {
      title: 'Intranet Portal Integration',
      description: 'Build custom intranet portals that surface SharePoint content in your own branded interface.'
    },
    {
      title: 'Data Migration Tools',
      description: 'Migrate content between SharePoint sites or from legacy systems with full metadata preservation.'
    }
  ],
  stats: [
    { label: 'Uptime SLA', value: '99.9%' },
    { label: 'Avg Response', value: '120ms' },
    { label: 'API Calls/Day', value: '2.4M+' },
    { label: 'Active Users', value: '3,500+' }
  ],
  endpoints: [
    {
      id: 'get-site-info',
      method: 'GET',
      path: '/_api/web',
      name: 'Obtain the current website information',
      description: 'Returns detailed information about the current SharePoint site, including title, URL, and configuration.',
      params: [
        { name: '$select', type: 'string', required: false, description: 'Comma-separated list of properties to return' },
        { name: '$expand', type: 'string', required: false, description: 'Navigation properties to expand in the response' }
      ],
      responseExample: `{
  "d": {
    "Title": "Team Site",
    "Url": "https://contoso.sharepoint.com/sites/team",
    "ServerRelativeUrl": "/sites/team",
    "Created": "2024-01-15T08:00:00Z",
    "Language": 1033
  }
}`
    },
    {
      id: 'get-lists',
      method: 'GET',
      path: '/_api/web/lists',
      name: 'Obtain all the lists on the website',
      description: 'Returns all SharePoint lists in the current site, including document libraries and custom lists.',
      params: [
        { name: '$filter', type: 'string', required: false, description: 'OData filter expression (e.g., Hidden eq false)' },
        { name: '$top', type: 'integer', required: false, description: 'Maximum number of lists to return (default: 100)' }
      ],
      responseExample: `{
  "d": {
    "results": [
      {
        "Id": "a1b2c3d4-...",
        "Title": "Documents",
        "BaseType": 1,
        "ItemCount": 42
      }
    ]
  }
}`
    },
    {
      id: 'create-list',
      method: 'POST',
      path: '/_api/web/lists',
      name: 'Create a new list',
      description: 'Creates a new SharePoint list with the specified configuration.',
      params: [
        { name: 'Title', type: 'string', required: true, description: 'The display name of the new list' },
        { name: 'BaseTemplate', type: 'integer', required: true, description: 'List template ID (100=Generic, 101=DocumentLibrary)' },
        { name: 'Description', type: 'string', required: false, description: 'Optional description for the list' }
      ],
      responseExample: `{
  "d": {
    "Id": "new-list-guid",
    "Title": "My New List",
    "Created": "2026-02-27T10:00:00Z"
  }
}`
    },
    {
      id: 'get-list-items',
      method: 'GET',
      path: '/_api/web/lists/getbytitle(\'{listTitle}\')/items',
      name: 'Retrieve list items',
      description: 'Returns items from a specific SharePoint list with optional filtering and pagination.',
      params: [
        { name: 'listTitle', type: 'string', required: true, description: 'The title of the list to query' },
        { name: '$filter', type: 'string', required: false, description: 'OData filter expression' },
        { name: '$top', type: 'integer', required: false, description: 'Number of items to return per page' },
        { name: '$skip', type: 'integer', required: false, description: 'Number of items to skip for pagination' }
      ],
      responseExample: `{
  "d": {
    "results": [
      {
        "Id": 1,
        "Title": "Project Plan",
        "Modified": "2026-02-20T14:30:00Z",
        "Author": { "Title": "John Doe" }
      }
    ]
  }
}`
    },
    {
      id: 'create-list-item',
      method: 'POST',
      path: '/_api/web/lists/getbytitle(\'{listTitle}\')/items',
      name: 'Create list items',
      description: 'Creates a new item in the specified SharePoint list.',
      params: [
        { name: 'listTitle', type: 'string', required: true, description: 'The title of the target list' },
        { name: '__metadata', type: 'object', required: true, description: 'Type metadata for the list item' },
        { name: 'Title', type: 'string', required: true, description: 'The title of the new item' }
      ],
      responseExample: `{
  "d": {
    "Id": 42,
    "Title": "New Item",
    "Created": "2026-02-27T10:00:00Z"
  }
}`
    },
    {
      id: 'get-users',
      method: 'GET',
      path: '/_api/web/siteusers',
      name: 'Obtain website users',
      description: 'Returns all users who have access to the SharePoint site.',
      params: [
        { name: '$filter', type: 'string', required: false, description: 'Filter users by properties like IsSiteAdmin' },
        { name: '$select', type: 'string', required: false, description: 'Select specific user properties to return' }
      ],
      responseExample: `{
  "d": {
    "results": [
      {
        "Id": 1,
        "Title": "Jane Smith",
        "Email": "jane@contoso.com",
        "IsSiteAdmin": true
      }
    ]
  }
}`
    },
    {
      id: 'get-groups',
      method: 'GET',
      path: '/_api/web/sitegroups',
      name: 'Access the website group',
      description: 'Returns all SharePoint groups defined in the current site.',
      params: [],
      responseExample: `{
  "d": {
    "results": [
      {
        "Id": 3,
        "Title": "Team Site Members",
        "Description": "Members of this site",
        "OwnerTitle": "Team Site Owners"
      }
    ]
  }
}`
    },
    {
      id: 'get-role-assignments',
      method: 'GET',
      path: '/_api/web/roleassignments',
      name: 'Obtain role assignment',
      description: 'Returns all role assignments (permission grants) for the current site.',
      params: [
        { name: '$expand', type: 'string', required: false, description: 'Expand Member and RoleDefinitionBindings for full details' }
      ],
      responseExample: `{
  "d": {
    "results": [
      {
        "PrincipalId": 1,
        "RoleDefinitionBindings": {
          "results": [{ "Name": "Full Control", "Id": 1073741829 }]
        }
      }
    ]
  }
}`
    },
    {
      id: 'get-content-types',
      method: 'GET',
      path: '/_api/web/contenttypes',
      name: 'Obtain the content type',
      description: 'Returns all content types available in the current SharePoint site.',
      params: [
        { name: '$filter', type: 'string', required: false, description: 'Filter content types by properties' }
      ],
      responseExample: `{
  "d": {
    "results": [
      {
        "Id": { "StringValue": "0x01" },
        "Name": "Document",
        "Description": "Create a new document.",
        "Group": "Document Content Types"
      }
    ]
  }
}`
    }
  ],
  plans: [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      billingCycle: 'monthly',
      requestLimit: 1000,
      features: [
        '1,000 API calls / month',
        'Access to 3 core endpoints',
        'Community support',
        'Standard response time',
        'API documentation access'
      ],
      ctaLabel: 'Get Started Free'
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 29,
      billingCycle: 'monthly',
      requestLimit: 50000,
      features: [
        '50,000 API calls / month',
        'Access to all 9 endpoints',
        'Email support (48h response)',
        'Standard response time',
        'API documentation access',
        'Usage analytics dashboard'
      ],
      ctaLabel: 'Subscribe to Basic'
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 99,
      billingCycle: 'monthly',
      requestLimit: 500000,
      recommended: true,
      features: [
        '500,000 API calls / month',
        'Access to all 9 endpoints',
        'Priority support (4h response)',
        'Faster response time (<80ms)',
        'API documentation access',
        'Advanced usage analytics',
        'Webhook notifications',
        'Custom rate limit headers'
      ],
      ctaLabel: 'Subscribe to Pro'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: -1, // custom pricing
      billingCycle: 'monthly',
      requestLimit: -1,
      features: [
        'Unlimited API calls',
        'Access to all endpoints + beta',
        'Dedicated support manager',
        'SLA guarantee (99.9% uptime)',
        'Custom rate limits',
        'On-premise deployment option',
        'SSO & advanced security',
        'Custom contract & invoicing'
      ],
      ctaLabel: 'Contact Sales'
    }
  ],
  reviews: [
    {
      id: 'r1',
      author: 'Alex Chen',
      avatar: 'AC',
      rating: 5,
      date: '2026-02-10',
      content: 'Excellent API! The documentation is thorough and the response times are consistently fast. We integrated this into our intranet portal in just two days. The list operations work exactly as expected.',
      helpful: 24
    },
    {
      id: 'r2',
      author: 'Sarah Mitchell',
      avatar: 'SM',
      rating: 4,
      date: '2026-01-28',
      content: 'Very solid API for SharePoint integration. The OData filtering support is a huge plus for complex queries. Knocked off one star because the error messages could be more descriptive, but overall highly recommended.',
      helpful: 18
    },
    {
      id: 'r3',
      author: 'David Park',
      avatar: 'DP',
      rating: 5,
      date: '2026-01-15',
      content: 'We migrated from direct SharePoint SDK calls to this API and it was the right decision. Much cleaner, easier to maintain, and the Pro plan\'s priority support saved us during a critical production issue.',
      helpful: 31
    },
    {
      id: 'r4',
      author: 'Emma Rodriguez',
      avatar: 'ER',
      rating: 4,
      date: '2025-12-20',
      content: 'Good API with comprehensive coverage of SharePoint features. The free tier is generous enough to prototype with. Would love to see batch operations support in a future version.',
      helpful: 12
    }
  ]
};

export const allApis: Partial<ApiProduct>[] = [
  {
    id: 'sharepoint-rest-api',
    name: 'SharePoint',
    tagline: 'Microsoft SharePoint API provides an enterprise collaboration and content management platform.',
    category: 'Team Collaboration',
    developer: 'yangfei',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Microsoft_Office_SharePoint_%282019%E2%80%93present%29.svg/120px-Microsoft_Office_SharePoint_%282019%E2%80%93present%29.svg.png',
    rating: 4.7,
    subscriberCount: 3500,
    plans: [{ id: 'basic', name: 'Basic', price: 29, billingCycle: 'monthly', requestLimit: 50000, features: [], ctaLabel: '' }]
  },
  {
    id: 'gmail-api',
    name: 'Gmail',
    tagline: 'The Gmail API is a RESTful API that can be used to access Gmail mailboxes and send mail.',
    category: 'Productivity',
    developer: 'yangfei',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/120px-Gmail_icon_%282020%29.svg.png',
    rating: 4.7,
    subscriberCount: 2100,
    plans: [{ id: 'basic', name: 'Basic', price: 19, billingCycle: 'monthly', requestLimit: 50000, features: [], ctaLabel: '' }]
  },
  {
    id: 'outlook-calendar',
    name: 'Outlook Calendar',
    tagline: 'Microsoft Outlook Calendar API provides developers with powerful calendar management capabilities.',
    category: 'Productivity',
    developer: 'yangfei',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg/120px-Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg.png',
    rating: 4.6,
    subscriberCount: 1800,
    plans: [{ id: 'basic', name: 'Basic', price: 25, billingCycle: 'monthly', requestLimit: 50000, features: [], ctaLabel: '' }]
  },
  {
    id: 'google-gemini',
    name: 'Google Gemini',
    tagline: 'Gemini is a large artificial intelligence model released by Google that can run across platforms.',
    category: 'AI & Machine Learning',
    developer: 'yangfei',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Google_Gemini_logo.svg/120px-Google_Gemini_logo.svg.png',
    rating: 4.8,
    subscriberCount: 5200,
    plans: [{ id: 'basic', name: 'Basic', price: 49, billingCycle: 'monthly', requestLimit: 100000, features: [], ctaLabel: '' }]
  },
  {
    id: 'ollama-api',
    name: 'Ollama',
    tagline: 'Ollama is an open source tool for running large models (LLMs) directly on your local machine.',
    category: 'AI & Machine Learning',
    developer: 'yangfei',
    logo: 'https://avatars.githubusercontent.com/u/151674099?s=200&v=4',
    rating: 4.5,
    subscriberCount: 2800,
    plans: [{ id: 'free', name: 'Free', price: 0, billingCycle: 'monthly', requestLimit: 1000, features: [], ctaLabel: '' }]
  }
];
