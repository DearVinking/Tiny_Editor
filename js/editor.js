const htmlEditor = document.getElementById('html-editor');
const resultFrameContainer = document.querySelector(".code-execution");
const runButton = document.getElementById('run-button');
const styleSwitchButton = document.getElementById('styleSwitch-button');
const consoleDiv = document.getElementById("consoleOutPut");
const consoleInput = document.getElementById("consoleInput");
const consoleButton = document.getElementById("console-button");
const beautifyButton = document.getElementById("beautify-button");
const memoryDOM = document.getElementById("memory");
const consoleCloseButton = document.getElementById("console-button-close");
const parentNode = styleSwitchButton.parentNode;
const consoleDivChild = document.querySelector('.console');
const consoleScrollDiv = document.querySelector('.consoleScroll');
const replacements = {
    '&quot;': '"',
    '&#039;': "'",
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>'
};
const svgTemplates = {
    log: `<svg width="120"height="120"fill="none"viewBox="0 0 120 120"><circle cx="86"cy="60"r="10"fill="#A5A5A5"/><path stroke="#A5A5A5"stroke-linecap="round"stroke-width="14"d="M71 13L26.121 57.879a3 3 0 0 0 0 4.242L71 107"/></svg>`,
    info: `<svg width="120"height="120"fill="none"viewBox="0 0 120 120"><circle cx="86"cy="60"r="10"fill="#A5A5A5"/><path stroke="#A5A5A5"stroke-linecap="round"stroke-width="14"d="M71 13L26.121 57.879a3 3 0 0 0 0 4.242L71 107"/></svg>`,
    input: `<svg width="120"height="120"fill="none"viewBox="0 0 120 120"><path stroke="#A5A5A5"stroke-linecap="round"stroke-width="14"d="M53 13l45.379 45.379a3 3 0 0 1 0 4.242L53 108"/><circle cx="29"cy="60"r="10"fill="#A5A5A5"/></svg>`,
    warn: `<svg width="112"height="98"fill="none"viewBox="0 0 112 98"><path fill="#FF8A00"d="M49.56 3.5c2.694-4.667 9.43-4.667 12.124 0l48.497 84c2.695 4.667-.673 10.5-6.062 10.5H7.124c-5.388 0-8.756-5.833-6.062-10.5l48.498-84z"/><path fill="#fff"d="M53.88 66.64l-.78-33.18h5.34l-.78 33.18h-3.78zm1.92 13.02c-.92 0-1.72-.34-2.4-1.02-.64-.68-.96-1.48-.96-2.4 0-.96.32-1.78.96-2.46.68-.68 1.48-1.02 2.4-1.02.96 0 1.76.34 2.4 1.02.68.68 1.02 1.5 1.02 2.46 0 .92-.34 1.72-1.02 2.4-.64.68-1.44 1.02-2.4 1.02z"/></svg>`,
    error: `<svg width="13"height="13"fill="none"viewBox="0 0 105 105"><circle cx="52.5"cy="52.5"r="52.5"fill="#FF7676"/><path fill="#fff"d="M71.094 29.08l-15.54 21.66L71.514 73h-6.54l-12.72-17.94L39.654 73h-6.18l15.96-22.2-15.54-21.72h6.6l12.24 17.46 12.18-17.46h6.18z"/></svg>`,
    table: ``,
};
const ConsoleTakeover = `<style>@layer {body.dark{background:#383838;}::-webkit-scrollbar{width:5px !important;height:5px !important;background-color:transparent;}::-webkit-scrollbar-corner{background-color:transparent;}::-webkit-scrollbar-thumb{border-radius:10px;background-color:rgba(0,0,0,0.5) !important;}::-webkit-scrollbar-track{background-color:transparent;border-radius:10px;}}</style><script>const consoleMethods = ["log", "warn", "error", "info", "table"];
const consoleObject = consoleMethods.reduce((obj, method) => {
    obj[method] = (...args) => {
        parent.window.displayConsoleOutput(method, false, ...args)
    };
    return obj
}, {});
window.console = {
    ...window.console,
    ...consoleObject
};

function handleError(errorMsg, url, lineNumber, column, errorObj) {
    const errorOutput = "<div>Error: " + errorMsg + "<br>URL: " + url + "<br>Line: " + lineNumber + "<br>Column: " + column + "</div>";
    parent.window.displayConsoleOutput("error", lineNumber, errorOutput);
    return true
}
window.onerror = handleError;

window.addEventListener('message', event => {
    let result;
    try {
        const command = event.data;
        result = eval(command);
        if (typeof result === 'object' && result !== null && typeof result[Symbol.iterator] === 'function') {
            parent.window.displayConsoleTable(result);
        } else {
            console.log(result);
        }
    } catch (e) {
        console.warn(e)
    }
    event.source.postMessage(result, event.origin)
});

const performMeasurement = async () => {
  try {
    const memorySample = await performance.measureUserAgentSpecificMemory();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return [(memorySample.bytes / 1048576).toFixed(2),timestamp];
  } catch (error) {
    console.log(error);
  }
};

setInterval(async function () {
  if (crossOriginIsolated) {
    const result = await performMeasurement();
    parent.window.getMemory(result);
  }
}, 20000);

</script>`;
const defaultCode = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, shrink-to-fit=no">
    <meta http-equiv="X-UA-Compatible" content="IE=edge, chrome=1">
    <title>文档</title>
    <style>
        
    </style>
