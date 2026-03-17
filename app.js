const form = document.getElementById('blessing-form');
const relationshipSelect = document.getElementById('relationship');
const customRelationshipWrap = document.getElementById('custom-relationship-wrap');
const customRelationshipInput = document.getElementById('custom-relationship');
const output = document.getElementById('output');
const luckyBtn = document.getElementById('lucky-btn');
const copyBtn = document.getElementById('copy-btn');
const resetBtn = document.getElementById('reset-btn');
const clearHistoryBtn = document.getElementById('clear-history');
const historyList = document.getElementById('history-list');
const historyTemplate = document.getElementById('history-item-template');

const HISTORY_KEY = 'birthdayBlessingHistoryV1';
const MAX_HISTORY = 10;

const formalRoles = new Set(['领导', '客户', '老师', '长辈']);
const closeRoles = new Set(['闺蜜', '兄弟', '伴侣']);
const parentRoles = new Set(['爸爸', '妈妈']);
const formalScenarios = new Set(['正式短信', '邮件']);

relationshipSelect.addEventListener('change', () => {
  const isCustom = relationshipSelect.value === '自定义';
  customRelationshipWrap.classList.toggle('hidden', !isCustom);
  customRelationshipInput.required = isCustom;
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = collectFormData();
  if (!data) {
    return;
  }

  const text = generateBlessing(data);
  output.textContent = text;
  addHistory({ ...data, text });
});

luckyBtn.addEventListener('click', () => {
  fillRandomData();
  form.requestSubmit();
});

copyBtn.addEventListener('click', async () => {
  await copyText(output.textContent.trim());
});

resetBtn.addEventListener('click', () => {
  form.reset();
  customRelationshipWrap.classList.add('hidden');
  customRelationshipInput.required = false;
  output.textContent = '在左侧填写信息后点击“生成祝福”，这里会出现专属生日祝福。';
});

clearHistoryBtn.addEventListener('click', () => {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory([]);
});

function collectFormData() {
  const relationship = relationshipSelect.value === '自定义'
    ? customRelationshipInput.value.trim()
    : relationshipSelect.value.trim();
  const name = document.getElementById('name').value.trim();
  const age = document.getElementById('age').value.trim();
  const hobby = document.getElementById('hobby').value.trim();
  const scenario = document.getElementById('scenario').value.trim();
  const tone = document.getElementById('tone').value.trim();
  const length = document.getElementById('length').value.trim();
  const emoji = document.getElementById('allow-emoji').checked;
  const wishes = Array.from(document.querySelectorAll('input[name="wishes"]:checked')).map((box) => box.value);

  if (!relationship || !name || !scenario || !tone || !length) {
    alert('请完整填写必填项。');
    return null;
  }

  return { relationship, name, age, hobby, scenario, tone, length, emoji, wishes };
}

function generateBlessing(data) {
  const baseName = data.name;
  const agePart = data.age ? `${data.age}岁` : '';
  const hobbyPart = data.hobby ? `也愿你在${data.hobby}里持续收获快乐与灵感。` : '';

  const isFormal = formalRoles.has(data.relationship) || formalScenarios.has(data.scenario) || data.tone === '正式';
  const isClose = closeRoles.has(data.relationship) || data.tone === '亲密' || data.tone === '搞笑';
  const isParent = parentRoles.has(data.relationship);

  const greeting = isFormal
    ? `尊敬的${baseName}${agePart ? `（${agePart}）` : ''}，值此生日之际，谨向您致以诚挚祝福。`
    : isParent
      ? `亲爱的${data.relationship}，生日快乐！`
      : isClose
        ? `${baseName}，生日快乐！`
        : `${baseName}${agePart ? `，${agePart}生日快乐！` : '，生日快乐！'}`;

  const toneSentence = buildToneSentence(data.tone, data.relationship, isFormal, isClose, isParent);
  const wishesSentence = buildWishesSentence(data.wishes, isFormal);
  const scenarioEnding = buildScenarioEnding(data.scenario, isFormal);

  const emoji = shouldUseEmoji(data, isFormal) ? pickEmoji(data.tone, data.relationship) : '';

  const lines = [greeting, toneSentence, wishesSentence, hobbyPart, scenarioEnding]
    .filter(Boolean)
    .map((text) => `${text}${emoji && !isFormal ? ` ${emoji}` : ''}`);

  return formatByLength(lines, data.length);
}

function buildToneSentence(tone, relationship, isFormal, isClose, isParent) {
  if (isParent) {
    return '感谢您一直以来的付出与守护，愿往后的日子里，您多一点轻松，多一点被爱与陪伴。';
  }

  const map = {
    正式: '愿您新的一岁步履从容，所行皆坦途，所愿皆可期。',
    半正式: '祝你在新的一岁里，工作顺利、生活舒心，每天都有小确幸。',
    亲密: '新的一岁继续做那个发光发热的你，我会一直站在你这边。',
    搞笑: '愿你今年烦恼清零、快乐充值，颜值和好运都保持满格在线！',
    文艺: '愿岁月温柔以待，你在晨昏四季里都能遇见心之所向。',
    简短: '愿你今天比昨天更开心，明天比今天更幸运。',
    走心: '谢谢你一直真诚又温暖地存在，愿你被生活认真偏爱。',
  };

  if (isFormal && (tone === '搞笑' || tone === '亲密')) {
    return '衷心祝愿您新岁安康顺遂，事业精进，万事胜意。';
  }

  if (isClose && tone === '正式') {
    return '愿你心想事成，热爱不减，日子越过越精彩。';
  }

  if (!map[tone]) {
    return relationship ? `愿你和身边的人都平安喜乐，顺顺利利。` : '';
  }

  return map[tone];
}

