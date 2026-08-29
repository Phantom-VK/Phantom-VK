// The tech-stack groups previously encoded as 24 shields.io badges in
// README.md, now structured data for render-stack-svg.mjs.

const STACK_GROUPS = Object.freeze([
  Object.freeze({ label: "Languages", items: ["Python", "Java", "Kotlin"] }),
  Object.freeze({
    label: "AI & ML",
    items: ["TensorFlow", "Keras", "Scikit-learn", "Hugging Face", "LLMs", "LangGraph"],
  }),
  Object.freeze({
    label: "Backend & Frameworks",
    items: ["FastAPI", "Spring Boot", "Flask", "Apache Kafka"],
  }),
  Object.freeze({
    label: "Cloud & DevOps",
    items: ["AWS", "Docker", "GitHub Actions", "Linux"],
  }),
  Object.freeze({ label: "Databases", items: ["PostgreSQL", "MongoDB", "SQLite"] }),
  Object.freeze({ label: "Tools", items: ["Git", "Postman", "PyCharm", "IntelliJ IDEA"] }),
]);

export { STACK_GROUPS };
