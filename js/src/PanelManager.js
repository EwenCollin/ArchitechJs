import { GUI } from '../jsm/libs/dat.gui.module.js';

var PanelManager = function(eventDispatcher) {

    this.eventDispatcher = eventDispatcher;

    this.createPanel = function() {

        const panel = new GUI({ width: 310 });
    
        const folder1 = panel.addFolder('Object Mode');
        const folder1b = panel.addFolder('Selection');
        const folder2 = panel.addFolder('Actions');
        const folder3 = panel.addFolder('Add color');
        const folder4 = panel.addFolder('Scene');
    
    
        var settings = {
            'translate': this.eventDispatcher.transformControlSetTranslate,
            'rotate': this.eventDispatcher.transformControlSetRotate,
            'scale': this.eventDispatcher.transformControlSetScale,
            'translate / scale snap resolution': 1,
            'rotate snap resolution': 15,
            'empty selection': this.eventDispatcher.emptyMeshSelection,
            'cut with selection': this.eventDispatcher.cutWithSelection,
            'cut in minimal cut': 0.5,
            'red': 200,
            'green': 200,
            'blue': 200,
            'download scene': this.eventDispatcher.sceneExport,
            'load from JSON': this.eventDispatcher.sceneLoad
        };
    
        folder1.add(settings, 'translate');
        folder1.add(settings, 'rotate');
        folder1.add(settings, 'scale');
        folder1.add(settings, 'translate / scale snap resolution', 0.01, 100).listen().onChange(this.eventDispatcher.transformControlSnapTS);
        folder1.add(settings, 'rotate snap resolution', 1, 90).listen().onChange(this.eventDispatcher.transformControlSnapR);
        folder1.open();
        folder1b.add(settings, 'empty selection');
        folder1b.open();
        folder2.add(settings, 'cut with selection');
        folder2.add(settings, 'cut in minimal cut', 0.1, 10).listen().onChange(this.eventDispatcher.cutSetMinimalAmount);
        folder2.open();
        folder3.add(settings, 'red', 0, 255).listen().onChange(this.eventDispatcher.selectionSetColorR);
        folder3.add(settings, 'green', 0, 255).listen().onChange(this.eventDispatcher.selectionSetColorG);
        folder3.add(settings, 'blue', 0, 255).listen().onChange(this.eventDispatcher.selectionSetColorB);
        folder3.open();
        folder4.add(settings, 'download scene');
        folder4.add(settings, 'load from JSON');
    }
    this.createPanel();
}

export { PanelManager }