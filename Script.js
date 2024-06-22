let matrix = [];
let unchangedMatrix = [];
let rowCount = 0;
let colCount = 0;
let canvas = document.getElementById("visualizationCanvas");
let ctx = canvas.getContext("2d");
var cellHeight;
var cellWidth;
var colorVal = 1;

function createInputArea() {
    rowCount = parseInt(document.getElementById('rowCount').value);
    colCount = parseInt(document.getElementById('colCount').value);
    var response = document.getElementById('dimensionInput');
    var inputGrid = document.getElementById('inputGrid');
    inputGrid.innerHTML = ""; // Clear previous inputs

    // Make sure inputted Dimensions are in range
    if (rowCount > 0 && colCount > 0 && rowCount < 11 && colCount < 11) {
        response.style.backgroundColor = "#AFF8BD";
        inputGrid.style.gridTemplateColumns = `repeat(${colCount}, auto)`; // Dynamically set grid columns
        inputGrid.style.setProperty('--col-count', colCount);
        for (var i = 0; i < rowCount; i++) {
            for (var j = 0; j < colCount; j++) {
                var input = document.createElement('input');
                input.className = "matrixInput"; // Corrected attribute name
                input.type = "number";
                input.value = 0;
                input.min = 0;
                input.max = 100;
                input.id = "idx" + i + j;
                input.oninput = updateMatrix;
                input.addEventListener('input', validateInput); // Add event listener for input validation
                inputGrid.appendChild(input);
            }
        }
        updateMatrix(); // Update the matrix after creating inputs
    } else {
        response.style.backgroundColor = "#FFABAB";
    }
}

// Function to validate input values
function validateInput(event) {
    var input = event.target;
    var value = parseInt(input.value);
    if (isNaN(value) || value < 0) {
        input.value = 0; // Set value to 0 if less than 0 or NaN
    } else if (value > 100) {
        input.value = 100; // Set value to 100 if greater than 100
    }
}
function updateMatrix() {
    matrix = [];
    for (var i = 0; i < rowCount; i++) {
        matrix[i] = [];
        for (var j = 0; j < colCount; j++) {
            var input = document.getElementById("idx" + i + j);
            matrix[i][j] = parseInt(input.value);
        }
    }
    unchangedMatrix = matrix;

    // Calculate cell width and height based on canvas size and matrix dimensions
    cellWidth = canvas.width / colCount;
    cellHeight = canvas.height / rowCount;

    updateVisualization();
}

function randomMatrix() {
    for (var i = 0; i < rowCount; i++) {
        for (var j = 0; j < colCount; j++) {
            var input = document.getElementById("idx" + i + j);
            input.value = Math.floor(Math.random() * 101); // Generate a random value between 0 and 100
        }
    }
    updateMatrix(); // Update the matrix after filling it with random values
}

function invertMatrix() {
    if (matrix.length > 0) {
        if (rowCount == colCount) {
            // Create an identity matrix of the same size as the original matrix
            var identityMatrix = [];
            for (var i = 0; i < rowCount; i++) {
                identityMatrix[i] = [];
                for (var j = 0; j < colCount; j++) {
                    identityMatrix[i][j] = (i === j) ? 1 : 0;
                }
            }

            // Perform Gauss-Jordan elimination to find the inverse
            for (var pivot = 0; pivot < rowCount; pivot++) {
                var pivotValue = matrix[pivot][pivot];
                for (var j = 0; j < colCount; j++) {
                    matrix[pivot][j] /= pivotValue;
                    identityMatrix[pivot][j] /= pivotValue;
                }
                for (var i = 0; i < rowCount; i++) {
                    if (i !== pivot) {
                        var scale = matrix[i][pivot];
                        for (var j = 0; j < colCount; j++) {
                            matrix[i][j] -= scale * matrix[pivot][j];
                            identityMatrix[i][j] -= (scale * identityMatrix[pivot][j]) % 255;
                        }
                    }
                }
            }

            // Update the matrix with its inverse
            matrix = identityMatrix;
            updateVisualization();
        } else { 
            alert("Non-Square Matrices don't have an Inverse!"); 
        }
    } else { 
        alert("You need to make a Matrix First!"); 
    }
}

function scaleMatrix() {
    let sx = document.getElementById('scaleX').value;
    let sy = document.getElementById('scaleY').value;
    if (matrix.length > 0) {
        // Apply scaling transformation to the matrix
        var scaledMatrix = [];
        for (var i = 0; i < rowCount; i++) {
            scaledMatrix[i] = [];
            for (var j = 0; j < colCount; j++) {
                scaledMatrix[i][j] = unchangedMatrix[i][j] * sx * sy;
            }
        }
        // Update the matrix with the scaled matrix
        matrix = scaledMatrix;
        updateVisualization();
    } else {  alert("You need to make a Matrix First!");  }
}

