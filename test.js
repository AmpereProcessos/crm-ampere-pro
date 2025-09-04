
/**
 * @param {number[]} nums
 * @return {number}
 */
var removeDuplicates = function(nums) {
    const uniqueNumbers = new Set(nums)
    const uniqueNumbersArray = Array.from(uniqueNumbers)
    for (let i = 0; i < uniqueNumbersArray.length; i++) {
        nums[i] = uniqueNumbersArray[i]
    }

    return uniqueNumbersArray.length
};


var removeDuplicates2 = function(nums) {
    // [0,0,1,1,1,2,2,3,3,4]
    //  W R

    // 2 pointer system:
    // read and write: i = read starting at 1; read is i - 1 (j) and starts at 0;
    // if read is unique (not equal to write), change write to the value of read.

    let readIndex = 1; // j
    let writeIndex = 0; // i

    while (readIndex < nums.length) { // while i <= 5
        if (nums[readIndex] == nums[writeIndex]) {
            readIndex++;
        }
        else {
            writeIndex++;
            nums[writeIndex] = nums[readIndex]; 
            readIndex++;
        }
    }
    return writeIndex + 1;
};