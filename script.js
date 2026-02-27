// 常见主题的词汇库
const VOCABULARY_DATABASE = {
    '超市': {
        core: ['收银员 shōu yín yuán', '货架 huò jià', '购物车 gòuwù chē', '商品 shāngpǐn'],
        items: ['苹果 píng guǒ', '牛奶 niú nǎi', '面包 miànbāo', '鸡蛋 jīdàn', '香蕉 xiāngjiāo', '蔬菜 shūcài', '肉类 ròulèi', '饮料 yǐnliào'],
        environment: ['入口 rùkǒu', '出口 chūkǒu', '灯 dēng', '墙 qiáng', '招牌 zhāopái']
    },
    '医院': {
        core: ['医生 yīshēng', '护士 hùshi', '病人 bìngrén', '药房 yàofáng'],
        items: ['听诊器 tīngzhěnqì', '温度计 wēndùjì', '针筒 zhēntǒng', '药片 yàopiàn', '病床 bìngchuáng', '轮椅 lúnyǐ', '担架 dānjià', '口罩 kǒuzhào'],
        environment: ['挂号处 guàhàochù', '诊室 zhěnshì', '走廊 zǒuláng', '电梯 diàntī', '标志 biāozhì']
    },
    '公园': {
        core: ['游客 yóukè', '管理员 guǎnlǐyuán', '清洁工 qīngjiegōng'],
        items: ['秋千 qiūqiān', '滑梯 huáitī', '花 huā', '树 shù', '草 cǎo', '鸟 niǎo', '蝴蝶 húdié', '长椅 zhǎngyǐ'],
        environment: ['小路 xiǎolù', '池塘 chítáng', '凉亭 liángtíng', '围栏 wéilán', '垃圾桶 lājītǒng']
    },
    '动物园': {
        core: ['饲养员 sìyǎngyuán', '游客 yóukè', '动物管理员 dòngwùguǎnyuán'],
        items: ['狮子 shīzi', '老虎 lǎohǔ', '大象 dàxiàng', '猴子 hóuzi', '熊猫 xióngmāo', '长颈鹿 zhǎngjǐnglù', '斑马 bānmǎ', '孔雀 kǒngquè'],
        environment: ['围栏 wéilán', '指示牌 zhǐshìpái', '小路 xiǎolù', '水池 shuǐchí', '树木 shùmù']
    },
    '学校': {
        core: ['老师 lǎoshī', '学生 xuétóng', '校长 xiàozhǎng', '保安 bǎoān'],
        items: ['黑板 hēibǎn', '粉笔 fěnbǐ', '课桌 kèzhuō', '椅子 yǐzi', '书包 shūbāo', '课本 kèběn', '铅笔 qiānbǐ', '橡皮 xiàngpí'],
        environment: ['教室 jiàoshì', '操场 cāochǎng', '走廊 zǒuláng', '门 mén', '窗 chuāng']
    }
};

// 默认词汇库（当主题不在预定义列表中时使用）
const DEFAULT_VOCABULARY = {
    core: ['人物 rénwù', '场所 chǎngsuǒ', '设备 shèbèi'],
    items: ['物品1 wùpǐn', '物品2 wùpǐn', '物品3 wùpǐn', '物品4 wùpǐn', '物品5 wùpǐn', '物品6 wùpǐn', '物品7 wùpǐn', '物品8 wùpǐn'],
    environment: ['环境1 huánjìng', '环境2 huánjìng', '环境3 huánjìng', '环境4 huánjìng']
};

// 从本地存储加载API密钥
function loadApiKey() {
    return localStorage.getItem('nano_banana_api_key') || '';
}

// API配置
const API_CONFIG = {
    baseUrl: 'https://api.kie.ai/api/v1/jobs',
    apiKey: loadApiKey()  // 从本地存储加载API密钥
};

// 保存API密钥到本地存储
function saveApiKey(apiKey) {
    localStorage.setItem('nano_banana_api_key', apiKey);
    API_CONFIG.apiKey = apiKey;
}

// 检查API密钥是否有效
function isApiKeyValid() {
    return !!API_CONFIG.apiKey;
}