</head>
<body>
    
    <script>
        
    </script>
</body>
</html>`;
let highLightLine = [];
let resultFrame = document.getElementById('result-frame');
(() => {
    const escapeHtml = myString => {
        const regex = /&quot;|&#039;|&amp;|&lt;|&gt;/g;
        return myString.replace(regex, (match) => replacements[match])
    };
    
    const getCookie = cname => {
      let name = cname + "=";
      let ca = document.cookie.split(';');
      for(let i=0; i<ca.length; i++) 
      {
        let c = ca[i].trim();
        if (c.indexOf(name)==0) return c.substring(name.length,c.length);
      }
      return "";
    };
    
    const switchTheme = event => {
        if (event.target === styleSwitchButton) {
            let resultDoc = resultFrame.contentDocument || resultFrame.contentWindow.document;
            if(currentTheme === "base16-light"){
                currentTheme = "dracula";
                document.cookie="DarkMode=dark";
                resultDoc.body.classList.add("dark");
                document.body.classList.add("dark");
            }else{
                document.cookie="DarkMode=light";
                currentTheme = "base16-light";
                resultDoc.body.classList.remove("dark");
                document.body.classList.remove("dark");
            }
            editor.setOption("theme", currentTheme);
        }
    };
    const params = new URLSearchParams(window.location.search);
    const uniqueID = params.get('id');
    const makeExpandingArea = el => {
        let timer = null;
        let setStyle = function(el, auto) {
            if (auto) el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px'
        };
        let delayedResize = function(el) {
            if (timer) {
                clearTimeout(timer);
                timer = null
            }
            timer = setTimeout(function() {
                setStyle(el)
            }, 200)
        };
        if (el.addEventListener) {
            el.addEventListener('input', function() {
                setStyle(el, 1)
            }, false);
            setStyle(el)
        } else if (el.attachEvent) {
            el.attachEvent('onpropertychange', function() {
                setStyle(el)
            });
            setStyle(el)
        }
    };
    const displayConsoleTable = data => {
        const table = document.createElement("table");
        const headerRow = table.insertRow();
        let dataArray = data;
        let isArrayOfObjects = Array.isArray(data) && typeof data[0] === "object";
        if (!isArrayOfObjects) {
            dataArray = data.map((item, index) => ({
                [index]: item
            }))
        }
        for (let key in dataArray[0]) {
            let headerCell = document.createElement("th");
            headerCell.innerHTML = key;
            headerRow.appendChild(headerCell)
        }
        let rows = [];
        for (let item of dataArray) {
            let row = table.insertRow();
            for (let key in item) {
                let cell = row.insertCell();
                console.log(item[key]);
                cell.innerHTML = item[key];
            }
            rows.push(row)
        }
        const fragment = document.createDocumentFragment();
        fragment.appendChild(table);
        consoleDiv.appendChild(fragment);
        consoleScrollDiv.scrollTo({
            top: consoleScrollDiv.scrollHeight,
            behavior: 'smooth'
        })
    };
    
    window.displayConsoleOutput = function(type, lineNumber, ...text) {
        if (lineNumber) {
            highLightLine.push(lineNumber);
            editor.addLineClass(lineNumber - 1, 'background', 'codeHighLight')
        };
        const outputDiv = document.createElement('div');
        outputDiv.className = type;
        if (type === 'table') {
            displayConsoleTable(text[0], outputDiv)
        } else {
            outputDiv.innerHTML = svgTemplates[type] + (text === '' ? 'undefined' : text);
        }
        consoleDiv.appendChild(outputDiv);
        consoleScrollDiv.scrollTo({
            top: consoleScrollDiv.scrollHeight,
            behavior: 'smooth'
        })
    };
    
    const data = {
        labels: [],
        datasets: [{
            label: '内存',
            data: [],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };
    const ctx = document.getElementById('memoryChart').getContext('2d');
    const memoryChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options
    });

    window.getMemory = function (msg) {
        if (crossOriginIsolated && performance.measureUserAgentSpecificMemory()) {
            memoryDOM.textContent = "当前内存使用量: " + msg[0] + " MB";
        } else if(!performance.measureUserAgentSpecificMemory()){
            memoryDOM.textContent = '此浏览器不支持 measureUserAgentSpecificMemory API';
        } else {
            memoryDOM.textContent = '网站未设置跨源隔离，请点击「新窗口打开」';
        }
        const updateChart = (time, memory) => {
            memoryChart.data.labels.push(time);
            memoryChart.data.datasets[0].data.push(memory);
            memoryChart.update();
        };
        updateChart(String(msg[1]), msg[0]);
    };
    
    Qmsg.config({
        timeout: 2000
    });
    let editor = CodeMirror.fromTextArea(document.getElementById("html-editor"), {
        mode: "htmlmixed",
        lineWrapping: true,
        lineNumbers: true,
        spellcheck: true,
        autoCloseBrackets: true,
        autoCloseTags: true,
        theme: "base16-light",
    });
    editor.setSize(null, "100%");
    let currentTheme = editor.options.theme;
    makeExpandingArea(consoleInput);
    
    if(getCookie('DarkMode') === 'dark'){
        let resultDoc = resultFrame.contentDocument || resultFrame.contentWindow.document;
        resultDoc.body.classList.add("dark");
        document.body.classList.add("dark");
        currentTheme = "dracula";
    }else if(getCookie('DarkMode') === 'light'){
        currentTheme = "base16-light";
    }else{
        document.cookie="DarkMode=light";
        currentTheme = "base16-light";
    }
    editor.setOption("theme", currentTheme);
    
    if (uniqueID) {
        Qmsg.loading('\u4EE3\u7801\u52A0\u8F7D\u4E2D');
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `load.php?id=${encodeURIComponent(uniqueID)}`, true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                Qmsg.closeAll();
                let data = JSON.parse(xhr.responseText);
                editor.setValue(decodeURIComponent(escapeHtml(data.html)));
                runButton.click();
                Qmsg.success('\u4EE3\u7801\u52A0\u8F7D\u6210\u529F')
            }
        };
        xhr.send()
    }else{
        let resultDoc = resultFrame.contentDocument || resultFrame.contentWindow.document;
        editor.setValue(defaultCode);
        resultDoc.open();
        resultDoc.write(ConsoleTakeover + defaultCode);
        resultDoc.close()
    }
    
    parentNode.addEventListener('click', switchTheme);
    runButton.addEventListener('click', () => {
        if (resultFrame) {
            resultFrame.remove();
            consoleDiv.innerHTML = ""
        }
        if (highLightLine.length > 0) {
            highLightLine.forEach(line => {
                editor.removeLineClass(line - 1, 'background', 'codeHighLight')
            })
        }
        resultFrame = document.createElement("iframe");
        resultFrame.id = "result-frame";
        resultFrame.classList = "h-full w-full";
        document.querySelector(".code-execution").prepend(resultFrame);
        let resultDoc = resultFrame.contentDocument || resultFrame.contentWindow.document;
        editor.save();
        resultDoc.open();
        resultDoc.write(ConsoleTakeover + htmlEditor.value);
        resultDoc.close();
        if(editor.options.theme === "dracula"){
            resultDoc.body.classList.add("dark");
        }
    });
    consoleInput.addEventListener('keyup', function(e) {
        if (e.keyCode === 13 && consoleInput.value.trim() != '') {
            resultFrame.contentWindow.postMessage(consoleInput.value, '*');
            consoleInput.value = '';
            consoleInput.style.height = '24px'
        }
    });
    beautifyButton.addEventListener('click', function () {
        editor.save();
        editor.setValue(html_beautify(htmlEditor.value));
    });
})();