/*
There is a large pile of socks that must be paired by color. Given an array of integers representing the color of each sock, determine how many pairs of socks with matching colors there are.

Example
n = 7
ar = [1, 2, 1, 2, 1, 3, 2]

There is one pair of color  and one of color . There are three odd socks left, one of each color. The number of pairs is .

Function Description

Complete the sockMerchant function in the editor below.

sockMerchant has the following parameter(s):

int n: the number of socks in the pile
int ar[n]: the colors of each sock
Returns

int: the number of pairs
Input Format

The first line contains an integer , the number of socks represented in .
The second line contains  space-separated integers, , the colors of the socks in the pile.

Constraints
1 <= n <= 100
1 <= ar[i] <= 100, where 0 <= i < n

Sample Input

STDIN                       Function
-----                       --------
9                           n = 9
10 20 20 10 10 30 50 10 20  ar = [10, 20, 20, 10, 10, 30, 50, 10, 20]

Sample Output
3

*/

/*
 * Complete the 'sockMerchant' function below.
 *
 * The function is expected to return an INTEGER.
 * The function accepts following parameters:
 *  1. INTEGER n
 *  2. INTEGER_ARRAY ar
 */

function sockMerchant(n, ar) {
    // Write your code here
    let counter = [];
    ar.sort();
    
    for (let i = 0; i < n; i++) {
        if (ar[i] === ar[i + 1]) {
            counter.push(...ar.splice(i, 1));
        }
    }
    counter.filter(element => element);
    console.log(counter);
    
    return counter.length;
}

n = 9;
ar = [10, 20, 20, 10, 10, 30, 50, 10, 20];

console.log(sockMerchant(n, ar));