export interface GenerationTheme {
  name: string;
  frame: string;
  frameBorder: string;
  headerBg: string;
  boxBg: string;
  boxBorder: string;
  gridBg: string;
  gridPattern: string;
  textColor: string;
  textShadow: string;
  buttonBg: string;
  buttonBorder: string;
  buttonText: string;
}

export const generationThemes: Record<number, GenerationTheme> = {
  1: {
    name: "Kanto",
    frame: "#c8d8c0",
    frameBorder: "#688860",
    headerBg: "linear-gradient(to bottom, #98d8a8 0%, #58a868 100%)",
    boxBg: "#489848",
    boxBorder: "#285828",
    gridBg: "#68b868",
    gridPattern: `
      repeating-linear-gradient(
        0deg,
        #60b060 0px,
        #60b060 2px,
        transparent 2px,
        transparent 12px
      ),
      repeating-linear-gradient(
        90deg,
        #58a858 0px,
        #58a858 1px,
        transparent 1px,
        transparent 12px
      ),
      radial-gradient(ellipse 100% 50% at 50% 100%, #48a048 0%, transparent 70%),
      linear-gradient(180deg, #78c878 0%, #68b868 50%, #58a858 100%)
    `,
    textColor: "#ffffff",
    textShadow: "2px 2px 0 #285828, -1px -1px 0 #285828, 1px -1px 0 #285828, -1px 1px 0 #285828",
    buttonBg: "#a8c8a0",
    buttonBorder: "#587850",
    buttonText: "#283820",
  },
  2: {
    name: "Johto",
    frame: "#f0e8d8",
    frameBorder: "#c8a878",
    headerBg: "linear-gradient(to bottom, #f8c868 0%, #e89838 100%)",
    boxBg: "#d88830",
    boxBorder: "#885518",
    gridBg: "#e8a040",
    gridPattern: `
      conic-gradient(from 45deg at 10% 90%, #c87820 0deg, #c87820 90deg, transparent 90deg),
      conic-gradient(from 45deg at 30% 85%, #d88828 0deg, #d88828 90deg, transparent 90deg),
      conic-gradient(from 45deg at 50% 92%, #c87018 0deg, #c87018 90deg, transparent 90deg),
      conic-gradient(from 45deg at 70% 88%, #d88020 0deg, #d88020 90deg, transparent 90deg),
      conic-gradient(from 45deg at 90% 90%, #c87820 0deg, #c87820 90deg, transparent 90deg),
      radial-gradient(circle at 85% 15%, #f8e888 0%, #f8d848 15%, transparent 30%),
      linear-gradient(180deg, #f8d078 0%, #e8a848 40%, #d89838 100%)
    `,
    textColor: "#ffffff",
    textShadow: "2px 2px 0 #784408, -1px -1px 0 #784408, 1px -1px 0 #784408, -1px 1px 0 #784408",
    buttonBg: "#e8d8c0",
    buttonBorder: "#b89058",
    buttonText: "#584018",
  },
  3: {
    name: "Hoenn",
    frame: "#d0e8f0",
    frameBorder: "#58a0c0",
    headerBg: "linear-gradient(to bottom, #38a8d8 0%, #1878a8 100%)",
    boxBg: "#1888b8",
    boxBorder: "#084868",
    gridBg: "#28a0d0",
    gridPattern: `
      radial-gradient(ellipse 200% 40% at 50% 110%, #f8e8a8 0%, #e8d080 20%, transparent 45%),
      radial-gradient(ellipse 80% 20% at 20% 100%, #f8f0c0 0%, transparent 60%),
      radial-gradient(ellipse 60% 15% at 80% 105%, #f8e8b0 0%, transparent 50%),
      repeating-linear-gradient(
        170deg,
        transparent 0px,
        transparent 40px,
        rgba(255,255,255,0.08) 40px,
        rgba(255,255,255,0.08) 80px
      ),
      linear-gradient(180deg, #48c8f8 0%, #38b0e8 30%, #28a0d8 60%, #1890c8 100%)
    `,
    textColor: "#ffffff",
    textShadow: "2px 2px 0 #084058, -1px -1px 0 #084058, 1px -1px 0 #084058, -1px 1px 0 #084058",
    buttonBg: "#b8d8e8",
    buttonBorder: "#4890b0",
    buttonText: "#183848",
  },
  4: {
    name: "Sinnoh",
    frame: "#d8e0e8",
    frameBorder: "#8898a8",
    headerBg: "linear-gradient(to bottom, #7888a8 0%, #485868 100%)",
    boxBg: "#404858",
    boxBorder: "#282838",
    gridBg: "#505868",
    gridPattern: `
      radial-gradient(circle at 15% 20%, #f8f8ff 2px, transparent 2px),
      radial-gradient(circle at 45% 15%, #f8f8ff 1px, transparent 1px),
      radial-gradient(circle at 75% 25%, #f8f8ff 2px, transparent 2px),
      radial-gradient(circle at 25% 45%, #f8f8ff 1px, transparent 1px),
      radial-gradient(circle at 85% 40%, #f8f8ff 1px, transparent 1px),
      radial-gradient(circle at 10% 65%, #f8f8ff 2px, transparent 2px),
      radial-gradient(circle at 55% 55%, #f8f8ff 1px, transparent 1px),
      radial-gradient(circle at 35% 70%, #f8f8ff 1px, transparent 1px),
      radial-gradient(circle at 90% 60%, #f8f8ff 2px, transparent 2px),
      radial-gradient(circle at 65% 75%, #f8f8ff 1px, transparent 1px),
      radial-gradient(circle at 20% 85%, #f8f8ff 1px, transparent 1px),
      radial-gradient(circle at 50% 90%, #f8f8ff 2px, transparent 2px),
      radial-gradient(circle at 80% 85%, #f8f8ff 1px, transparent 1px),
      radial-gradient(ellipse 150% 50% at 50% 110%, #e8f0f8 0%, #c8d8e8 30%, transparent 60%),
      linear-gradient(180deg, #586878 0%, #485868 50%, #404858 100%)
    `,
    textColor: "#ffffff",
    textShadow: "2px 2px 0 #181828, -1px -1px 0 #181828, 1px -1px 0 #181828, -1px 1px 0 #181828",
    buttonBg: "#c8d0d8",
    buttonBorder: "#788898",
    buttonText: "#283038",
  },
  5: {
    name: "Unova",
    frame: "#e0e0e8",
    frameBorder: "#7878a0",
    headerBg: "linear-gradient(to bottom, #6068a8 0%, #383880 100%)",
    boxBg: "#282858",
    boxBorder: "#181838",
    gridBg: "#383868",
    gridPattern: `
      repeating-linear-gradient(
        90deg,
        transparent 0px,
        transparent 78px,
        #4848a8 78px,
        #4848a8 80px
      ),
      repeating-linear-gradient(
        0deg,
        transparent 0px,
        transparent 78px,
        #4848a8 78px,
        #4848a8 80px
      ),
      repeating-linear-gradient(
        90deg,
        rgba(88,88,168,0.3) 0px,
        rgba(88,88,168,0.3) 2px,
        transparent 2px,
        transparent 20px
      ),
      radial-gradient(ellipse 80% 100% at 50% 100%, #5858b8 0%, transparent 50%),
      linear-gradient(180deg, #484888 0%, #383868 50%, #303058 100%)
    `,
    textColor: "#ffffff",
    textShadow: "2px 2px 0 #181830, -1px -1px 0 #181830, 1px -1px 0 #181830, -1px 1px 0 #181830",
    buttonBg: "#c8c8d8",
    buttonBorder: "#686890",
    buttonText: "#282840",
  },
  6: {
    name: "Kalos",
    frame: "#f0e8f0",
    frameBorder: "#b898c0",
    headerBg: "linear-gradient(to bottom, #d898d8 0%, #a868a8 100%)",
    boxBg: "#9858a0",
    boxBorder: "#583060",
    gridBg: "#a868b0",
    gridPattern: `
      radial-gradient(ellipse 30px 50px at 8% 95%, #e8a8e0 0%, #d088c8 50%, transparent 70%),
      radial-gradient(ellipse 25px 40px at 15% 88%, #f0b8e8 0%, #d898d0 50%, transparent 70%),
      radial-gradient(ellipse 35px 55px at 25% 92%, #e8a0d8 0%, #c880c0 50%, transparent 70%),
      radial-gradient(ellipse 28px 45px at 38% 86%, #f0c0e8 0%, #d890d0 50%, transparent 70%),
      radial-gradient(ellipse 32px 52px at 50% 94%, #e8b0e0 0%, #d080c8 50%, transparent 70%),
      radial-gradient(ellipse 26px 42px at 62% 88%, #f0b8e8 0%, #d898d0 50%, transparent 70%),
      radial-gradient(ellipse 30px 48px at 75% 91%, #e8a8d8 0%, #c888c0 50%, transparent 70%),
      radial-gradient(ellipse 28px 44px at 88% 87%, #f0c0e8 0%, #d890d0 50%, transparent 70%),
      radial-gradient(ellipse 25px 38px at 95% 93%, #e8b0e0 0%, #d088c8 50%, transparent 70%),
      linear-gradient(180deg, #c888c8 0%, #b878b8 40%, #a868a8 100%)
    `,
    textColor: "#ffffff",
    textShadow: "2px 2px 0 #482050, -1px -1px 0 #482050, 1px -1px 0 #482050, -1px 1px 0 #482050",
    buttonBg: "#e8d8e8",
    buttonBorder: "#a880b0",
    buttonText: "#402848",
  },
  7: {
    name: "Alola",
    frame: "#f8f0e0",
    frameBorder: "#d8a050",
    headerBg: "linear-gradient(to bottom, #f8a848 0%, #e87818 100%)",
    boxBg: "#d86808",
    boxBorder: "#883800",
    gridBg: "#e87810",
    gridPattern: `
      radial-gradient(circle at 15% 20%, #f8d818 60px, transparent 60px),
      radial-gradient(circle at 15% 20%, #f8e848 45px, transparent 45px),
      radial-gradient(circle at 15% 20%, #f8f078 30px, transparent 30px),
      conic-gradient(from 0deg at 15% 20%, 
        transparent 0deg, #f8c808 10deg, transparent 20deg,
        transparent 30deg, #f8c808 40deg, transparent 50deg,
        transparent 60deg, #f8c808 70deg, transparent 80deg,
        transparent 90deg, #f8c808 100deg, transparent 110deg,
        transparent 120deg, #f8c808 130deg, transparent 140deg,
        transparent 150deg, #f8c808 160deg, transparent 170deg,
        transparent 180deg, #f8c808 190deg, transparent 200deg,
        transparent 210deg, #f8c808 220deg, transparent 230deg,
        transparent 240deg, #f8c808 250deg, transparent 260deg,
        transparent 270deg, #f8c808 280deg, transparent 290deg,
        transparent 300deg, #f8c808 310deg, transparent 320deg,
        transparent 330deg, #f8c808 340deg, transparent 350deg
      ),
      linear-gradient(180deg, #f89828 0%, #e88018 40%, #d87008 100%)
    `,
    textColor: "#ffffff",
    textShadow: "2px 2px 0 #682800, -1px -1px 0 #682800, 1px -1px 0 #682800, -1px 1px 0 #682800",
    buttonBg: "#f0e0c8",
    buttonBorder: "#c89038",
    buttonText: "#583008",
  },
  8: {
    name: "Galar",
    frame: "#d8d0e0",
    frameBorder: "#7868a0",
    headerBg: "linear-gradient(to bottom, #8878b8 0%, #584888 100%)",
    boxBg: "#483878",
    boxBorder: "#281848",
    gridBg: "#584080",
    gridPattern: `
      repeating-linear-gradient(
        45deg,
        transparent 0px,
        transparent 20px,
        rgba(120,88,168,0.4) 20px,
        rgba(120,88,168,0.4) 22px
      ),
      repeating-linear-gradient(
        -45deg,
        transparent 0px,
        transparent 20px,
        rgba(120,88,168,0.4) 20px,
        rgba(120,88,168,0.4) 22px
      ),
      radial-gradient(circle at 50% 85%, #8868c0 0%, transparent 35%),
      radial-gradient(circle at 30% 90%, #7858b0 0%, transparent 25%),
      radial-gradient(circle at 70% 88%, #7858b0 0%, transparent 28%),
      linear-gradient(180deg, #685898 0%, #584888 50%, #483878 100%)
    `,
    textColor: "#ffffff",
    textShadow: "2px 2px 0 #181028, -1px -1px 0 #181028, 1px -1px 0 #181028, -1px 1px 0 #181028",
    buttonBg: "#c8c0d8",
    buttonBorder: "#685890",
    buttonText: "#281838",
  },
  9: {
    name: "Paldea",
    frame: "#f8e8e0",
    frameBorder: "#d87858",
    headerBg: "linear-gradient(to bottom, #e85848 0%, #b82818 100%)",
    boxBg: "#a82010",
    boxBorder: "#580800",
    gridBg: "#c83020",
    gridPattern: `
      radial-gradient(ellipse 80px 100px at 25% 90%, #38a838 0%, #288828 60%, transparent 70%),
      radial-gradient(ellipse 100px 120px at 75% 95%, #40b040 0%, #309030 60%, transparent 70%),
      radial-gradient(ellipse 60px 80px at 50% 85%, #48b848 0%, #389838 60%, transparent 70%),
      radial-gradient(ellipse 50px 60px at 10% 80%, #38a038 0%, #288028 60%, transparent 70%),
      radial-gradient(ellipse 55px 70px at 90% 82%, #40a840 0%, #308830 60%, transparent 70%),
      linear-gradient(180deg, #d84838 0%, #c83828 40%, #b82818 100%)
    `,
    textColor: "#ffffff",
    textShadow: "2px 2px 0 #480000, -1px -1px 0 #480000, 1px -1px 0 #480000, -1px 1px 0 #480000",
    buttonBg: "#f0d8d0",
    buttonBorder: "#c86848",
    buttonText: "#481808",
  },
};