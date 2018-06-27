app.service('electron', function () {
    const remote = require('electron').remote;
    const {webFrame} = require('electron');

    function closeApplication() {
        remote.getCurrentWindow().close();
    }

    function zoomIn() {
        
        webFrame.setZoomFactor(webFrame.getZoomFactor() + 0.1);
    }

    function zoomOut() {
        webFrame.setZoomFactor(webFrame.getZoomFactor() - 0.1);
    }

    function resetZoom() {
        webFrame.setZoomFactor(1.0);
    }

    function toggleFullScreen() {
        
        remote.getCurrentWindow().setFullScreen(!isFullScreen());
    }

    function isFullScreen() {
        return remote.getCurrentWindow().isFullScreen();
    }

    return {
        closeApplication: closeApplication,
        zoomIn: zoomIn,
        zoomOut: zoomOut,
        resetZoom: resetZoom,
        isFullScreen : isFullScreen,
        toggleFullScreen: toggleFullScreen
    };
});