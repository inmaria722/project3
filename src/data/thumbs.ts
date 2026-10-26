// 썸네일 이미지 (외부 요청 없이 동작하도록 인라인 SVG 로 만들었습니다)
// 이 파일은 수정하지 마세요.

function make(from: string, to: string, label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="%23${from}"/><stop offset="1" stop-color="%23${to}"/>
</linearGradient></defs>
<rect width="400" height="200" fill="url(%23g)"/>
<text x="26" y="118" font-family="sans-serif" font-size="32" font-weight="700"
 fill="white" fill-opacity="0.92">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${svg.replace(/\n/g, "")}`;
}

export const THUMB = {
  react: make("4a6cf7", "7d4af7", "React"),
  html: make("f2683c", "f2a83c", "HTML / CSS"),
  node: make("16a06a", "0f8f8f", "Node.js"),
  git: make("d8434a", "b3327d", "Git"),
};
