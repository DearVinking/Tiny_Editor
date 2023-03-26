const htmlEditor = document.getElementById('html-editor');
const resultFrameContainer = document.querySelector(".code-execution");
const runButton = document.getElementById('run-button');
const styleSwitchButton = document.getElementById('styleSwitch-button');
const consoleDiv = document.getElementById("consoleOutPut");
const consoleInput = document.getElementById("consoleInput");
const consoleButton = document.getElementById("console-button");
const consoleCloseButton = document.getElementById("console-button-close");
const parentNode = styleSwitchButton.parentNode;
const consoleDivChild = document.querySelector('.console');
const consoleScrollDiv = document.querySelector('.consoleScroll');
const svgTemplates = {
    log: `<svg width="120" height="120" fill="none" viewBox="0 0 120 120"><circle cx="86" cy="60" r="10" fill="#A5A5A5"/><path stroke="#A5A5A5" stroke-linecap="round" stroke-width="14" d="M71 13L26.121 57.879a3 3 0 0 0 0 4.242L71 107"/></svg>`,
    info: `<svg width="120" height="120" fill="none" viewBox="0 0 120 120"><circle cx="86" cy="60" r="10" fill="#A5A5A5"/><path stroke="#A5A5A5" stroke-linecap="round" stroke-width="14" d="M71 13L26.121 57.879a3 3 0 0 0 0 4.242L71 107"/></svg>`,
    input: `<svg width="120" height="120" fill="none" viewBox="0 0 120 120"><path stroke="#A5A5A5" stroke-linecap="round" stroke-width="14" d="M53 13l45.379 45.379a3 3 0 0 1 0 4.242L53 108"/><circle cx="29" cy="60" r="10" fill="#A5A5A5"/></svg>`,
    warn: `<svg width="112" height="98" fill="none" viewBox="0 0 112 98"><path fill="#FF8A00" d="M49.56 3.5c2.694-4.667 9.43-4.667 12.124 0l48.497 84c2.695 4.667-.673 10.5-6.062 10.5H7.124c-5.388 0-8.756-5.833-6.062-10.5l48.498-84z"/><path fill="#fff" d="M53.88 66.64l-.78-33.18h5.34l-.78 33.18h-3.78zm1.92 13.02c-.92 0-1.72-.34-2.4-1.02-.64-.68-.96-1.48-.96-2.4 0-.96.32-1.78.96-2.46.68-.68 1.48-1.02 2.4-1.02.96 0 1.76.34 2.4 1.02.68.68 1.02 1.5 1.02 2.46 0 .92-.34 1.72-1.02 2.4-.64.68-1.44 1.02-2.4 1.02z"/></svg>`,
    error: `<svg width="13" height="13" fill="none" viewBox="0 0 105 105"><circle cx="52.5" cy="52.5" r="52.5" fill="#FF7676"/><path fill="#fff" d="M71.094 29.08l-15.54 21.66L71.514 73h-6.54l-12.72-17.94L39.654 73h-6.18l15.96-22.2-15.54-21.72h6.6l12.24 17.46 12.18-17.46h6.18z"/></svg>`,
};
const ConsoleTakeover = `<script>const consoleMethods=["log","warn","error","info"];const consoleObject=consoleMethods.reduce((obj,method)=>{obj[method]=(...args)=>{parent.window.displayConsoleOutput(method,false,...args)};return obj},{});window.console={...window.console,...consoleObject};function handleError(errorMsg,url,lineNumber,column,errorObj){const errorOutput="<div>Error: "+errorMsg+"<br>URL: "+url+"<br>Line: "+lineNumber+"<br>Column: "+column+"</div>";parent.window.displayConsoleOutput("error",lineNumber,errorOutput);return true}window.onerror=handleError;window.addEventListener('message',event=>{let result;try{const command=event.data;result=String(eval(command));console.log(result)}catch(e){console.warn(e)}event.source.postMessage(result,event.origin)});</script>`;

let highLightLine = [];
let resultFrame = document.getElementById('result-frame');
(() => {
    const switchTheme = event => {
        if (event.target === styleSwitchButton) {
            currentTheme = (currentTheme === "base16-light") ? "dracula" : "base16-light";
            editor.setOption("theme", currentTheme);
        }
    };
    const params = new URLSearchParams(window.location.search);
    const uniqueID = params.get('id');

    const makeExpandingArea = el => {
        let timer = null;
        let setStyle = function (el, auto) {
            if (auto) el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
        };
        let delayedResize = function (el) {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            timer = setTimeout(function () {
                setStyle(el)
            }, 200);
        };
        if (el.addEventListener) {
            el.addEventListener('input', function () {
                setStyle(el, 1);
            }, false);
            setStyle(el);
        } else if (el.attachEvent) {
            el.attachEvent('onpropertychange', function () {
                setStyle(el)
            });
            setStyle(el);
        }
    };

    window.displayConsoleOutput = function (type, lineNumber, ...text) {
        if (lineNumber) {
            highLightLine.push(lineNumber);
            editor.addLineClass(lineNumber, 'background', 'codeHighLight');
        }
        consoleDiv.innerHTML += "<div class=" + type + ">" + svgTemplates[type] + text + "</div>";
        consoleScrollDiv.scrollTo({
            top: consoleScrollDiv.scrollHeight,
            behavior: 'smooth'
        });
    };

    Qmsg.config({ timeout: 2000 });
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

    let resultDoc = resultFrame.contentDocument || resultFrame.contentWindow.document;
    resultDoc.open();
    resultDoc.write(ConsoleTakeover);
    resultDoc.close();

    parentNode.addEventListener('click', switchTheme);

    runButton.addEventListener('click', () => {
        if (resultFrame) {
            resultFrame.remove();
            consoleDiv.innerHTML = "";
        }
        if (highLightLine.length > 0) {
            highLightLine.forEach(line => {
                editor.removeLineClass(line, 'background', 'codeHighLight');
            });
        }
        resultFrame = document.createElement("iframe");
        resultFrame.id = "result-frame";
        document.querySelector(".code-execution").prepend(resultFrame);
        editor.save();
        let resultDoc = resultFrame.contentDocument || resultFrame.contentWindow.document;
        resultDoc.open();
        resultDoc.write(ConsoleTakeover + htmlEditor.value);
        resultDoc.close();
    });

    consoleInput.addEventListener('keyup', function (e) {
        if (e.keyCode === 13 && consoleInput.value.trim() != '') {
            resultFrame.contentWindow.postMessage(consoleInput.value, '*');
            consoleInput.value = '';
            consoleInput.style.height = '24px';
        }
    });
})();