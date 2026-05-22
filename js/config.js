export const TURNS = [2030, 2040, 2060, 2080];
export const FINAL_YEAR = 2100;
export const TARGET_TEMPERATURE_C = 2.0;
export const POLICY_MIN = 0;
export const POLICY_MAX = 4;
export const TURN_BUDGET = 40;
export const BORROW_LIMIT_PER_TURN = 12;
export const TOTAL_BORROW_LIMIT = 24;

export const ROLES = [
  { id: "environment", label: "환경부 장관" },
  { id: "economy", label: "경제부 장관" },
  { id: "science", label: "과학기술부 장관" },
  { id: "energy", label: "에너지·산업부 장관" }
];

export const POLICY_META = {
  fossilReduction: {
    label: "화석연료 사용 줄이기",
    shortLabel: "화석연료 감축",
    strongFrom: 3,
    approvers: ["environment", "economy", "energy"]
  },
  renewables: {
    label: "재생에너지 확대",
    shortLabel: "재생에너지",
    strongFrom: 3,
    approvers: ["energy", "economy"]
  },
  efficiency: {
    label: "에너지 효율 기술 향상",
    shortLabel: "효율 기술",
    strongFrom: 3,
    approvers: ["science", "economy"]
  },
  forests: {
    label: "산림 보호·복원",
    shortLabel: "산림 복원",
    strongFrom: 3,
    approvers: ["environment", "economy"]
  },
  demandReduction: {
    label: "도시 에너지 소비 줄이기",
    shortLabel: "에너지 소비",
    strongFrom: 3,
    approvers: ["environment", "economy", "energy"]
  },
  carbonRemoval: {
    label: "탄소 제거 기술 투자",
    shortLabel: "탄소 제거",
    strongFrom: 3,
    approvers: ["environment", "science", "economy"]
  }
};

export const BASELINE = {
  emissionsGt: { 2030: 57, 2040: 60, 2060: 62, 2080: 61, 2100: 59 },
  concentrationPpm: { 2030: 435, 2040: 470, 2060: 535, 2080: 595, 2100: 650 },
  temperatureC: { 2030: 1.5, 2040: 1.8, 2060: 2.5, 2080: 3.1, 2100: 3.6 }
};

export const POLICY_EFFECTS = {
  fossilReduction: { directEmissions: 0.12, budget: 7, burden: 10, development: -2 },
  renewables: { directEmissions: 0.09, budget: 9, burden: 4, development: 5 },
  efficiency: { directEmissions: 0.08, budget: 7, burden: 2, development: 6 },
  forests: { sinkSupport: 0.06, budget: 5, burden: 1, development: 2 },
  demandReduction: { directEmissions: 0.08, budget: 4, burden: 6, development: -4 },
  carbonRemoval: { sinkSupport: 0.05, budget: 10, burden: 2, development: 3 }
};

export const EVENTS = {
  electricityDemand: {
    year: 2040,
    title: "전력 수요가 빠르게 늘고 있다",
    text: "도시가 성장하면서 전기가 더 필요해졌다. 다음 정책 경로를 고르자.",
    choices: {
      fossilBackup: {
        label: "값싼 화석연료 발전을 일부 유지",
        description: "예산과 부담은 줄지만 배출 감축이 늦어진다.",
        budget: 2,
        burden: -2,
        emissionsModifier: 0.04,
        development: 3
      },
      cleanBuildout: {
        label: "재생에너지와 효율 설비 확대",
        description: "예산을 더 쓰지만 이후 배출 감축에 도움이 된다.",
        budget: 9,
        burden: 2,
        renewablesBoost: 1,
        efficiencyBoost: 1,
        development: 4
      }
    }
  },
  forestExpansion: {
    year: 2060,
    title: "도시 확장과 주변 숲 보호",
    text: "새 개발지와 탄소 흡수원을 함께 고려해야 한다.",
    choices: {
      denseGrowth: {
        label: "개발을 우선해 도시 발전도 확보",
        description: "도시는 빨리 커지지만 숲의 도움은 약해진다.",
        budget: 4,
        burden: 1,
        forestsBoost: -1,
        development: 7
      },
      forestShield: {
        label: "숲을 보호하고 복원 지역 확보",
        description: "개발 속도는 줄지만 탄소 흡수에 도움이 된다.",
        budget: 6,
        burden: 1,
        forestsBoost: 1,
        development: 3
      }
    }
  }
};
