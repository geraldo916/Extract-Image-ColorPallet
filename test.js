// Sample Uint8Array
const uint8Array = new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80]);

// Create a new Uint32Array with the appropriate length
const uint32Array = new Uint32Array(uint8Array.length / 4);

// Convert Uint8Array to Uint32Array
for (let i = 0; i < uint32Array.length; i++) {
  const startIndex = i * 4;
  // Use bitwise operations to combine the four Uint8Array elements into one Uint32Array element
  uint32Array[i] =
    (uint8Array[startIndex] << 24) |
    (uint8Array[startIndex + 1] << 16) |
    (uint8Array[startIndex + 2] << 8) |
    uint8Array[startIndex + 3];
}

console.log(uint32Array);
