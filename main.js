var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var lineArr = [];
var time = 10;
var screenWidth = canvas.width, screenHeight = canvas.height;
var xAreaOffset = 200, yAreaOffset = 200

function shuffleArray () {
    let length = Number(document.getElementById('array').value);
    if (length == 0) length = 20;
    lineArr = [];
    let lineWidth = (screenWidth - xAreaOffset)/length;
    let lineHeight = (screenHeight - yAreaOffset)/length;

    for(let i = 0; i<length; i++) {
        var num = Math.ceil((Math.random()*length));
        lineArr.push({
            id:     num,
            width:  lineWidth,
            height: num*lineHeight,
            xStart: lineWidth * i + xAreaOffset/2,
            yStart: screenHeight  - yAreaOffset/2,
            color: 'green'
        });
    }
}

function drawLine(xStart, yStart, width, height, color) {
    ctx.beginPath();
    ctx.moveTo(xStart,        yStart       );
    ctx.lineTo(xStart,        yStart-height);
    ctx.lineTo(xStart+width,  yStart-height);
    ctx.lineTo(xStart+width,  yStart       );
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    if (width > 2) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

function drawLines() {
    let indexes = [];
    for (let i = 0; i<lineArr.length; i++) {
        if (lineArr[i].color === 'green') {
            drawLine(   lineArr[i].xStart, 
                        lineArr[i].yStart, 
                        lineArr[i].width , 
                        lineArr[i].height, 
                        lineArr[i].color );
        }
        else indexes.push(i);
    }

    if (indexes.length !== 0) {
        for(let i = 0; i < indexes.length; i++) {
            drawLine(   lineArr[indexes[i]].xStart, 
                        lineArr[indexes[i]].yStart, 
                        lineArr[indexes[i]].width , 
                        lineArr[indexes[i]].height, 
                        lineArr[indexes[i]].color );
        }
    }

}

function draw() {
    ctx.clearRect(0, 0, screenWidth, screenHeight);
    drawLines();
    requestAnimationFrame(draw);
}

async function fancyPancyMove(iFirst, iSecond) {
    let dif = lineArr[iSecond].xStart - lineArr[iFirst].xStart;
    let xFirst = lineArr[iFirst].xStart, xSecond = lineArr[iSecond].xStart;
    let x = dif/10;

    do {
        lineArr[iFirst].xStart = Math.ceil((lineArr[iFirst].xStart + x) * 100) / 100;
        lineArr[iSecond].xStart = Math.ceil((lineArr[iSecond].xStart - x) * 100) / 100;
        await sleep(10);
    } while (Math.abs(lineArr[iFirst].xStart - lineArr[iSecond].xStart) < Math.abs(dif))

    lineArr[iSecond].xStart = xFirst;
    lineArr[iFirst].xStart = xSecond;
}

async function swap(iFirst, iSecond) {
    lineArr[iFirst].color = 'red';
    lineArr[iSecond].color = 'blue';
    await fancyPancyMove(iFirst, iSecond);
    let tempObj = {...lineArr[iFirst]};

    lineArr[iFirst].id = lineArr[iSecond].id;
    lineArr[iFirst].xStart = lineArr[iSecond].xStart;
    lineArr[iFirst].height = lineArr[iSecond].height;
    lineArr[iFirst].color = 'green';

    lineArr[iSecond].id = tempObj.id;
    lineArr[iSecond].xStart = tempObj.xStart;
    lineArr[iSecond].height = tempObj.height;
    lineArr[iSecond].color = 'green';
}

async function setPointer (i, color = 'red') {
    lineArr[i].color = color;
    await sleep(50);
}

function resetPointer (i) {
    lineArr[i].color = 'green';
}

async function bubbleSort() {
	for (let i = 0; i < lineArr.length; i++) {
		for (let j = 0; j < lineArr.length - i - 1; j++) {
            await setPointer(j);
			if (lineArr[j].id > lineArr[j + 1].id) 
                await swap(j, j+1)
            resetPointer(j);
		}
	}
}

async function insertionSort(start, end) {
	for (let i = start + 1, j = 0, tempObj; i <= end; i++) {
		tempObj = {...lineArr[i]};
		for (j = i - 1; j >= start && lineArr[j].id > tempObj.id; j--) {
            await swap(j, j + 1);
            await setPointer(i, 'yellow');
        }
        resetPointer(i);
	}
}

async function selectionSort() {
	let tempIndex;
	for (let i = 0; i < lineArr.length - 1; i++) {
		tempIndex = i;
		for (let j = i + 1; j < lineArr.length; j++) {
			if (lineArr[j].id < lineArr[tempIndex].id) {
				tempIndex = j;
			}
		}
        await swap(i, tempIndex);
	}
}

async function heapify(length, i)
{
	let root = i;
    let lChild = 2 * i + 1;
	let rChild = 2 * i + 2;

	do {
		i = root;
		if (lChild < length && lineArr[lChild].id > lineArr[root].id)
			root = lChild;

		if (rChild < length && lineArr[rChild].id > lineArr[root].id)
			root = rChild;

		if (root != i) {
            await swap(i, root);
			lChild = 2 * root + 1;
			rChild = 2 * root + 2;
		}
	} while (root != i);
}

async function heapSort() {
	for (let i = lineArr.length / 2 - 1; i >= 0; i--)
		await heapify(lineArr.length, i);
	for (let i = lineArr.length - 1; i > 0; i--) {
        await swap(0, i);
		await heapify(i, 0);
	}
}

async function partition(start, end) {
	let pivot = lineArr[end].id;
	let i = (start - 1);

	for (let j = start; j <= end - 1; j++)
	{
		if (lineArr[j].id < pivot)
		{
			i++;
            await swap(i, j);
		}
	}
	i++;
    await swap(i, end);
	return i;
}

async function quickSort(start, end) {
	if (start >= end) return;
	let divider = await partition(start, end);
    await setPointer(divider, 'yellow');
	await quickSort(start, divider - 1);
	await quickSort(divider + 1, end);
    resetPointer(divider);
}

function findObj (id) {
    for (let i = 0; i < lineArr.length; i++) {
        if (lineArr[i].id === id) return i
    }
}

async function merge(iLeft, iMiddle, iRight)
{
	let n1 = iMiddle - iLeft + 1;
	let n2 = iRight - iMiddle;

	let LeftArr = new Array(n1);
	let RightArr = new Array(n2);

	for (let i = 0; i < n1; i++) LeftArr[i] = {...lineArr[iLeft + i]};
	for (let j = 0; j < n2; j++) RightArr[j] = {...lineArr[iMiddle + 1 + j]};

	let i = 0, j = 0, k = iLeft;
    for (let m = iLeft; m <= iMiddle; m++) {
        await setPointer(m, 'blue');
    }

    for (let m = iMiddle + 1; m <= iRight; m++) {
        await setPointer(m, 'red');
    }

    await sleep(300);
	for (; i < n1 && j < n2; k++) {
		if (LeftArr[i].id <= RightArr[j].id) {
            lineArr[k].id = LeftArr[i].id
            lineArr[k].height = LeftArr[i].height
			i++;
		}
		else {
            lineArr[k].id = RightArr[j].id
            lineArr[k].height = RightArr[j].height
			j++;
		}
	}

	for (; i < n1; i++, k++) {
        lineArr[k].id = LeftArr[i].id
        lineArr[k].height = LeftArr[i].height
    }

	for (; j < n2; j++, k++) {
        lineArr[k].id = RightArr[j].id
        lineArr[k].height = RightArr[j].height
    }

    for (let m = iLeft; m <= iRight; m++) {
        resetPointer(m);
    }

    for (let m = iMiddle + 1; m <= iRight; m++) {
        resetPointer(m);
    }

    await sleep(300);
}

async function split(iMiddle) {
    let xSplit = xAreaOffset/(lineArr.length*10);
    for (let j = 0; j < 20; j++) {
        for(let i = iMiddle; i >= 0; i--) {
            lineArr[i].xStart -= xSplit;
        }
        await sleep (10);
    }
}

async function joint(iMiddle) {
    let xSplit = xAreaOffset/(lineArr.length*10);
    for (let j = 0; j < 20; j++) {
        for(let i = iMiddle; i >= 0; i--) {
            lineArr[i].xStart += xSplit;
        }
        await sleep (10);
    }
}

async function mergeSort(iLeft, iRight) {
	if (iLeft < iRight) {
		let iMiddle = parseInt((iLeft + iRight) / 2);
        await split(iMiddle);
        await sleep(100);
		await mergeSort(iLeft, iMiddle);
		await mergeSort(iMiddle + 1, iRight);

		await merge(iLeft, iMiddle, iRight);
        await joint(iMiddle);
	}
}

function minimum (a, b) {
	if (a < b) return a;
	return b;
}

async function timSort(n)
{
	let size, iLeft, iMiddle, iRight;
	const run = 32;
	for (let i = 0; i < n; i += run)
		await insertionSort(i, minimum((i + 31), (n - 1)));
	for (size = run; size < n; size = 2 * size)
	{
		for (iLeft = 0; iLeft < n; iLeft += 2 * size)
		{
			iMiddle = iLeft + size - 1;
			iRight = minimum((iLeft + 2 * size - 1), (n - 1));

			await merge(iLeft, iMiddle, iRight);
		}
	}
}

async function _heapify(length, i, start)
{
	let root = i;
	let lChild = 2 * i + 1 - start;
	let rChild = 2 * i + 2 - start;
	do {
		i = root;
		if (lChild < length && lineArr[lChild].id > lineArr[root].id)
			root = lChild;

		if (rChild < length && lineArr[rChild].id > lineArr[root].id)
			root = rChild;

		if (root != i) {
            await swap(i, root);
			lChild = 2 * root + 1 - start;
			rChild = 2 * root + 2 - start;
		}
	} while (root != i);
}

async function _heapSort(start, end) {
	let sum = start + end;
	for (let i = parseInt(Math.ceil(sum / 2.0)) - 1; i >= start; i--)
		await _heapify(end + 1, i, start);
	for (let i = end; i > start; i--) {
		await swap(i, start)
		await _heapify(i, start, start);
	}
}

async function introsort_imp(start, end, depth) {

	if (end - start < 16) {
		await insertionSort(start, end);
		return;
	}

	if (depth == 0) {
		await _heapSort(start, end);
		return;
	}

	let divider = await partition(start, end);
    await setPointer(divider, 'orange');
	await introsort_imp(start, divider - 1, depth - 1);
	await introsort_imp(divider + 1, end, depth - 1);
    resetPointer(divider);
}

function Introsort(length) {
	let depth = 2 * parseInt(Math.log2(length - 1));
	introsort_imp(0, length - 1, depth);
}

function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), ms)
    });
}

shuffleArray();
draw();
document.getElementById('bubble').addEventListener('click', bubbleSort);
document.getElementById('insertion').addEventListener('click', () => {
    insertionSort(0, lineArr.length - 1);
}, false);
document.getElementById('selection').addEventListener('click', selectionSort);
document.getElementById('heap').addEventListener('click', heapSort);
document.getElementById('quick').addEventListener('click', () => {
    quickSort(0, lineArr.length - 1);
}, false);
document.getElementById('merge').addEventListener('click', () => {
    mergeSort(0, lineArr.length - 1);
}, false);
document.getElementById('tim').addEventListener('click', () => {
    timSort(lineArr.length);
}, false);
document.getElementById('intro').addEventListener('click', () => {
    Introsort(lineArr.length);
}, false);
document.getElementById('shuffle').addEventListener('click', shuffleArray);