// 获取认证头
function getAuthHeaders() {
    if (!API_CONFIG.apiKey) {
        throw new Error('API密钥未设置，请先配置API密钥');
    }

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.apiKey}`
    };
}

// 页面元素
const elements = {
    themeInput: document.getElementById('theme'),
    titleInput: document.getElementById('title'),
    generateBtn: document.getElementById('generate-btn'),
    apiKeyInput: document.getElementById('api-key'),
    saveApiKeyBtn: document.getElementById('save-api-key'),
    apiStatus: document.getElementById('api-status'),
    wordPreviewGrid: document.getElementById('word-preview-grid'),
    regenerateWordsBtn: document.getElementById('regenerate-words'),
    loadingDiv: document.getElementById('loading'),
    resultDiv: document.getElementById('result'),
    imageContainer: document.getElementById('image-container'),
    downloadBtn: document.getElementById('download-btn'),
    errorDiv: document.getElementById('error')
};

// 事件监听器
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// 初始化应用
function initializeApp() {
    // 自动填入API密钥
    elements.apiKeyInput.value = API_CONFIG.apiKey;

    // 绑定事件
    elements.generateBtn.addEventListener('click', handleGenerateClick);
    elements.saveApiKeyBtn.addEventListener('click', handleSaveApiKey);
    elements.regenerateWordsBtn.addEventListener('click', handleRegenerateWords);

    // 监听主题变化以更新词汇预览
    elements.themeInput.addEventListener('input', debounce(updateWordPreview, 300));

    // 初始化词汇预览
    updateWordPreview();
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 更新词汇预览
function updateWordPreview() {
    const theme = elements.themeInput.value.trim();
    if (!theme) {
        elements.wordPreviewGrid.innerHTML = '<div class="empty-state">请输入主题以查看词汇预览</div>';
        return;
    }

    // 获取主题对应的词汇
    const vocabulary = getVocabularyForTheme(theme);

    // 清空现有词汇卡片
    elements.wordPreviewGrid.innerHTML = '';

    // 创建词汇卡片
    for (const [category, words] of Object.entries(vocabulary)) {
        words.forEach(word => {
            const [chinese, pinyin] = word.split(' ');
            const card = createWordCard(chinese, pinyin, category);
            elements.wordPreviewGrid.appendChild(card);
        });
    }
}

// 获取主题对应的词汇
function getVocabularyForTheme(theme) {
    // 首先尝试精确匹配
    if (VOCABULARY_DATABASE[theme]) {
        return VOCABULARY_DATABASE[theme];
    }

    // 如果没有精确匹配，尝试模糊匹配
    const similarThemes = Object.keys(VOCABULARY_DATABASE).filter(t =>
        t.includes(theme) || theme.includes(t)
    );

    if (similarThemes.length > 0) {
        return VOCABULARY_DATABASE[similarThemes[0]];
    }

    // 返回默认词汇库
    return DEFAULT_VOCABULARY;
}

// 创建词汇卡片
function createWordCard(chinese, pinyin, category) {
    const card = document.createElement('div');
    card.className = 'word-card';

    // 映射类别到标签文本
    const categoryLabels = {
        'core': '核心',
        'items': '物品',
        'environment': '环境'
    };

    const categoryLabel = categoryLabels[category] || category;

    card.innerHTML = `
        <div class="word-tag">${categoryLabel}</div>
        <div class="word-pinyin">${pinyin}</div>
        <div class="word-chinese">${chinese}</div>
    `;

    return card;
}

// 保存API密钥
function handleSaveApiKey() {
    const apiKey = elements.apiKeyInput.value.trim();

    if (!apiKey) {
        showError('请输入API密钥');
        return;
    }

    saveApiKey(apiKey);

    // 显示保存成功状态
    elements.apiStatus.classList.remove('hidden');
    setTimeout(() => {
        elements.apiStatus.classList.add('hidden');
    }, 2000);
}

// 重新生成词汇
function handleRegenerateWords() {
    updateWordPreview();
}

// 生成按钮点击处理
async function handleGenerateClick() {
    const theme = elements.themeInput.value.trim();
    const title = elements.titleInput.value.trim();

    if (!theme || !title) {
        showError('请输入主题和标题');
        return;
    }

    // 验证API密钥
    if (!isApiKeyValid()) {
        showError('请先配置 API Key');
        return;
    }

    // 隐藏之前的结果和错误
    hideElement(elements.resultDiv);
    hideElement(elements.errorDiv);

    // 显示加载状态
    showElement(elements.loadingDiv);

    try {
        // 生成提示词
        const prompt = generatePrompt(theme, title);

        // 调用API生成图像
        const imageUrl = await generateImageWithAPI(prompt);

        // 显示结果
        showResult(imageUrl);
    } catch (error) {
        console.error('生成失败:', error);
        showError(`生成失败: ${error.message}`);
    } finally {
        hideElement(elements.loadingDiv);
    }
}

// 生成提示词
function generatePrompt(theme, title) {
    // 根据主题获取相应的词汇
    const vocabulary = getVocabularyForTheme(theme);

    // 构建提示词
    const prompt = `请生成一张儿童识字小报《${theme}》，竖版 A4，学习小报版式，适合 5–9 岁孩子 认字与看图识物。

