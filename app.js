const isElementOutside = (parent, child) => {
  const parentRect = parent.getBoundingClientRect();
  const childRect = child.getBoundingClientRect();
  return (
    parentRect.top >= childRect.bottom || parentRect.bottom <= childRect.top
  );
};

const getBit = (p0, p1) => {
  const seed = Math.random();
  if (seed <= p0) return "0";
  if (seed <= p1 + p0) return "1";
  return " ";
};

const insertColumn = (container) => {
  const column = document.createElement("div");
  column.classList.add("column");
  container.appendChild(column);
  return column;
};

const removeColumn = (container, column) => {
  container.removeChild(column);
};

const disposeColumns = (container, count) =>
  Array.from(Array(count)).map(() => insertColumn(container));

const patchColumnCount = (columns, container, nextCount) => {
  const lastCount = columns.length;
  if (lastCount === nextCount) return columns;
  const countDelta = nextCount - lastCount;
  if (countDelta < 0) {
    return columns.filter((column, index) => {
      if (index < lastCount + countDelta) return true;
      removeColumn(container, columns[index]);
      return false;
    });
  }
  const newColumns = disposeColumns(container, countDelta);
  return [...columns, ...newColumns];
};

const runScene = (scene) => {
  const { container, columns, intervalDuration } = scene;
  scene.interval = setInterval(() => {
    columns.forEach((column) => {
      const firstBit = column.firstChild;
      const lastBit = column.lastChild;
      const bit = document.createElement("div");
      bit.innerText = getBit(scene.p0, scene.p1);
      if (!firstBit) {
        return column.appendChild(bit);
      }
      column.insertBefore(bit, firstBit);
      if (isElementOutside(container, lastBit)) {
        column.removeChild(lastBit);
      }
    });
  }, intervalDuration);
};

const scene = {
  interval: null,
  container: null,
  intervalDuration: 50,
  columns: [],
  columnCount: 50,
  p0: 0.3,
  p1: 0.3,
};

document
  .querySelector("#text-color-input")
  .addEventListener("change", (event) => {
    const { value } = event.target;
    scene.container.style.color = value;
  });

document
  .querySelector("#background-color-input")
  .addEventListener("change", (event) => {
    const { value } = event.target;
    scene.container.style.backgroundColor = value;
  });

document.querySelector("#speed-input").addEventListener("change", (event) => {
  const { value } = event.target;
  clearInterval(scene.interval);
  scene.intervalDuration = value;
  runScene(scene);
});

document
  .querySelector("#column-count-input")
  .addEventListener("change", (event) => {
    const value = Math.abs(event.target.value) > 100 ? 100 : event.target.value;
    event.target.value = Math.abs(value);
    clearInterval(scene.interval);
    setTimeout(() => {
      scene.columns = patchColumnCount(
        scene.columns,
        scene.container,
        parseInt(value, 10)
      );
      runScene(scene);
    }, 0);
  });

const p0Input = document.querySelector("#p0-input");
const p1Input = document.querySelector("#p1-input");
const makeUpdateP =
  (targetName, siblingName, targetInput, siblingInput) => (event) => {
    const value = Math.abs(event.target.value) > 1 ? 1 : event.target.value;
    const pTarget = Math.abs(value);
    targetInput.value = pTarget;
    scene[targetName] = pTarget;
    const pTargetDelta = 1 - pTarget;
    if (pTarget + scene[siblingName] > 1) {
      scene[siblingName] = pTargetDelta;
      siblingInput.value = pTargetDelta;
    }
    clearInterval(scene.interval);
    runScene(scene);
  };

p0Input.addEventListener("change", makeUpdateP("p0", "p1", p0Input, p1Input));
p1Input.addEventListener("change", makeUpdateP("p1", "p0", p1Input, p0Input));

scene.container = document.querySelector("#scene");
scene.columns = disposeColumns(scene.container, scene.columnCount);
runScene(scene);