function buildWishesSentence(wishes, isFormal) {
  if (!wishes.length) {
    return isFormal
      ? '祝您福祉绵长，顺心如意。'
      : '愿你平安顺遂，喜乐常在。';
  }

  const labels = wishes.join('、');
  return isFormal
    ? `并祝您在${labels}方面皆有新收获。`
    : `也祝你${labels}统统拉满，天天都有好消息。`;
}

function buildScenarioEnding(scenario, isFormal) {
  const map = {
    正式短信: '谨以此短信献上生日祝福，敬颂安祺。',
    微信: '今天请一定好好庆祝，朋友圈等你晒蛋糕！',
    卡片: '愿这张小卡片替我送去满满心意，陪你开启新一岁的惊喜。',
    朋友圈文案: '今日主角上线，愿你被鲜花、掌声和爱意包围。',
    邮件: '特此致信，祝您生日愉快，阖家幸福。',
  };

  if (isFormal && (scenario === '微信' || scenario === '朋友圈文案')) {
    return '祝您生日快乐，诸事顺遂，未来可期。';
  }

  return map[scenario] || '';
}

function shouldUseEmoji(data, isFormal) {
  if (!data.emoji) {
    return false;
  }

  return !isFormal;
}

function pickEmoji(tone) {
  const emojiPool = {
    正式: '🎉',
    半正式: '🌟',
    亲密: '💖',
    搞笑: '😄',
    文艺: '✨',
    简短: '🎂',
    走心: '🌷',
  };
  return emojiPool[tone] || '🎈';
}

function formatByLength(lines, length) {
  if (length === '短（1-2句）') {
    return lines.slice(0, 2).join(' ');
  }

  if (length === '中（3-5句）') {
    return lines.slice(0, 4).join('\n');
  }

  return lines.join('\n');
}

function fillRandomData() {
  const relationships = ['同事', '领导', '闺蜜', '兄弟', '爸爸', '妈妈', '客户', '长辈', '晚辈', '老师', '伴侣'];
  const names = ['小李', '王老师', '阿杰', '可可', '张总', '妈妈', '宇轩', '小陈'];
  const hobbies = ['', '摄影', '跑步', '烘焙', '旅行', '阅读'];
  const scenarios = ['正式短信', '微信', '卡片', '朋友圈文案', '邮件'];
  const tones = ['正式', '半正式', '亲密', '搞笑', '文艺', '简短', '走心'];
  const lengths = ['短（1-2句）', '中（3-5句）', '长（小短文）'];
  const wishPool = ['健康', '事业', '学业', '家庭', '财富', '好运'];

  relationshipSelect.value = sample(relationships);
  customRelationshipWrap.classList.add('hidden');
  customRelationshipInput.required = false;

  document.getElementById('name').value = sample(names);
  document.getElementById('age').value = Math.random() > 0.5 ? String(rand(18, 60)) : '';
  document.getElementById('hobby').value = sample(hobbies);
  document.getElementById('scenario').value = sample(scenarios);
  document.getElementById('tone').value = sample(tones);
  document.getElementById('length').value = sample(lengths);
  document.getElementById('allow-emoji').checked = Math.random() > 0.25;

  document.querySelectorAll('input[name="wishes"]').forEach((box) => {
    box.checked = false;
  });
  sampleMany(wishPool, rand(1, 4)).forEach((wish) => {
    const target = document.querySelector(`input[name="wishes"][value="${wish}"]`);
    if (target) {
      target.checked = true;
    }
  });
}

function sample(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function sampleMany(list, count) {
  return [...list].sort(() => 0.5 - Math.random()).slice(0, count);
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function copyText(text) {
  if (!text) {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = '已复制';
    setTimeout(() => {
      copyBtn.textContent = '复制';
    }, 1200);
  } catch {
    alert('复制失败，请手动复制。');
  }
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function addHistory(item) {
  const current = getHistory();
  const next = [
    {
      relationship: item.relationship,
      name: item.name,
      tone: item.tone,
      scenario: item.scenario,
      text: item.text,
      time: Date.now(),
    },
    ...current,
  ].slice(0, MAX_HISTORY);

  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  renderHistory(next);
}

function renderHistory(items = getHistory()) {
  historyList.innerHTML = '';
  if (!items.length) {
    historyList.innerHTML = '<li class="history-item"><p class="meta">暂无历史记录，快去生成第一条祝福吧。</p></li>';
    return;
  }

  items.forEach((item) => {
    const node = historyTemplate.content.cloneNode(true);
    node.querySelector('.meta').textContent = `${item.relationship} · ${item.name} · ${item.tone} / ${item.scenario}`;
    node.querySelector('.text').textContent = item.text;
    node.querySelector('.copy-history').addEventListener('click', () => copyText(item.text));
    historyList.appendChild(node);
  });
}

renderHistory();
