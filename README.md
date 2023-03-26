# Tiny Editor

这是一个基于 Codemirror 的小小编辑器，支持实时编辑和预览 HTML 代码。

# 如何使用

1. 在左侧编辑器中输入HTML代码。
2. 单击“运行”按钮，在右侧查看预览。

# 文件结构

- `index.html` - 编辑器页面代码
- `css/editor.css` - 编辑器样式
- `css/codemirror.min.css` - CodeMirror编辑器样式
- `css/base16-light.min.css` - CodeMirror编辑器亮色主题样式
- `css/dracula.css` - CodeMirror编辑器暗色主题样式
- `js/codemirror.min.js` - CodeMirror编辑器脚本
- `js/closebrackets.js` - CodeMirror编辑器自动闭合括号脚本
- `js/closetag.js` - CodeMirror编辑器自动闭合标签脚本
- `js/anyword-hint.js` - CodeMirror编辑器代码提示脚本
- `js/htmlmixed.min.js` - CodeMirror编辑器HTML模式脚本
- `js/xml.min.js` - CodeMirror编辑器XML模式脚本
- `js/javascript.min.js` - CodeMirror编辑器JavaScript模式脚本
- `js/css.min.js` - CodeMirror编辑器CSS模式脚本
- `js/message.js` - 编辑器提示信息脚本
- `js/editor.js` - 编辑器功能脚本

# 功能说明

## 实时预览

在左侧编辑器中输入HTML代码，单击“运行”按钮，在右侧查看预览。

## 样式切换

单击“样式切换”按钮，可以选择不同的主题样式。

## 控制台

在底部控制台中可以输出日志、信息、警告等，并且可以实现输入命令交互。

# License

This project is licensed under the MIT License.
