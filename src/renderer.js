// 运行在 Electron 渲染进程 下的页面脚本

const editIconLight = `
<i class="q-icon" data-v-717ec976="" style="--b4589f60: inherit; --6ef2e80d: 16px;">
    <svg t="1691424497881" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4753" width="16" height="16">
        <path d="M686.4 224c-6.4-6.4-6.4-16 0-22.4l68-68c6.4-6.4 16-6.4 22.4 0l112.8 112.8c6.4 6.4 6.4 16 0 22.4l-68 68c-6.4 6.4-16 6.4-22.4 0L686.4 224zM384 776l372-372c5.6-5.6 4.8-15.2-1.6-20.8L641.6 269.6c-6.4-6.4-16-7.2-20.8-1.6L248 640l-56 192 192-56zM64 896v64h896v-64H64z" p-id="4754"></path>
    </svg>
</i>
`;

const editIconDark = `
<i class="q-icon" data-v-717ec976="" style="--b4589f60: inherit; --6ef2e80d: 16px;">
    <svg t="1691424497881" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4753" width="16" height="16">
        <path d="M686.4 224c-6.4-6.4-6.4-16 0-22.4l68-68c6.4-6.4 16-6.4 22.4 0l112.8 112.8c6.4 6.4 6.4 16 0 22.4l-68 68c-6.4 6.4-16 6.4-22.4 0L686.4 224zM384 776l372-372c5.6-5.6 4.8-15.2-1.6-20.8L641.6 269.6c-6.4-6.4-16-7.2-20.8-1.6L248 640l-56 192 192-56zM64 896v64h896v-64H64z" p-id="4754" fill="#ffffff"></path>
    </svg>
</i>
`;

function generateEditHtml() {
  let editIcon = editIconLight;
  var qThemeValue = document.body.getAttribute("q-theme");
  if (qThemeValue) {
    if (qThemeValue == "light") {
      editIcon = editIconLight;
    } else {
      editIcon = editIconDark;
    }
  }
  return `${editIcon}`;
}

/**
 * 右键菜单插入功能方法
 * @param {Element} qContextMenu 右键菜单元素
 * @param {String} icon SVG字符串
 * @param {String} title 选项显示名称
 * @param {Function} callback 回调函数
 */
function addQContextMenu(qContextMenu, icon, title, callback) {
  const tempEl = document.createElement("div");
  tempEl.innerHTML = document
    .querySelector(`.q-context-menu :not([disabled="true"])`)
    .outerHTML.replace(/<!---->/g, "");
  const item = tempEl.firstChild;
  item.id = "web-search";
  if (item.querySelector(".q-icon")) {
    item.querySelector(".q-icon").innerHTML = icon;
  }
  if (item.classList.contains("q-context-menu-item__text")) {
    item.innerText = title;
  } else {
    item.querySelector(".q-context-menu-item__text").innerText = title;
  }
  item.addEventListener("click", () => {
    callback();
    qContextMenu.remove();
  });
  qContextMenu.appendChild(item);
}

var hasInjected = false;
var targetEvent = null;
/**
 * 右键菜单监听
 */
function addMainQContextMenu(event) {
  targetEvent = event;
  if (hasInjected) return;

  new MutationObserver(() => {
    const qContextMenu = document.querySelector(".q-context-menu");

    if (qContextMenu) {
      console.log("qContextMenu-->");
      console.log(qContextMenu);

      hasInjected = true;

      addQContextMenu(
        qContextMenu,
        generateEditHtml(),
        "编辑消息",
        async () => {
          // 获取最里层元素
          const textNormal = targetEvent.querySelector(".text-normal");
          const targetElement = textNormal ? textNormal : targetEvent;
          const { innerText: rawText } = targetElement;
          if (rawText) {
            Swal.fire({
              title: "编辑消息内容",
              input: "text",
              inputAttributes: {
                autocapitalize: "off",
              },
              inputValue: rawText,
              showCancelButton: true,
              confirmButtonText: "确认",
              cancelButtonText: "取消",
              showLoaderOnConfirm: true,
              preConfirm: (input) => {
                if (input.trim() === "") {
                  Swal.showValidationMessage("请输入内容");
                }
                return input;
              },
              allowOutsideClick: () => !Swal.isLoading(),
            }).then((result) => {
              if (result.isConfirmed) {
                targetElement.innerText = `${result.value}`;
              }
            });
          }
        }
      );
    }
  }).observe(document.querySelector("body"), { childList: true });
}

function menuEventListener(event) {
  const { target } = event;
  const { classList } = target;
  if (
    ["text-normal", "message-content", "msg-content-container"].includes(
      classList[0]
    )
  ) {
    console.log("lqk-message-edit: 触发右键菜单");
    addMainQContextMenu(target);
  }
}

// 页面加载完成时触发
function onLoad() {
  const before_js = document.querySelector("#mimo_msg_js");
  if (before_js) {
    before_js.remove();
  }

  const before_css = document.querySelector("#mimo_msg_css");
  if (before_css) {
    before_css.remove();
  }

  const link = document.createElement("link");
  link.id = "mimo_msg_css";
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = `https://cdn.jsdelivr.net/npm/sweetalert2@11.0.20/dist/sweetalert2.min.css`;
  document.head.appendChild(link);

  const script = document.createElement("script");
  script.id = "mimo_msg_js";
  script.defer = "defer";
  script.src = `https://cdn.jsdelivr.net/npm/sweetalert2@11.0.20/dist/sweetalert2.min.js`;
  document.head.appendChild(script);

  document.addEventListener("contextmenu", menuEventListener);
}

onLoad();