# 一、小报标题区（顶部）

**顶部居中大标题**：《${title}》
* **风格**：十字小报 / 儿童学习报感
* **文本要求**：大字、醒目、卡通手写体、彩色描边
* **装饰**：周围添加与 ${theme} 相关的贴纸风装饰，颜色鲜艳

# 二、小报主体（中间主画面）

画面中心是一幅 **卡通插画风的「${theme}」场景**：
* **整体气氛**：明亮、温暖、积极
* **构图**：物体边界清晰，方便对应文字，不要过于拥挤。

**场景分区与核心内容**
1.  **核心区域 A（主要对象）**：表现 ${theme} 的核心活动。
2.  **核心区域 B（配套设施）**：展示相关的工具或物品。
3.  **核心区域 C（环境背景）**：体现环境特征（如墙面、指示牌等）。

**主题人物**
* **角色**：1 位可爱卡通人物（职业/身份：与 ${theme} 匹配）。
* **动作**：正在进行与场景相关的自然互动。

# 三、必画物体与识字清单（Generated Content）

**请务必在画面中清晰绘制以下物体，并为其预留贴标签的位置：**

**1. 核心角色与设施：**
${vocabulary.core.map(item => `* ${item}`).join('\n')}

**2. 常见物品/工具：**
${vocabulary.items.map(item => `* ${item}`).join('\n')}

**3. 环境与装饰：**
${vocabulary.environment.map(item => `* ${item}`).join('\n')}

*(注意：画面中的物体数量不限于此，但以上列表必须作为重点描绘对象)*

# 四、识字标注规则

对上述清单中的物体，贴上中文识字标签：
* **格式**：两行制（第一行拼音带声调，第二行简体汉字）。
* **样式**：彩色小贴纸风格，白底黑字或深色字，清晰可读。
* **排版**：标签靠近对应的物体，不遮挡主体。

# 五、画风参数
* **风格**：儿童绘本风 + 识字小报风
* **色彩**：高饱和、明快、温暖 (High Saturation, Warm Tone)
* **质量**：8k resolution, high detail, vector illustration style, clean lines.`;

    return prompt;
}

// 调用API生成图像
async function generateImageWithAPI(prompt) {
    // 创建生成任务
    const createResponse = await fetch(`${API_CONFIG.baseUrl}/createTask`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            model: 'nano-banana-pro',
            input: {
                prompt: prompt,
                aspect_ratio: '3:4', // 竖版A4比例
                resolution: '2K',
                output_format: 'png'
            }
        })
    });

    if (!createResponse.ok) {
        const errorData = await createResponse.json().catch(() => ({}));
        throw new Error(`API请求失败: ${errorData.msg || createResponse.statusText}`);
    }

    const createResult = await createResponse.json();
    const taskId = createResult.data?.taskId;

    if (!taskId) {
        throw new Error('未获取到任务ID');
    }

    // 轮询任务状态直到完成
    let attempts = 0;
    const maxAttempts = 60; // 最多等待5分钟 (60次 * 5秒)

    while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 等待5秒

        const statusResponse = await fetch(`${API_CONFIG.baseUrl}/recordInfo?taskId=${taskId}`, {
            headers: getAuthHeaders()
        });

        if (!statusResponse.ok) {
            throw new Error(`查询任务状态失败: ${statusResponse.statusText}`);
        }

        const statusResult = await statusResponse.json();

        if (statusResult.data?.state === 'success') {
            const resultData = JSON.parse(statusResult.data.resultJson);
            if (resultData.resultUrls && resultData.resultUrls.length > 0) {
                return resultData.resultUrls[0];
            } else {
                throw new Error('API返回结果中没有图像URL');
            }
        } else if (statusResult.data?.state === 'fail') {
            const failMsg = statusResult.data.failMsg || '未知错误';
            throw new Error(`图像生成失败: ${failMsg}`);
        }

        attempts++;
    }

    throw new Error('图像生成超时');
}

// 显示结果
function showResult(imageUrl) {
    elements.imageContainer.innerHTML = `<img src="${imageUrl}" alt="生成的儿童识字小报">`;
    elements.downloadBtn.onclick = () => downloadImage(imageUrl);
    showElement(elements.resultDiv);
    showElement(elements.downloadBtn);
}

// 下载图片
function downloadImage(url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `儿童识字小报-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// 辅助函数
function showElement(element) {
    element.classList.remove('hidden');
}

function hideElement(element) {
    element.classList.add('hidden');
}

function showError(message) {
    elements.errorDiv.textContent = message;
    showElement(elements.errorDiv);
    setTimeout(() => {
        hideElement(elements.errorDiv);
    }, 5000);
}