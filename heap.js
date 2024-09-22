export class BinaryHeap {
  constructor() {
    this.heap = [];
  }

  // Insert a new value and ensure heap property
  insert(value) {
    this.heap.push(value);
    this._bubbleUp();
  }

  // Return the size of the heap
  size() {
    return this.heap.length;
  }

  // Check if the heap is empty
  isEmpty() {
    return this.size() === 0;
  }

  // Bubble up the last inserted element to maintain max-heap property
  _bubbleUp() {
    let index = this.size() - 1;

    while (index > 0) {
      const element = this.heap[index];
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIndex];

      if (parent[0] >= element[0]) break; // Max-heap property is satisfied
      [this.heap[index], this.heap[parentIndex]] = [
        this.heap[parentIndex],
        this.heap[index],
      ];
      index = parentIndex;
    }
  }

  // Extract the max value (root) and maintain heap property
  extractMax() {
    if (this.isEmpty()) return null;

    const max = this.heap[0];
    const end = this.heap.pop();

    if (!this.isEmpty()) {
      this.heap[0] = end;
      this._sinkDown(0);
    }

    return max;
  }

  // Sink down the root element to maintain max-heap property
  _sinkDown(index) {
    const length = this.size();
    const element = this.heap[index];

    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let largest = index;

      if (left < length && this.heap[left][0] > this.heap[largest][0]) {
        largest = left;
      }

      if (right < length && this.heap[right][0] > this.heap[largest][0]) {
        largest = right;
      }

      if (largest === index) break; // Max-heap property is satisfied

      [this.heap[index], this.heap[largest]] = [
        this.heap[largest],
        this.heap[index],
      ];
      index = largest;
    }
  }
}
