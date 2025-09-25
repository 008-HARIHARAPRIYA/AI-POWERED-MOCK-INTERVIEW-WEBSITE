const covers = [
  "/images/companies/adobe.png",
  "/images/companies/cognizant.jpeg",
  "/images/companies/fleetstudio.png",
  "/images/companies/reddit.jpeg",
  "/images/companies/skype.jpeg",
  "/images/companies/zoho.png"
];

export default function getRandomInterviewCover() {
  return covers[Math.floor(Math.random() * covers.length)];
}
