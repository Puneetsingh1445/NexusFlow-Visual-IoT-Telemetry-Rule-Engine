
import evaluateCondition from "./src/services/ruleEngine.js";

const reading = {
  temperature: 95,
};

// Test 1: Greater than
const test1 = evaluateCondition(reading, {
  parameter: "temperature",
  operator: "greater_than",
  value: 80,
});

// Test 2: Less than
const test2 = evaluateCondition(reading, {
  parameter: "temperature",
  operator: "less_than",
  value: 100,
});

// Test 3: Equal to
const test3 = evaluateCondition(reading, {
  parameter: "temperature",
  operator: "equal_to",
  value: 95,
});

console.log("Greater than 80:", test1);
console.log("Less than 100:", test2);
console.log("Equal to 95:", test3);
