// src/html/templates.js

export const loginTemplate = (lang = 'zh', message = '') => {
  const isZh = lang === 'zh';
  return `
<!DOCTYPE html>
<html lang="${isZh ? 'zh' : 'en'}">
<head>
  <meta charset="UTF-8">
  <title>${isZh ? '登录 - 文件分享' : 'Login - File Share'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #fff;
      color: #000;
    }
    .login-form {
      background: #fff;
      padding: 2rem;
      border-radius: 8px;
      border: 1px solid #ccc;
      width: 100%;
      max-width: 400px;
      margin: 1rem;
    }
    input {
      width: 100%;
      padding: 12px;
      margin: 12px 0;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
      font-size: 16px;
      color: #000;
      background: #fff;
    }
    button {
      width: 100%;
      padding: 12px;
      background: #000;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      transition: background 0.3s;
    }
    button:hover {
      background: #333;
    }
    .error-message {
      color: red;
      margin-bottom: 1rem;
      text-align: center;
    }
    h2 {
      text-align: center;
      margin-bottom: 1.5rem;
      color: #000;
    }
  </style>
</head>
<body>
  <div class="login-form">
    <h2>${isZh ? '登录' : 'Login'}</h2>
    ${message ? `<p class="error-message">${message}</p>` : ''}
    <form method="POST" action="/auth">
      <input type="password" name="password" placeholder="${isZh ? '密码' : 'Password'}" required>
      <button type="submit">${isZh ? '登录' : 'Login'}</button>
    </form>
  </div>
</body>
</html>
`;
};

