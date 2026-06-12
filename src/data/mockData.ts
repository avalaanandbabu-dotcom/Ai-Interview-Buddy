export interface Course {
  id: string;
  title: string;
  platform: 'Coursera' | 'Udemy' | 'edX' | 'freeCodeCamp' | 'YouTube';
  rating: number;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  url: string;
  instructor: string;
}

export interface Question {
  id: string;
  category: string;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface CSModule {
  id: string;
  title: string;
  description: string;
  topics: {
    name: string;
    summary: string;
    codeSnippet?: string;
  }[];
  flashcards: {
    question: string;
    answer: string;
  }[];
}

export const COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Modern React & Redux Masterclass',
    platform: 'Udemy',
    rating: 4.8,
    duration: '32 hours',
    difficulty: 'Intermediate',
    url: 'https://udemy.com',
    instructor: 'Stephen Grider'
  },
  {
    id: 'c2',
    title: 'Algorithms & Data Structures Specialization',
    platform: 'Coursera',
    rating: 4.9,
    duration: '4 months',
    difficulty: 'Advanced',
    url: 'https://coursera.org',
    instructor: 'UC San Diego'
  },
  {
    id: 'c3',
    title: 'System Design for Tech Interviews',
    platform: 'YouTube',
    rating: 4.7,
    duration: '14 hours',
    difficulty: 'Advanced',
    url: 'https://youtube.com',
    instructor: 'ByteByteGo'
  },
  {
    id: 'c4',
    title: 'Machine Learning Masterclass with Python',
    platform: 'edX',
    rating: 4.8,
    duration: '8 weeks',
    difficulty: 'Intermediate',
    url: 'https://edx.org',
    instructor: 'Harvard University'
  },
  {
    id: 'c5',
    title: 'Kubernetes for Developers (CKAD)',
    platform: 'freeCodeCamp',
    rating: 4.6,
    duration: '6 hours',
    difficulty: 'Intermediate',
    url: 'https://freecodecamp.org',
    instructor: 'Nigel Poulton'
  }
];

export const MOCK_TESTS: Record<string, Question[]> = {
  aptitude: [
    {
      id: 'apt1',
      category: 'Aptitude',
      question: 'A train 120m long passes a telegraph post in 6 seconds. Find the speed of the train in km/h.',
      options: ['60 km/h', '72 km/h', '80 km/h', '90 km/h'],
      answer: '72 km/h',
      explanation: 'Speed = Distance / Time = 120m / 6s = 20 m/s. To convert to km/h, multiply by 18/5: 20 * 18/5 = 72 km/h.'
    },
    {
      id: 'apt2',
      category: 'Aptitude',
      question: 'If 15 men can complete a project in 20 days, how many days will 10 men take to complete the same project?',
      options: ['15 days', '25 days', '30 days', '35 days'],
      answer: '30 days',
      explanation: 'Man-days required = 15 * 20 = 300. Number of days for 10 men = 300 / 10 = 30 days.'
    }
  ],
  cs: [
    {
      id: 'cs1',
      category: 'Operating Systems',
      question: 'Which of the following scheduler selects processes from the queue and loads them into memory for execution?',
      options: ['Long-term scheduler', 'Short-term scheduler', 'Medium-term scheduler', 'Process coordinator'],
      answer: 'Long-term scheduler',
      explanation: 'The Long-term (or job) scheduler selects processes from the job pool and loads them into memory. The short-term scheduler (CPU scheduler) selects among the processes ready to execute and allocates the CPU.'
    },
    {
      id: 'cs2',
      category: 'DBMS',
      question: 'What is ACID in DBMS representing?',
      options: [
        'Atomicity, Consistency, Isolation, Durability',
        'Authentication, Concurrency, Integrity, Distribution',
        'Access, Control, Indexing, Delivery',
        'Algorithm, Compression, Iteration, Dependency'
      ],
      answer: 'Atomicity, Consistency, Isolation, Durability',
      explanation: 'ACID stands for Atomicity (all or nothing), Consistency (preserves database state), Isolation (independent transactions), and Durability (permanent changes).'
    }
  ],
  coding: [
    {
      id: 'cod1',
      category: 'Programming',
      question: 'What is the time complexity of searching in a balanced Binary Search Tree (BST)?',
      options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
      answer: 'O(log N)',
      explanation: 'Since the tree is balanced, each step discards half of the nodes, leading to a logarithmic search time complexity.'
    },
    {
      id: 'cod2',
      category: 'JavaScript',
      question: 'What will be the output of: console.log(typeof null)?',
      options: ['"null"', '"undefined"', '"object"', '"symbol"'],
      answer: '"object"',
      explanation: 'This is a historical bug in JavaScript where null is represented as an object reference. Changing it now would break backward compatibility.'
    }
  ]
};

