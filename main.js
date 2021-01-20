var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var lineArr = [], lineWidth = 8;
var time = 10;

function shuffle () {
    let length = Number(document.getElementById('array').value);
    if (length == 0) length = 100;
    lineArr = [];
    for(let i = 0; i<length; i++) {
        var num = Math.ceil((Math.random()*length));
        while (lineArr.some(elem => elem === num)) num = Math.ceil((Math.random()*length));
        lineArr.push(num);
    }
}

var x = 0, y = 800;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let scale = y/lineArr.length;
    lineWidth = y/lineArr.length;
    for (let i = 0; i<lineArr.length; i++) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, 800-lineArr[i]*scale);
        ctx.lineTo(x+lineWidth, 800-lineArr[i]*scale);
        ctx.lineTo(x+lineWidth, y);
        ctx.closePath();
        ctx.fillStyle = 'green';
        ctx.fill();
        if (scale > 2) {
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        x+=lineWidth;
    }
    x=0;
    requestAnimationFrame(draw);
}

function drawSegment(currentSegment, segmentHeight, color) {
    if (time <= 0) return;
    ctx.beginPath();
    ctx.moveTo(currentSegment, y);
    ctx.lineTo(currentSegment, 800-segmentHeight);
    ctx.lineTo(currentSegment+lineWidth, 800-segmentHeight);
    ctx.lineTo(currentSegment+lineWidth, y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function increaseSpeed () {
    time /= 2;
    if (time < 10) time = 0;
}

function decreaseSpeed () {
    time *= 2;
    if (time === 0) time = 10;
}

async function bubbleSort() {
    let j = lineArr.length-1;
    async function sorting () {
        for (let i = 0; i<j; i++) {
            let tempNum = lineArr[i+1];
            drawSegment(i*8, lineArr[i]*8, 'blue')
            if (lineArr[i] > lineArr[i+1]) {
                drawSegment((i+1)*8, lineArr[i+1]*8, 'red')
                lineArr[i+1] = lineArr[i];
                lineArr[i] = tempNum;
            }
            await sleep(time);
        }
        j--;
        if (j>0) sorting();
        else return;
    }
    await sorting();
}

async function insertionSort() {
    for(let i = 1; i<lineArr.length; i++) {
        let tempNum = lineArr[i];
        let j = i-1;
        drawSegment(i*8, lineArr[i]*8, 'blue');
        while (j>=0 && lineArr[j] > tempNum) {
            await sleep(time/2)
            lineArr[j+1] = lineArr[j];
            lineArr[j] = tempNum
            drawSegment(i*8, lineArr[i]*8, 'blue');
            drawSegment(j*8, lineArr[j]*8, 'red');
            j -= 1;
            await sleep(time/2);
        }
        lineArr[j+1] = tempNum
        await sleep(time);
    }
}

function mergeSort() {
    let tempArr = [...lineArr];
    topDownSplitMerge(tempArr, 0, lineArr.length, lineArr)
    async function topDownSplitMerge(B, iBegin, iEnd, A) {
        if(iEnd - iBegin <= 1) return;
        let iMiddle = Math.floor((iEnd + iBegin) / 2);
        await topDownSplitMerge(A, iBegin, iMiddle, B);
        await topDownSplitMerge(A, iMiddle, iEnd, B);
        await topDownMerge(B, iBegin, iMiddle, iEnd, A);
    }
    async function topDownMerge(A, iBegin, iMiddle, iEnd, B) {
        let i = iBegin, j = iMiddle;
        await sleep(time);
        for(let k = iBegin; k < iEnd; k++) {
            if(i < iMiddle && (j >= iEnd || A[i] <= A[j])) {
                B[k] = A[i];
                i += 1;
            } else {
                B[k] = A[j];
                j += 1;
            }
        }
    }
}

function quickSort () {
    let tempNum;
    setup(lineArr, 0, lineArr.length-1);
    async function setup (A, lo, hi) {
        if (lo < hi) {
            p = await partition(A, lo, hi);
            await setup(A, lo, p),
            await setup(A, p+1, hi)
        }
    }
    async function partition (A, lo, hi) {
        pivot = A[Math.floor((hi + lo) / 2)]
        let i = lo - 1;
        let j = hi + 1;
        while (true) {
            do {
                i += 1;
            } while (A[i] < pivot)
            do {
                j -= 1;
            } while (A[j] > pivot)
            if (i >= j) return j;
            await sleep(time);
            tempNum = A[i];
            A[i] = A[j];
            A[j] = tempNum;
        } 
    }
}

async function selectionSort () {
    let tempNum, tempIndex;
    for (let i = 0; i<lineArr.length-1; i++) {
        tempNum = lineArr[i];
        tempIndex = i;
        for (let j = i+1; j<lineArr.length; j++) {
            if (lineArr[j] < tempNum) {
                tempNum = lineArr[j];
                tempIndex = j;
            }
        }
        tempNum = lineArr[i];
        lineArr[i] = lineArr[tempIndex];
        lineArr[tempIndex] = tempNum;
        await sleep(time);
    }
}

async function heapSort(A, count) {
    const iParent = i => Math.floor((i-1)/2);
    const iLeftChild = i => 2*i + 1;
    function change (A, i, j) {
        let tempNum = A[i];
        A[i] = A[j]
        A[j] = tempNum;
    }

    await setup(A, count);

    async function setup (A, count) {
        await heapify(A, count)
        let end = count - 1;
        while (end > 0) {
            change(A, end, 0);
            end -= 1;
            await siftDown(A, 0, end);
        }
    }
    
    async function heapify(A, count) {
        let start = iParent(count-1);
        while (start >= 0) {
            await siftDown(A, start, count-1);
            start = start - 1;
        }
    }

    async function siftDown (A, start, end) {
        let root = start, child, swap;
        
        while (iLeftChild(root) <= end) {
            child = iLeftChild(root);
            swap = root
            if (A[swap] < A[child]) swap = child;

            if (child+1 <= end && A[swap] < A[child+1]) swap = child+1;

            if (swap === root) return;
            else {
                change(A, root, swap);
                root = swap;
            }
            await sleep(time);
        }
    }
}

function sleep(ms) {
    if (ms <= 0) return;
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), ms)
    });
}

myReq = requestAnimationFrame(draw);
window.onload=function() {
    shuffle();
    document.getElementById('bubble').addEventListener('click', bubbleSort);
    document.getElementById('insertion').addEventListener('click', insertionSort);
    document.getElementById('merge').addEventListener('click', mergeSort);
    document.getElementById('quick').addEventListener('click', quickSort);
    document.getElementById('selection').addEventListener('click', selectionSort);
    document.getElementById('heap').addEventListener('click', () => heapSort(lineArr, lineArr.length));
    document.getElementById('increase').addEventListener('click', increaseSpeed);
    document.getElementById('decrease').addEventListener('click', decreaseSpeed);
    document.getElementById('shuffle').addEventListener('click', shuffle);
}