let items = [];  // Declare items as a global variable

function createInputFields() {
  const numItems = document.getElementById("numItems").value;
  const itemsContainer = document.getElementById("itemsContainer");
  itemsContainer.innerHTML = "";

  for (let i = 0; i < numItems; i++) {
    itemsContainer.innerHTML += `
      <label>Item ${i + 1} Value:</label>
      <input type="number" id="value${i}" required>
      <label>Item ${i + 1} Weight:</label>
      <input type="number" id="weight${i}" required>
      <br>
    `;
  }
}

function solveKnapsack() {
  const numItems = document.getElementById("numItems").value;
  const capacity = document.getElementById("capacity").value;
  items = [];  // Clear and initialize items array

  const stepsTable = document.getElementById("stepsTable");
  stepsTable.innerHTML = `
    <tr>
      <th>Step</th>
      <th>Node</th>
      <th>Weight</th>
      <th>Value</th>
      <th>Bound</th>
      <th>Decision</th>
    </tr>
  `;

  for (let i = 0; i < numItems; i++) {
    const value = parseInt(document.getElementById(`value${i}`).value);
    const weight = parseInt(document.getElementById(`weight${i}`).value);
    items.push({ value, weight, ratio: value / weight });
  }

  // Sort items by value-to-weight ratio
  items.sort((a, b) => b.ratio - a.ratio);

  let maxValue = 0;
  let steps = [];

  // Initialize priority queue
  const queue = [{ level: -1, value: 0, weight: 0, bound: bound(0, 0, 0), items: [] }];

  while (queue.length > 0) {
    const node = queue.shift();

    if (node.level === items.length - 1) continue;

    const level = node.level + 1;

    // Consider including item at current level
    const nextWeight = node.weight + items[level].weight;
    const nextValue = node.value + items[level].value;

    if (nextWeight <= capacity && nextValue > maxValue) {
      maxValue = nextValue;
    }

    const nextBound = bound(nextWeight, nextValue, level + 1);

    steps.push({
      step: steps.length + 1,
      node: `Include Item ${level + 1}`,
      weight: nextWeight,
      value: nextValue,
      bound: nextBound,
      decision: "Included",
    });

    if (nextBound > maxValue) {
      queue.push({ level, value: nextValue, weight: nextWeight, bound: nextBound, items: [...node.items, level] });
    }

    // Exclude item at current level
    const boundWithoutItem = bound(node.weight, node.value, level + 1);
    steps.push({
      step: steps.length + 1,
      node: `Exclude Item ${level + 1}`,
      weight: node.weight,
      value: node.value,
      bound: boundWithoutItem,
      decision: "Excluded",
    });

    if (boundWithoutItem > maxValue) {
      queue.push({ level, value: node.value, weight: node.weight, bound: boundWithoutItem, items: [...node.items] });
    }
  }

  displaySteps(steps);
}

function bound(weight, value, index) {
  let boundValue = value;
  let remainingCapacity = weight;
  for (let i = index; i < items.length; i++) {
    if (remainingCapacity >= items[i].weight) {
      boundValue += items[i].value;
      remainingCapacity -= items[i].weight;
    } else {
      boundValue += (remainingCapacity / items[i].weight) * items[i].value;
      break;
    }
  }
  return boundValue;
}

function displaySteps(steps) {
  const stepsTable = document.getElementById("stepsTable");
  steps.forEach((step) => {
    const row = stepsTable.insertRow();
    row.classList.add(step.decision === "Included" ? "step-included" : "step-excluded");
    Object.values(step).forEach((val) => {
      const cell = row.insertCell();
      cell.textContent = val;
    });
  });
}
