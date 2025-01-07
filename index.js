// If absolute URL from the remote server is provided, configure the CORS
// header on that server.
var url = './portfolio.pdf';

// Loaded via <script> tag, create shortcut to access PDF.js exports.
var { pdfjsLib } = globalThis;

// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = './build/pdf.worker.mjs';

var pdfDoc = null,
    scale = 2;

function getRenderContext(page,canvas, ctx) {
    var viewport = page.getViewport({scale: scale});
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    canvas.style.width = "100%";
    canvas.style.height = "auto";

    // Render PDF page into canvas context
    return {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport
    };
}

/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
function renderPage(num, canvas) {
    // Using promise to fetch the page
    pdfDoc.getPage(num).then((page) => {
        var renderContext = getRenderContext(page,canvas)
        page.render(renderContext)
    })
}

/**
 * Asynchronously downloads PDF.
 */
pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
    pdfDoc = pdfDoc_;
    var viewer = document.getElementById('pdf-viewer');
    
    var page
    for(page = 1; page <= pdfDoc.numPages; page++) {
      var canvas = document.createElement("canvas");    
      viewer.appendChild(canvas);            
      renderPage(page, canvas);
    }

});