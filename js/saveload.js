// 保存当前配置到storage
function saveSetting(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`保存设置失败: ${key}`, e);
  }
}

// 加载storage中的配置
function loadSetting(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn(`加载设置失败: ${key}`, e);
    return defaultValue;
  }
}