export const CS_MODULES: CSModule[] = [
  {
    id: 'os',
    title: 'Operating Systems',
    description: 'Understand process scheduling, memory virtualization, deadlocks, and threads.',
    topics: [
      {
        name: 'Process vs. Thread',
        summary: 'A process is a self-contained execution environment with its own memory space. A thread is a lightweight unit of execution within a process, sharing the parent process\'s memory space.',
        codeSnippet: `// Thread creation concept in C
pthread_t thread_id;
pthread_create(&thread_id, NULL, worker_function, NULL);`
      },
      {
        name: 'Semaphores vs. Mutex',
        summary: 'A mutex (Mutual Exclusion) is a locking mechanism used to synchronize access to a resource (only one thread can lock/release). A semaphore is a signaling mechanism (counter-based) allowing a fixed number of threads to access a resource.'
      }
    ],
    flashcards: [
      {
        question: 'What is virtual memory?',
        answer: 'A memory management technique that uses secondary storage (like SSDs) to extend physical memory (RAM), allowing larger processes to run.'
      },
      {
        question: 'What is a deadlock?',
        answer: 'A situation where two or more processes are blocked forever, each waiting for a resource held by the other.'
      }
    ]
  },
  {
    id: 'dbms',
    title: 'Database Systems (DBMS)',
    description: 'Master SQL, indexes, transactions, normalization, and NoSQL databases.',
    topics: [
      {
        name: 'Indexes',
        summary: 'Indexes are data structures (like B+ Trees) that speed up data retrieval operations on a table at the cost of additional storage and slower writes (INSERT/UPDATE).',
        codeSnippet: `CREATE INDEX idx_user_email ON users(email);`
      },
      {
        name: 'Normalization (1NF, 2NF, 3NF)',
        summary: 'Normalization is the process of organizing data in a database to reduce redundancy and dependency. 1NF removes duplicate columns. 2NF removes partial dependencies. 3NF removes transitive dependencies.'
      }
    ],
    flashcards: [
      {
        question: 'What is a transaction?',
        answer: 'A single logical unit of database work that is completed in its entirety (Commit) or rolled back completely (Rollback).'
      },
      {
        question: 'What is a foreign key?',
        answer: 'A column or group of columns in one table that references the primary key of another table, enforcing referential integrity.'
      }
    ]
  },
  {
    id: 'ds',
    title: 'Data Science & ML',
    description: 'Core concepts of machine learning, NLP, probability, and generative AI models.',
    topics: [
      {
        name: 'Overfitting vs. Underfitting',
        summary: 'Overfitting occurs when a model learns the training data noise and fails to generalize to unseen data. Underfitting occurs when the model is too simple to learn the underlying patterns.',
        codeSnippet: `# Python Scikit-Learn regularization
from sklearn.linear_model import Ridge
model = Ridge(alpha=1.0) # alpha controls regularization strength`
      },
      {
        name: 'Generative Adversarial Networks (GANs)',
        summary: 'GANs consist of two neural networks: a Generator (which creates realistic fake data) and a Discriminator (which tries to distinguish fake data from real data) training in a competitive game.'
      }
    ],
    flashcards: [
      {
        question: 'What is the Central Limit Theorem?',
        answer: 'It states that the distribution of sample means approximates a normal distribution as the sample size becomes large, regardless of the population distribution.'
      },
      {
        question: 'What is a Vector Database?',
        answer: 'A specialized database designed to store and search high-dimensional vector embeddings, crucial for RAG pipelines and AI retrieval.'
      }
    ]
  }
];

