// DOM 元素
const myAvatarInput = document.getElementById('myAvatarInput');
const otherAvatarInput = document.getElementById('otherAvatarInput');
const otherNickname = document.getElementById('otherNickname');
const previewNickname = document.getElementById('previewNickname');
const messageList = document.getElementById('messageList');
const newMessage = document.getElementById('newMessage');
const messageSender = document.getElementById('messageSender');
const messageTime = document.getElementById('messageTime');
const addMessageBtn = document.getElementById('addMessageBtn');
const chatPreview = document.getElementById('chatPreview');
const exportBtn = document.getElementById('exportBtn');
const exportFormat = document.getElementById('exportFormat');
const exportSize = document.getElementById('exportSize');

// 初始化默认时间
messageTime.value = new Date().toISOString().slice(0, 16);

// 存储聊天消息的数组
let messages = [];

// 添加示例消息
function addExampleMessages() {
    const exampleMessages = [
        {
            content: "你好！",
            sender: "other",
            time: "2024-02-06T14:30",
            id: Date.now() - 3000
        },
        {
            content: "你好啊！最近怎么样？",
            sender: "me",
            time: "2024-02-06T14:31",
            id: Date.now() - 2000
        },
        {
            content: "挺好的，在学习编程呢",
            sender: "other",
            time: "2024-02-06T14:32",
            id: Date.now() - 1000
        }
    ];
    
    messages = exampleMessages;
    updateMessageList();
    updateChatPreview();
}

// 页面加载时添加示例消息
window.addEventListener('load', addExampleMessages);

// 头像处理函数
function handleAvatarUpload(input, previewImg) {
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // 检查文件大小
            if (file.size > 2 * 1024 * 1024) { // 2MB
                alert('图片大小不能超过2MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                // 创建图片对象以获取尺寸
                const img = new Image();
                img.onload = function() {
                    // 创建canvas进行压缩
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // 设置正方形尺寸
                    const size = Math.min(img.width, img.height);
                    canvas.width = 200; // 输出尺寸
                    canvas.height = 200;

                    // 计算裁剪位置
                    const startX = (img.width - size) / 2;
                    const startY = (img.height - size) / 2;

                    // 绘制并裁剪图片
                    ctx.drawImage(img, startX, startY, size, size, 0, 0, 200, 200);

                    // 更新预览图片
                    previewImg.src = canvas.toDataURL('image/jpeg', 0.8);
                    updateChatPreview();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

// 设置头像上传处理
handleAvatarUpload(myAvatarInput, myAvatarInput.previousElementSibling);
handleAvatarUpload(otherAvatarInput, otherAvatarInput.previousElementSibling);

// 昵称更新处理
otherNickname.addEventListener('input', function() {
    previewNickname.textContent = this.value || '对方昵称';
});

// 添加新消息
addMessageBtn.addEventListener('click', function() {
    const content = newMessage.value.trim();
    if (!content) return;

    const message = {
        content,
        sender: messageSender.value,
        time: messageTime.value,
        id: Date.now()
    };

    messages.push(message);
    updateMessageList();
    updateChatPreview();
    newMessage.value = '';
});

// 更新消息列表
function updateMessageList() {
    messageList.innerHTML = messages.map(msg => `
        <div class="message-item" draggable="true" data-id="${msg.id}">
            <div class="message-content">
                <span class="sender">${msg.sender === 'me' ? '我' : '对方'}:</span>
                <span class="text">${msg.content}</span>
                <span class="time">${formatTime(msg.time)}</span>
            </div>
            <button onclick="deleteMessage(${msg.id})">删除</button>
        </div>
    `).join('');

    // 添加拖拽排序功能
    setupDragAndDrop();
}

// 格式化时间显示
function formatTime(timeStr) {
    const date = new Date(timeStr);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// 删除消息
window.deleteMessage = function(id) {
    messages = messages.filter(msg => msg.id !== id);
    updateMessageList();
    updateChatPreview();
};

// 设置拖拽排序
function setupDragAndDrop() {
    const items = messageList.querySelectorAll('.message-item');
    items.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
    });
}

// 拖拽相关函数
let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    if (this === draggedItem) return;

    // 更新消息顺序
    const draggedId = parseInt(draggedItem.dataset.id);
    const dropId = parseInt(this.dataset.id);
    const draggedIndex = messages.findIndex(msg => msg.id === draggedId);
    const dropIndex = messages.findIndex(msg => msg.id === dropId);

    const [removed] = messages.splice(draggedIndex, 1);
    messages.splice(dropIndex, 0, removed);

    updateMessageList();
    updateChatPreview();
}

// 更新聊天预览
function updateChatPreview() {
    let currentDate = null;
    const chatContent = messages.map(msg => {
        const msgDate = new Date(msg.time);
        let timeHtml = '';
        
        // 检查是否需要显示新的时间标记
        if (!currentDate || !isSameDay(currentDate, msgDate)) {
            currentDate = msgDate;
            timeHtml = `<div class="message-time">${formatDateHeader(msgDate)}</div>`;
        }
        
        return `
            ${timeHtml}
            <div class="message ${msg.sender}">
                <img class="avatar" src="${msg.sender === 'me' ? 
                    myAvatarInput.previousElementSibling.src : 
                    otherAvatarInput.previousElementSibling.src}" alt="头像">
                <div class="content">${msg.content}</div>
            </div>
        `;
    }).join('');

    chatPreview.innerHTML = chatContent;
}

// 格式化日期头部
function formatDateHeader(date) {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (isSameDay(date, now)) {
        return formatTime(date);
    } else if (isSameDay(date, yesterday)) {
        return `昨天 ${formatTime(date)}`;
    } else {
        return `${date.getMonth() + 1}月${date.getDate()}日 ${formatTime(date)}`;
    }
}

// 检查是否是同一天
function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

// 更新状态栏时间
function updateStatusBarTime() {
    const statusTime = document.querySelector('.status-bar .time');
    const now = new Date();
    statusTime.textContent = formatTime(now);
}

// 每分钟更新一次状态栏时间
setInterval(updateStatusBarTime, 60000);
updateStatusBarTime(); // 初始化时间

// 导出图片
exportBtn.addEventListener('click', async function() {
    try {
        // 创建canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 设置导出区域
        const exportArea = exportSize.value === 'full' ? 
            document.querySelector('.preview-panel') : 
            document.querySelector('.wechat-chat');
        
        // 设置canvas尺寸
        canvas.width = exportArea.offsetWidth;
        canvas.height = exportArea.offsetHeight;
        
        // 转换为图片
        const data = await html2canvas(exportArea, {
            scale: 2,
            backgroundColor: '#ebebeb'
        });
        
        // 下载图片
        const link = document.createElement('a');
        link.download = `微信聊天记录_${new Date().getTime()}.${exportFormat.value}`;
        link.href = data.toDataURL(`image/${exportFormat.value}`);
        link.click();
    } catch (error) {
        alert('导出失败，请确保已安装html2canvas库');
        console.error('导出错误:', error);
    }
});

// 添加html2canvas库
const script = document.createElement('script');
script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
document.head.appendChild(script); 