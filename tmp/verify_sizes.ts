import { sortSizes, formatSize } from "../lib/sizes";

const testCases = [
    { input: ["L", "M", "S", "XL", "XXL"], expected: ["S", "M", "L", "XL", "2XL"] },
    { input: ["XXL", "S", "M", "L"], expected: ["S", "M", "L", "2XL"] },
    { input: ["3XL", "2XL", "XL", "L", "M", "S", "XS"], expected: ["XS", "S", "M", "L", "XL", "2XL", "3XL"] },
    { input: ["4 yrs (20)", "1.5-2 yrs (16)", "11-12 yrs (28)"], expected: ["1.5-2 yrs (16)", "4 yrs (20)", "11-12 yrs (28)"] },
    { input: ["XXL", "2XL", "XL"], expected: ["XL", "2XL", "2XL"] } // Note: formatSize should be used to unify these
];

console.log("Starting Size Utility Verification...");

testCases.forEach((tc, i) => {
    const formatted = tc.input.map(formatSize);
    const sorted = sortSizes(formatted);
    console.log(`Test Case ${i + 1}:`);
    console.log(`  Input:    [${tc.input.join(", ")}]`);
    console.log(`  Output:   [${sorted.join(", ")}]`);
});

console.log("Verification Complete.");
