// If absolute URL from the remote server is provided, configure the CORS
// header on that server.
var url = './portfolio.pdf';

// Loaded via <script> tag, create shortcut to access PDF.js exports.
var { pdfjsLib } = globalThis;

// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.mjs';

const canvases = [
    document.getElementById('canvas-1'),
]

const contexts = canvases.map(canvas => canvas.getContext('2d'))

var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 2;

function getRenderContext(page,canvas, ctx) {
    var viewport = page.getViewport({scale: scale});
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    canvas.style.width = "100%";
    canvas.style.height = "auto";

    // Render PDF page into canvas context
    return {
        canvasContext: ctx,
        viewport: viewport
    };
}

/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
function renderPage(num) {
    pageRendering = true;
    const pageNums = Array.from({length: canvases.length}, (_, i) => i + num)
    console.log(pageNums)
    // Using promise to fetch the page
    Promise.all(pageNums.map(pageNum => pdfDoc.getPage(pageNum))).then((pages) => {
    const renderTasks = pages.map((page,i) => ({page, renderContext: getRenderContext(page,canvases[i],contexts[i])}))
    .map(({page, renderContext}) => page.render(renderContext).promise)


    Promise.all(renderTasks).then(() => {
        pageRendering = false;
        if (pageNumPending !== null) {
        // New page rendering is pending
        renderPage(pageNumPending);
        pageNumPending = null;
        }
    })
    })
}

/**
 * If another page rendering in progress, waits until the rendering is
 * finised. Otherwise, executes rendering immediately.
 */
function queueRenderPage(num) {
    if (pageRendering) {
    pageNumPending = num;
    } else {
    renderPage(num);
    }
}

/**
 * Displays previous page.
 */
function onPrevPage() {
    if (pageNum <= 1) {
    return;
    }
    pageNum = pageNum - 1;
    queueRenderPage(pageNum);
}
document.getElementById('prev').addEventListener('click', onPrevPage);

/**
 * Displays next page.
 */
function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
    return;
    }
    pageNum = pageNum + 1;
    queueRenderPage(pageNum);
}
document.getElementById('next').addEventListener('click', onNextPage);

/**
 * Asynchronously downloads PDF.
 */
pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
    pdfDoc = pdfDoc_;

    // Initial/first page rendering
    renderPage(pageNum);
});