function updateRotation() {
    matrix = unchangedMatrix;
    var rotationInput = document.getElementById("rotationSlider").value;
    document.getElementById("rotationVal").innerHTML = rotationInput + "°";

    // Calculate the center of rotation (assuming center of canvas)
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;

    // Convert degrees to radians
    var angleInRadians = (rotationInput * Math.PI) / 180;

    // Update the matrix based on rotation
    var rotatedMatrix = [];
    for (var i = 0; i < rowCount; i++) {
        rotatedMatrix[i] = [];
        for (var j = 0; j < colCount; j++) {
            // Calculate the rotated coordinates relative to the center of rotation
            var x = (j + 0.5) * cellWidth - centerX;
            var y = (i + 0.5) * cellHeight - centerY;
            var rotatedX = x * Math.cos(angleInRadians) - y * Math.sin(angleInRadians);
            var rotatedY = x * Math.sin(angleInRadians) + y * Math.cos(angleInRadians);

            // Map the rotated coordinates to the matrix cells
            var rowIndex = Math.floor(rotatedY / cellHeight + rowCount / 2);
            var colIndex = Math.floor(rotatedX / cellWidth + colCount / 2);
            if (rowIndex >= 0 && rowIndex < rowCount && colIndex >= 0 && colIndex < colCount) {
                rotatedMatrix[i][j] = matrix[rowIndex][colIndex];
            } else {
                rotatedMatrix[i][j] = 0; // If the coordinates fall outside the matrix, set to 0
            }
        }
    }

    // Update the matrix with the rotated matrix
    matrix = rotatedMatrix;
    updateVisualization();
}

function updateReflection(val) {
    matrix = unchangedMatrix;
    reflection = val;
    // If reflection = 0, then "No Reflection" is Selected.
    if (reflection !== 0 && matrix.length > 0) {
        // Reflect Matrix - Logic to reflect the matrix
        var reflectedMatrix = [];
        var rows = matrix.length;
        var cols = matrix[0].length;

        for (var i = 0; i < rows; i++) {
            reflectedMatrix[i] = [];
            for (var j = 0; j < cols; j++) {
                var reflectedRowIndex = (reflection === 1) ? (rows - 1 - i) : i; // Reflect across X-axis
                var reflectedColIndex = (reflection === 2) ? (cols - 1 - j) : j; // Reflect across Y-axis
                reflectedMatrix[i][j] = matrix[reflectedRowIndex][reflectedColIndex];
            }
        }

        // Update the matrix with the reflected matrix
        matrix = reflectedMatrix;
    } updateVisualization(); 
}

function updateColor()
{ 
    colorVal = document.getElementById('colorSlider').value; 
    if(matrix.length > 0) { updateVisualization() }
}

function updateVisualization() {
    if (matrix.length > 0) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the matrix on the canvas
        for (var i = 0; i < rowCount; i++) {
            for (var j = 0; j < colCount; j++) {
                // Get the value from the matrix
                var value = matrix[i][j];
                // Calculate color based on hue and lightness
                var color = "hsl(" + colorVal + ", 100%, " + (20 + ((value/100)*60)) + "%)";

                // Set cell color based on grayscale color
                ctx.fillStyle = color;

                // Draw rectangle for each cell
                ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);

                // Add event listener for mouse hover to show value
                (function(x, y, value) {
                    canvas.addEventListener('mousemove', function(event) {
                        var mouseX = event.offsetX;
                        var mouseY = event.offsetY;
                        if (mouseX >= x * cellWidth && mouseX <= (x + 1) * cellWidth &&
                            mouseY >= y * cellHeight && mouseY <= (y + 1) * cellHeight) {
                            // Display value as tooltip
                            canvas.title = "Value:" + value;
                        }
                    });
                })(j, i, value);
            }
        }
    } else {
        alert("You need to make a Matrix First!");
    }
}

function showInfo(elementId){
    var infoText;
    switch (elementId) {
        case 'random':
            infoText = "Creates a Matrix of Random Values for you to play around with.";
            break;
            
        case 'invert':
            infoText = "Converts your Matrix into its inversion.\n(For two Matrices A and B, B is the Inversion of A if AB = BA = I, where I is the Identity Matrix.)";
            break;

        case 'rotationContainer':
            infoText = "Rotates your Matrix by θ° through Rotation Matrices.\nFor example, if Y is the Rotation of X by θ° (Assuming X and Y are 2x2 Matrices in this case):\n Y = X[cosθ -sinθ; sinθ cosθ]";
            break;

        case 'relfection':
            infoText = "Mirrors your Matrix based on the Axis Selected.\n\nFor example, given the Matrix A = [2 1; 0 3]:\nA reflected on the X Axis = [0 3; 2 1]\nA reflected on the Y Axis = [1 2; 3 0]";
            break;
      
        case 'scaler':
            infoText = "Scales your Matrix based on the vector imputted. For example, given the Matrix A = [2 1; 0 3] and Scales[x, y]\nA scaled by Scales[2, 1] = [20 10; 0 30]";
            break;
    }
    if(infoText) { document.getElementById(elementId).title = infoText; }
} 