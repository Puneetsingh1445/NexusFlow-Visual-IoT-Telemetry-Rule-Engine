const evaluateCondition = (reading, condition) => {
  const { parameter, operator, value } = condition;

  const actualValue = reading[parameter];

  if (typeof actualValue !== "number") {
    return false;
  }

  switch (operator) {
    case "greater_than":
      return actualValue > value;

    case "less_than":
      return actualValue < value;

    case "equal_to":
      return actualValue === value;

    default:
      return false;
  }
};

export default evaluateCondition;