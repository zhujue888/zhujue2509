(function (window, undefined) {
    var plugin = {
        _api: null,
        _pluginPath: null,
        
        init: function (api, pluginPath) {
            this._api = api;
            this._pluginPath = pluginPath;
            
            // 添加右键菜单项
            this.addContextMenu();
            
            // 添加图片点击放大功能
            this.addImageClickHandler();
        },
        
        addContextMenu: function() {
            this._api.addEventListener('onContextMenu', function(event) {
                var selections = this._api.getSelections();
                var hasImages = selections.some(s => s.type === 'image');
                
                if (hasImages) {
                    event.actions.push({
                        name: 'embedImage',
                        text: this._api.traslate('plugin.embedImage.menuText'),
                        isSeparator: false,
                        disabled: false,
                        checked: false
                    });
                }
            }.bind(this));
        },
        
        embedImage: function() {
            var selections = this._api.getSelections();
            var images = selections.filter(s => s.type === 'image');
            
            if (images.length === 0) {
                this._api.alert(this._api.traslate('plugin.embedImage.error'));
                return;
            }
            
            images.forEach(function(image) {
                var imageObj = this._api.getObjectBySelection(image);
                if (!imageObj) return;
                
                // 获取图片位置和尺寸
                var position = imageObj.getPosition();
                var size = imageObj.getSize();
                
                // 找到最近的单元格
                var cell = this.findNearestCell(position.x, position.y);
                if (!cell) return;
                
                // 调整图片大小适应单元格
                var cellRect = this._api.getCellRect(cell.row, cell.col);
                var scale = Math.min(
                    cellRect.width / size.width,
                    cellRect.height / size.height
                );
                
                // 设置新尺寸和位置
                imageObj.setSize(size.width * scale, size.height * scale);
                imageObj.setPosition(cellRect.x, cellRect.y);
                
                // 锁定图片到单元格
                imageObj.setAnchor({
                    type: 'cell',
                    row: cell.row,
                    col: cell.col,
                    moveWithCell: true,
                    resizeWithCell: true
                });
                
                // 添加点击放大功能
                this.addImagePreview(imageObj);
            }.bind(this));
            
            this._api.alert(this._api.traslate('plugin.embedImage.success'));
        },
        
        findNearestCell: function(x, y) {
            var sheet = this._api.getActiveSheet();
            var rowCount = sheet.rowCount;
            var colCount = sheet.colCount;
            
            for (var row = 0; row < rowCount; row++) {
                for (var col = 0; col < colCount; col++) {
                    var rect = this._api.getCellRect(row, col);
                    if (x >= rect.x && x <= rect.x + rect.width &&
                        y >= rect.y && y <= rect.y + rect.height) {
                        return { row: row, col: col };
                    }
                }
            }
            return null;
        },
        
        addImageClickHandler: function() {
            document.addEventListener('click', function(e) {
                if (e.target.classList.contains('embedded-image')) {
                    this.showImagePreview(e.target.src);
                }
            }.bind(this));
        },
        
        showImagePreview: function(src) {
            // 创建预览层
            var overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = 0;
            overlay.style.left = 0;
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
            overlay.style.zIndex = 10000;
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.onclick = function() {
                document.body.removeChild(overlay);
            };
            
            // 创建图片元素
            var img = document.createElement('img');
            img.src = src;
            img.style.maxWidth = '90%';
            img.style.maxHeight = '90%';
            img.style.objectFit = 'contain';
            
            overlay.appendChild(img);
            document.body.appendChild(overlay);
        },
        
        addImagePreview: function(imageObj) {
            var element = imageObj.getElement();
            element.classList.add('embedded-image');
        }
    };
    
    window.embedImagePlugin = plugin;
})(window);

// 插件入口
window.onPluginInit = function (api, pluginPath) {
    window.embedImagePlugin.init(api, pluginPath);
};