import { BinaryHeap } from "./heap.js";

export class HuffmanCoder {
  /**
   * Convert the Huffman tree node into a string format
   * @param {Array} node - Huffman tree node
   * @returns {string} - Stringified node
   */
  stringify(node) {
    return typeof node[1] === "string"
      ? `'${node[1]}`
      : `0${this.stringify(node[1][0])}1${this.stringify(node[1][1])}`;
  }

  /**
   * Display the Huffman tree structure
   * @param {Array} node - Huffman tree node
   * @param {boolean} modify - Whether to modify the node structure for display
   * @param {number} index - Index of the current node in the tree
   * @returns {string} - Tree structure as a string
   */
  display(node, modify = false, index = 1) {
    if (modify) {
      node = ["", node];
      if (node[1].length === 1) {
        node[1] = node[1][0];
      }
    }

    if (typeof node[1] === "string") {
      return `${index} = ${node[1]}`;
    }

    const left = this.display(node[1][0], modify, index * 2);
    const right = this.display(node[1][1], modify, index * 2 + 1);
    return `${index * 2} <= ${index} => ${index * 2 + 1}\n${left}\n${right}`;
  }

  /**
   * Convert a string back into a Huffman tree node
   * @param {string} data - The stringified tree
   * @returns {Array} - Destringified node
   */
  destringify(data) {
    const node = [];
    if (data[this.ind] === "'") {
      this.ind++;
      node.push(data[this.ind++]);
      return node;
    }

    this.ind++;
    const left = this.destringify(data);
    node.push(left);
    this.ind++;
    const right = this.destringify(data);
    node.push(right);

    return node;
  }

  /**
   * Get the binary mappings of characters based on the Huffman tree
   * @param {Array} node - Huffman tree node
   * @param {string} path - Current binary path in the tree
   */
  getMappings(node, path = "") {
    if (typeof node[1] === "string") {
      this.mappings[node[1]] = path;
      return;
    }

    this.getMappings(node[1][0], `${path}0`);
    this.getMappings(node[1][1], `${path}1`);
  }

  /**
   * Encode the given data using Huffman encoding
   * @param {string} data - Input string to encode
   * @returns {[string, string, string]} - Encoded result, tree structure, and compression info
   */
  encode(data) {
    this.heap = new BinaryHeap();
    const frequencyMap = this.buildFrequencyMap(data);

    frequencyMap.forEach((frequency, char) => {
      this.heap.insert([-frequency, char]);
    });

    while (this.heap.size() > 1) {
      const node1 = this.heap.extractMax();
      const node2 = this.heap.extractMax();
      this.heap.insert([node1[0] + node2[0], [node1, node2]]);
    }

    const huffmanTree = this.heap.extractMax();
    this.mappings = {};
    this.getMappings(huffmanTree);

    const binaryString = this.convertToBinaryString(data);
    const [paddedBinaryString, rem] = this.addPadding(binaryString);
    const encodedResult = this.binaryStringToText(paddedBinaryString);
    const compressedData = `${this.stringify(
      huffmanTree
    )}\n${rem}\n${encodedResult}`;
    const compressionInfo = `Compression complete and file sent for download\nCompression Ratio: ${(
      data.length / compressedData.length
    ).toFixed(2)}`;

    return [compressedData, this.display(huffmanTree, false), compressionInfo];
  }

  /**
   * Decode the given Huffman encoded data
   * @param {string} data - Encoded data
   * @returns {[string, string, string]} - Decoded text, tree structure, and decompression info
   */
  decode(data) {
    const [treeString, padding, encodedText] = this.parseEncodedData(data);
    this.ind = 0;
    const huffmanTree = this.destringify(treeString);

    const binaryString = this.textToBinaryString(encodedText).slice(
      0,
      -parseInt(padding)
    );
    const decodedText = this.decodeBinaryString(binaryString, huffmanTree);

    return [
      decodedText,
      this.display(huffmanTree, true),
      "Decompression complete and file sent for download",
    ];
  }

  // Helper functions

  /**
   * Build a frequency map for the input data
   * @param {string} data - Input data
   * @returns {Map<string, number>} - Character frequency map
   */
  buildFrequencyMap(data) {
    const frequencyMap = new Map();
    for (const char of data) {
      frequencyMap.set(char, (frequencyMap.get(char) || 0) + 1);
    }
    return frequencyMap;
  }

  /**
   * Convert data to a binary string using the Huffman mappings
   * @param {string} data - Input data
   * @returns {string} - Binary string representation of the data
   */
  convertToBinaryString(data) {
    return data
      .split("")
      .map((char) => this.mappings[char])
      .join("");
  }

  /**
   * Add padding to the binary string to make its length a multiple of 8
   * @param {string} binaryString - Binary string
   * @returns {[string, number]} - Padded binary string and the number of padding bits
   */
  addPadding(binaryString) {
    const rem = (8 - (binaryString.length % 8)) % 8;
    return [binaryString + "0".repeat(rem), rem];
  }

  /**
   * Convert a binary string to its text representation
   * @param {string} binaryString - Binary string
   * @returns {string} - Text representation
   */
  binaryStringToText(binaryString) {
    return binaryString
      .match(/.{1,8}/g)
      .map((byte) => String.fromCharCode(parseInt(byte, 2)))
      .join("");
  }

  /**
   * Convert the encoded text back into a binary string
   * @param {string} text - Encoded text
   * @returns {string} - Binary string
   */
  textToBinaryString(text) {
    return [...text]
      .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
      .join("");
  }

  /**
   * Parse encoded data into tree, padding, and encoded text
   * @param {string} data - Encoded data
   * @returns {[string, string, string]} - Tree string, padding, and encoded text
   */
  parseEncodedData(data) {
    const lines = data.split("\n");
    return lines.length === 4
      ? [`${lines[0]}\n${lines[1]}`, lines[2], lines[3]]
      : [lines[0], lines[1], lines[2]];
  }

  /**
   * Decode a binary string using the Huffman tree
   * @param {string} binaryString - Binary string
   * @param {Array} huffmanTree - Huffman tree
   * @returns {string} - Decoded text
   */
  decodeBinaryString(binaryString, huffmanTree) {
    let decodedText = "";
    let node = huffmanTree;

    for (const bit of binaryString) {
      node = bit === "0" ? node[0] : node[1];
      if (typeof node[0] === "string") {
        decodedText += node[0];
        node = huffmanTree;
      }
    }

    return decodedText;
  }
}
