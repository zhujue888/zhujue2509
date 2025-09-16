创建一个OnlyOffice插件，实现类似WPS的图片嵌入单元格功能。以下是完整实现方案：
插件目录结构
plaintextplaintext复制embed-image-plugin/
├── config.json
├── icon.png
├── icon@2x.png
├── index.html
├── main.js
└── translations/
    └── zh-CN.json
文件内容
1. config.json
jsonjson复制{
    "name": "embed-image-plugin",
    "version": "1.0.0",
    "displayName": "图片嵌入单元格",
    "description": "将图片嵌入单元格，实现类似WPS的图片嵌入功能",
    "guid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "appType": "desktop",
    "icon": "icon.png",
    "icon2x": "icon@2x.png",
    "extensions": [
        {
            "name": "embed-image",
            "type": "macro",
            "description": "图片嵌入单元格功能",
            "icon": "icon.png",
            "icon2x": "icon@2x.png",
            "isViewer": false,
            "isSystem": false,
            "isVisual": true,
            "initOn": "start",
            "initDataType": "ole",
            "initData": "",
            "buttons": [],
            "events": [],
            "macros": [
                "embedImage"
            ]
        }
    ]
}
2. translations/zh-CN.json
jsonjson复制{
    "plugin.embedImage.menuText": "嵌入单元格",
    "plugin.embedImage.success": "图片已成功嵌入单元格",
    "plugin.embedImage.error": "请先选择图片"
}
3. index.html
htmlhtml预览复制<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>图片嵌入插件</title>
    <script src="main.js"></script>
</head>
<body>
    <!-- 插件UI将动态生成 -->
</body>
</html>
4. main.js (核心功能实现)
javascriptjavascript运行复制(function (window, undefined) {
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
使用说明


​安装插件​：

将插件文件夹放入OnlyOffice的插件目录（通常为/opt/onlyoffice/desktopeditors/plugins）
重启OnlyOffice



​使用流程​：

在表格中插入图片
选中一个或多个图片
右键点击 → 选择"嵌入单元格"
图片将自动调整大小并嵌入到最近的单元格中
点击嵌入后的图片可放大查看



​功能特点​：

图片自动适应单元格大小
随单元格移动和调整大小
单击图片可放大查看
支持多选图片批量嵌入



注意事项

插件需要OnlyOffice 7.0及以上版本
首次使用可能需要启用插件（文件 → 插件 → 勾选"图片嵌入单元格"）
如果遇到权限问题，确保插件目录有正确权限：
bashbash复制chmod -R 755 /path/to/embed-image-plugin


这个插件实现了WPS风格的图片嵌入功能，操作简单直观，适合表格处理中的图片管理需求。