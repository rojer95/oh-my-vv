import { Toast } from "@douyinfe/semi-ui";

let usevoice: any = null;

export const speak = (content: string) => {
  if (SpeechSynthesisUtterance) {
    try {
      const synth = window.speechSynthesis;
      const utterThis = new SpeechSynthesisUtterance(content);
      if (!usevoice) {
        const voices = synth.getVoices();
        for (const voice of voices) {
          if (voice.lang === "zh-CN") {
            usevoice = voice;
            break;
          }
        }
      }
      utterThis.voice = usevoice;
      synth.speak(utterThis);
    } catch (error) {
      console.error(error);
    }
  } else {
    Toast.warning("您的浏览器不支持播报");
  }
};