export const mainTemplate = (lang = 'zh', files = []) => {
  const isZh = lang === 'zh';

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
    return (bytes / 1073741824).toFixed(2) + ' GB';
  }
  return `
<!DOCTYPE html>
<html lang="${isZh ? 'zh' : 'en'}">
<head>
  <meta charset="UTF-8">
  <title>${isZh ? '文件分享' : 'File Share'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #fff;
      color: #000;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .upload-form {
      background: #fff;
      padding: 2rem;
      border-radius: 8px;
      border: 1px solid #ccc;
      position: relative;
    }
    .upload-form h2 {
      text-align: center;
      margin-bottom: 1.5rem;
      color: #000;
    }
    .drag-drop {
      border: 2px dashed #ccc;
      padding: 2rem;
      text-align: center;
      margin-bottom: 1rem;
      position: relative;
      transition: background 0.3s;
      border-radius: 8px;
      background: #fff;
    }
    .drag-drop.hover {
      background: #f9f9f9;
    }
    .drag-drop input[type="file"] {
      display: none;
    }
    .drag-drop p {
      margin: 0;
      font-size: 18px;
      color: #000;
    }
    .drag-drop .file-list {
      margin-top: 1rem;
      text-align: left;
      max-height: 150px;
      overflow-y: auto;
    }
    .drag-drop .file-list li {
      list-style: none;
      margin-bottom: 0.5rem;
      color: #000;
    }
    .drag-drop .upload-btn,
    .drag-drop .open-btn {
      padding: 10px 20px;
      background: #000;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.3s;
      margin: 0.5rem;
    }
    .drag-drop .upload-btn:hover,
    .drag-drop .open-btn:hover {
      background: #333;
    }
    .storage-options {
      margin: 1rem 0;
      text-align: center;
    }
    .progress {
      width: 100%;
      height: 6px;
      background: #eee;
      margin: 1rem 0;
      display: none;
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      background: #000;
      width: 0%;
      transition: width 0.3s;
    }
    .result {
      margin-top: 1rem;
      padding: 1rem;
      background: #f8f8f8;
      border-radius: 4px;
      display: none;
    }
    button {
      background: #000;
      color: #fff;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.3s;
    }
    button:hover {
      background: #333;
    }
    a {
      color: #000;
      text-decoration: underline;
      transition: color 0.3s;
    }
    a:hover {
      color: #333;
    }
    .file-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 2rem;
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 8px;
      overflow: hidden;
    }
    .file-table th, .file-table td {
      border-bottom: 1px solid #ddd;
      padding: 12px;
      text-align: left;
      color: #000;
    }
    .file-table th {
      background: #f9f9f9;
      color: #000;
    }
    .file-table tr:last-child td {
      border-bottom: none;
    }
    .delete-btn {
      background: #000;
      color: #fff;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.3s;
    }
    .delete-btn:hover {
      background: red;
    }
    .fee-warning {
      margin-top: 1rem;
      color: #666;
      font-size: 0.9rem;
      text-align: center;
    }
    .uploading-indicator {
      display: none;
      margin-top: 1rem;
      text-align: center;
    }
    .uploading-indicator img {
      width: 50px;
      height: 50px;
    }
    .logout-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: transparent;
      color: #000;
      font-size: 16px;
      border: none;
      cursor: pointer;
      transition: color 0.3s;
    }
    .logout-btn:hover {
      color: red;
    }
    /* 通知栏样式 */
    #notificationBar {
      position: fixed;
      bottom: -100px;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 800px;
      background: #000;
      color: #fff;
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 1000;
      border-radius: 4px;
      transition: bottom 0.5s ease-in-out;
    }
    #notificationBar.show {
      bottom: 20px;
    }
    #notificationBar .message {
      flex-grow: 1;
      font-size: 16px;
    }
    #notificationBar .close-btn {
      background: none;
      border: none;
      color: #fff;
      font-size: 1.5rem;
      cursor: pointer;
    }
    /* 响应式设计 */
    @media (max-width: 600px) {
      .upload-form {
        padding: 1rem;
      }
      .drag-drop {
        padding: 1rem;
      }
      .file-table th, .file-table td {
        padding: 8px;
      }
      .logout-btn {
        padding: 5px 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <button class="logout-btn" onclick="logout()">${isZh ? '退出登录' : 'Logout'}</button>
    <div class="upload-form">
      <h2>${isZh ? '上传文件' : 'Upload File'}</h2>
      <div class="drag-drop" id="dragDropArea">
        <p>${isZh ? '将文件拖拽到此处' : 'Drag and drop files here'}</p>
        <ul class="file-list" id="fileList"></ul>
        <input type="file" id="fileInput" multiple>
        <button class="open-btn" onclick="document.getElementById('fileInput').click()">${isZh ? '选择文件' : 'Choose Files'}</button>
        <button class="upload-btn" onclick="uploadFiles()">${isZh ? '上传' : 'Upload'}</button>
      </div>
      <div class="storage-options">
        <label>${isZh ? '存储方式' : 'Storage'}:</label>
        <select id="storageType">
          <option value="r2">R2 ${isZh ? '存储' : 'Storage'}</option>
          <option value="d1">D1 ${isZh ? '数据库' : 'Database'}</option>
        </select>
      </div>
      <div class="fee-warning" id="feeWarning"></div>
      <div class="progress">
        <div class="progress-bar" id="progressBar"></div>
      </div>
      <div class="uploading-indicator" id="uploadingIndicator">
        <p>${isZh ? '正在上传...' : 'Uploading...'}</p>
        <img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwgAAAAAAACH5BAEAAAEALAAAAAAQABAAAAIgjI+pq+D9mDEd0dW1HUFW6XoYAOw==" alt="Uploading">
      </div>
      <div class="result" id="uploadResult"></div>
    </div>

    <table class="file-table">
      <thead>
        <tr>
          <th>${isZh ? '文件名' : 'Filename'}</th>
          <th>${isZh ? '大小' : 'Size'}</th>
          <th>${isZh ? '存储类型' : 'Storage Type'}</th>
          <th>${isZh ? '创建时间' : 'Created At'}</th>
          <th>${isZh ? '分享链接' : 'Share Link'}</th>
          <th>${isZh ? '操作' : 'Actions'}</th>
        </tr>
      </thead>
      <tbody>
        ${files
          .map(
            (file) => `
          <tr>
            <td>${file.filename}</td>
            <td>${formatSize(file.size)}</td>
            <td>${file.storage_type.toUpperCase()}</td>
            <td>${new Date(file.created_at).toLocaleString(
              lang === 'zh' ? 'zh-CN' : 'en-US'
            )}</td>
            <td>
              <button onclick="copyLink('${file.id}', this)">${
              isZh ? '复制链接' : 'Copy Link'
            }</button>
            </td>
            <td><button class="delete-btn" onclick="confirmDelete(this, '${
              file.id
            }')">${isZh ? '删除' : 'Delete'}</button></td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  </div>

  <div id="notificationBar">
    <span class="message"></span>
    <button class="close-btn" onclick="hideNotification()">×</button>
  </div>

  <script>
    function formatSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
      if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
      return (bytes / 1073741824).toFixed(2) + ' GB';
    }

    const dragDropArea = document.getElementById('dragDropArea');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const feeWarning = document.getElementById('feeWarning');
    const progressBar = document.getElementById('progressBar');
    const progress = document.querySelector('.progress');
    const uploadResult = document.getElementById('uploadResult');
    const uploadingIndicator = document.getElementById('uploadingIndicator');
    const storageTypeSelect = document.getElementById('storageType');
    const notificationBar = document.getElementById('notificationBar');
    const notificationMessage = notificationBar.querySelector('.message');
    const lang = navigator.language.includes('zh') ? 'zh' : 'en';

    dragDropArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      dragDropArea.classList.add('hover');
    });

    dragDropArea.addEventListener('dragleave', () => {
      dragDropArea.classList.remove('hover');
    });

    dragDropArea.addEventListener('drop', (e) => {
      e.preventDefault();
      dragDropArea.classList.remove('hover');
      fileInput.files = e.dataTransfer.files;
      updateFileList();
    });

    fileInput.addEventListener('change', updateFileList);

    function updateFileList() {
      fileList.innerHTML = '';
      const files = fileInput.files;
      let totalSize = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        totalSize += file.size;
        const li = document.createElement('li');
        li.textContent = file.name + ' (' + formatSize(file.size) + ')';
        fileList.appendChild(li);
      }
      const estimatedCost = (
        (totalSize / (1024 * 1024 * 1024)) *
        0.02
      ).toFixed(2); // 假设每GB 0.02美元
      feeWarning.textContent =
        lang === 'zh'
          ? \`预计费用：\$\${estimatedCost}\`
          : \`Estimated cost: \$\${estimatedCost}\`;
    }

    async function uploadFiles() {
      const files = fileInput.files;
      if (files.length === 0) return;

      progress.style.display = 'block';
      progressBar.style.width = '0%';
      uploadResult.style.display = 'none';
      uploadingIndicator.style.display = 'block';

      const storageType = storageTypeSelect.value;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 保留对存储介质的选择
        let currentStorageType = storageType;
        if (
          file.size > 25 * 1024 * 1024 &&
          currentStorageType !== 'r2'
        ) {
          currentStorageType = 'r2';
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('storage', currentStorageType);

        try {
          const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
          }

          const data = await response.json();
          const shareUrl = \`\${window.location.origin}/file/\${data.id}\`;

          uploadResult.style.display = 'block';
          uploadResult.innerHTML += \`
            <p>\${
              lang === 'zh'
                ? '文件上传成功：'
                : 'File uploaded successfully:'
            } <a href="\${shareUrl}" target="_blank">\${data.filename}</a></p>
          \`;

          showNotification(
            lang === 'zh' ? '文件上传成功' : 'File uploaded successfully',
            'success'
          );
        } catch (error) {
          uploadResult.style.display = 'block';
          uploadResult.innerHTML +=
            (lang === 'zh' ? '上传失败: ' : 'Upload failed: ') +
            error.message +
            '<br>';
          showNotification(
            (lang === 'zh' ? '上传失败: ' : 'Upload failed: ') +
              error.message,
            'error'
          );
        }

        progressBar.style.width = \`\${((i + 1) / files.length) * 100}%\`;
      }

      uploadingIndicator.style.display = 'none';

      // 刷新页面以显示更新后的文件列表
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }

    function showNotification(message, type = 'success') {
      notificationMessage.textContent = message;
      notificationBar.style.background =
        type === 'success' ? '#000' : 'red';
      notificationBar.classList.add('show');
      setTimeout(() => {
        hideNotification();
      }, 5000);
    }

    function hideNotification() {
      notificationBar.classList.remove('show');
    }

    function confirmDelete(button, id) {
      if (button.dataset.confirmed) {
        // 执行删除
        deleteFile(id);
      } else {
        button.textContent =
          lang === 'zh' ? '确认删除' : 'Confirm Delete';
        button.dataset.confirmed = true;
        button.style.background = 'red';
        setTimeout(() => {
          button.textContent = lang === 'zh' ? '删除' : 'Delete';
          delete button.dataset.confirmed;
          button.style.background = '#000';
        }, 3000); // 3 秒后重置按钮
      }
    }

    async function deleteFile(id) {
      const formData = new FormData();
      formData.append('id', id);

      try {
        const response = await fetch('/delete', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          // 刷新页面
          window.location.reload();
        } else {
          showNotification(
            lang === 'zh' ? '删除失败' : 'Failed to delete',
            'error'
          );
        }
      } catch (error) {
        showNotification(
          (lang === 'zh' ? '删除失败: ' : 'Failed to delete: ') +
            error.message,
          'error'
        );
      }
    }

    function copyLink(id, button) {
      const link = \`\${window.location.origin}/file/\${id}\`;
      navigator.clipboard
        .writeText(link)
        .then(() => {
          showNotification(
            lang === 'zh' ? '链接已复制' : 'Link copied to clipboard',
            'success'
          );
          button.textContent = lang === 'zh' ? '已复制' : 'Copied';
          button.style.background = '#333';
          setTimeout(() => {
            button.textContent =
              lang === 'zh' ? '复制链接' : 'Copy Link';
            button.style.background = '#000';
          }, 2000);
        })
        .catch((err) => {
          showNotification(
            lang === 'zh' ? '无法复制链接' : 'Failed to copy link',
            'error'
          );
        });
    }

    function logout() {
      if (
        confirm(
          lang === 'zh'
            ? '确定要退出登录吗？'
            : 'Are you sure you want to logout?'
        )
      ) {
        fetch('/logout', {
          method: 'POST',
        }).then(() => {
          window.location.href = '/auth';
        });
      }
    }
  </script>
</body>
</html>
`;
};