export const CHAT_MENTOR_PRESETS = [
  { label: 'Explain Dijkstra\'s Algorithm', text: 'Can you explain Dijkstra\'s Algorithm with a simple example and its time complexity?' },
  { label: 'System Design: URL Shortener', text: 'How do I design a highly scalable URL Shortener like Bitly? What databases should I use?' },
  { label: 'Mock Coding Challenge', text: 'Give me a mock Coding interview problem (LeetCode style) on Arrays and walk me through the optimal solution.' },
  { label: 'ATS Resume Suggestions', text: 'What are the main keywords and structural guidelines to score 90+ on modern applicant tracking systems (ATS)?' }
];

export const MOCK_INTERVIEW_QUESTIONS: Record<string, string[]> = {
  technical: [
    "Welcome. Let's start with a technical question. Can you explain the difference between a process and a thread, and how they share resources?",
    "Excellent. Now, how does a balanced binary tree optimize search queries, and what is its worst-case search complexity?",
    "Great. In the context of database transactions, what does the ACID property guarantee, and why is Isolation important?",
    "Let's move on. Imagine you need to scale a service experiencing massive read traffic. What caching strategy would you implement and how would you handle cache eviction?"
  ],
  hr: [
    "Hello! Welcome to the HR interview. Tell me about yourself and why you are interested in joining our company.",
    "Interesting. Describe a situation where you had a major conflict with a team member. How did you resolve it?",
    "We value leadership and ownership. Tell me about a time you took the initiative on a project that wasn't explicitly assigned to you.",
    "Where do you see yourself in five years? How does this role align with your long-term career goals?"
  ],
  behavioral: [
    "Welcome. Let's look at behavioral patterns. Tell me about a time you failed to meet a project deadline. What did you learn?",
    "Describe a complex technical problem you solved under pressure. Walk me through your decision-making process.",
    "Tell me about a time you had to learn a completely new technology or domain very quickly to deliver a critical feature. How did you handle it?",
    "Have you ever had to compromise on quality to meet a release deadline? If so, how did you manage the technical debt?"
  ],
  system: [
    "Welcome. Let's do a System Design overview. How would you design a live chat application like Slack or Discord supporting millions of active users?",
    "Next, how would you design a scalable notification system capable of sending push, email, and SMS notifications with retry logic?",
    "Let's focus on storage. How do you choose between SQL and NoSQL for a service tracking financial transaction records vs user social feeds?",
    "Lastly, how would you ensure fault tolerance and geographic redundancy for a globally distributed media streaming platform?"
  ]
};

export const MOCK_INTERVIEW_FEEDBACK = {
  scores: {
    communication: 88,
    technical: 82,
    confidence: 90,
    problemSolving: 78,
    leadership: 85
  },
  readiness: 84,
  strengths: [
    "Exceptional clarity and structural pacing when explaining concepts.",
    "Strong understanding of thread synchronization and concurrency locks.",
    "Exhibited confident posture and clear vocal delivery."
  ],
  weaknesses: [
    "Struggled slightly when diving deep into cache invalidation corner cases.",
    "Could provide more concrete metrics (e.g., scale numbers) during behavioral stories."
  ],
  roadmap: [
    { title: "Day 1-3: Cache Invalidation Algorithms", desc: "Study Write-Through, Write-Back, and cache eviction policies (LRU, LFU)." },
    { title: "Day 4-6: STAR Method refinement", desc: "Practice framing behavioral questions using the Situation-Task-Action-Result format with quantifiable metrics." },
    { title: "Day 7+: Advanced System Design", desc: "Take a mock test on message brokers (Kafka) and WebSockets." }
  ]
};
