// src/data/dummyInterviews.js

export const companyLogos = [
  "/images/companies/adobe.png",
  "/images/companies/cognizant.jpeg",
  "/images/companies/fleetstudio.png",
  "/images/companies/reddit.jpeg",
  "/images/companies/skype.jpeg",
  "/images/companies/zoho.png"
];

export const techLogos = {
  "React": "/images/techlogos/react.png",
  "ReactJS": "/images/techlogos/react.png",
  "react": "/images/techlogos/react.png",
  "Node.js": "/images/techlogos/nodejs.png",
  "Express": "/images/techlogos/express.jpg",
  "MongoDB": "/images/techlogos/mongodb.png",
  "TypeScript": "/images/techlogos/typescript.png",
  "Next.js": "/images/techlogos/nextjs.png",
  "Tailwind CSS": "/images/techlogos/tailwindcss.jpeg",
  "JavaScript": "/images/techlogos/javascript.jpg",
  "Python": "/images/techlogos/python.jpeg",
  


  // Add more mappings as needed
};

export const dummyInterviews = [
  {
    id: "1",
    userId: "user1",
    role: "Frontend Developer",
    type: "Technical",
    techstack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    level: "Junior",
    questions: ["What is React?"],
    finalized: false,
    createdAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "2",
    userId: "user2",
    role: "Backend Developer",
    type: "Technical",
    techstack: ["Node.js", "Express", "MongoDB"],
    level: "Mid",
    questions: ["Explain REST API."],
    finalized: true,
    createdAt: "2024-03-18T14:30:00Z",
  },
];
