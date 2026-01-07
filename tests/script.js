document.addEventListener("DOMContentLoaded", function() {
    renderButtonsGrid(3, 4, 'buttons');
});

function renderButtonsGrid(rows, columns, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID '${containerId}' not found.`);
        return;
    }

    console.log('Container found:', container);
    console.log('Container dimensions:', container.offsetWidth, 'x', container.offsetHeight);
    // set display:grid for the columns and rows
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    container.style.gap = '10px';

    for (let i = 0; i < rows * columns; i++) {

        console.log('Container width:', container.offsetWidth);
        const buttonWrapper = document.createElement('div');
        buttonWrapper.classList.add('single_button_wrap');

        const svgButton = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgButton.classList.add('svgbutton');
        svgButton.id = `button-${i}`;
        const cellWidth = container.offsetWidth / columns;
        const cellHeight = container.offsetHeight / rows;
        svgButton.setAttribute('width', cellWidth);
        svgButton.setAttribute('height', cellHeight);

        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        const linearGradientGrey = createLinearGradient('grey', ['#fff', '#bbb']);
        const linearGradientGrad2 = createLinearGradient('grad2', ['#bbb', '#fff']);
        const linearGradientRed = createLinearGradient('red', ['#fb9fa1', '#af1620']);
        const linearGradientGreen = createLinearGradient('green', ['#7efb7f', '#16871a']);

        defs.appendChild(linearGradientGrey);
        defs.appendChild(linearGradientGrad2);
        defs.appendChild(linearGradientRed);
        defs.appendChild(linearGradientGreen);

        svgButton.appendChild(defs);

        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute('fill', `url(#grey)`); // Change gradient ID as needed

        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        // get the min of the width or height of the container, and whether it is width or height that constrains it
        const minDimension = Math.min(container.offsetWidth, container.offsetHeight);
        const isWidthConstrained = container.offsetWidth < container.offsetHeight;

        if(isWidthConstrained) {
            circle.setAttribute('cx', minDimension / (2 * columns));
            circle.setAttribute('cy', minDimension / (2 * columns));
            circle.setAttribute('r', (minDimension / columns) * 0.375); // 75% of half the cell size
        }
        else {
            circle.setAttribute('cx', minDimension / (2 * rows));
            circle.setAttribute('cy', minDimension / (2 * rows));
            circle.setAttribute('r', (minDimension / rows) * 0.375); // 75% of half the cell size
        }
        
        circle.setAttribute('stroke', '#bbb');
        circle.setAttribute('stroke-width', '5');

        g.appendChild(circle);
        svgButton.appendChild(g);

        buttonWrapper.appendChild(svgButton);
        container.appendChild(buttonWrapper);
    }
}

function createLinearGradient(id, colors) {
    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    gradient.setAttribute('id', id);
    gradient.setAttribute('x1', '0');
    gradient.setAttribute('y1', '20%');
    gradient.setAttribute('x2', '0');
    gradient.setAttribute('y2', '100%');

    colors.forEach((color, index) => {
        const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop.setAttribute('offset', `${index / (colors.length - 1)}`);
        stop.setAttribute('stop-color', color);
        gradient.appendChild(stop);
    });

    return gradient;
}
