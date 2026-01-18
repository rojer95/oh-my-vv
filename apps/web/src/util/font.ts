import { Fonts as FreeFonts } from "@/asset/fonts";

const Fonts = [
  {
    code: "Source Han Sans SC",
    name: "思源黑体",
    download: "",
    preview: "",
  },

  {
    code: "Alibaba PuHuiTi",
    name: "阿里巴巴普惠体",
    download: "",
    preview: "",
  },
  ...FreeFonts,
];

export { Fonts };

export const createFontFace2HTMLByTTF = (
  fontFamily: string,
  fontUrl: string
) => {
  if (!fontUrl) {
    return;
  }

  const fontFamilyId = `font_${fontFamily}`;

  const prevStyle = document.getElementById(fontFamilyId);

  if (prevStyle) {
    return;
  }
  const style = document.createElement("style");

  style.innerHTML = `
        @font-face {
            font-family: '${fontFamily}';
            src: url(${fontUrl});
      }`;
  // .replace(/\s+/g, ''); 去掉不然有空格的字体名称匹配不上
  style.id = fontFamilyId;

  document.head.appendChild(style);
};

for (const font of Fonts) {
  if (!font.download) continue;
  createFontFace2HTMLByTTF(font.code, font.download);
}
