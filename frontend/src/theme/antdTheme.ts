import type { ThemeConfig } from 'antd';

/**
 * Ant Design theme tokens mapped from DESIGN.md (HydroMetric Pro design system).
 * Dark "command center" aesthetic — deep navy surfaces with glowing cyan accents.
 */
export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#00dbe7',
    colorInfo: '#00dbe7',
    colorSuccess: '#00ff41',
    colorWarning: '#f59e0b',
    colorError: '#ff3131',
    colorLink: '#00f2ff',

    colorBgBase: '#0e141e',
    colorBgContainer: '#161e2d',
    colorBgElevated: '#1a202a',
    colorBgLayout: '#0e141e',
    colorBgSpotlight: '#242a35',

    colorText: '#dde2f1',
    colorTextSecondary: '#b9cacb',
    colorTextTertiary: '#849495',
    colorTextQuaternary: '#59606b',

    colorBorder: '#3a494b',
    colorBorderSecondary: '#242a35',

    borderRadius: 4,
    borderRadiusLG: 8,
    borderRadiusSM: 2,

    fontFamily:
      "'Hanken Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,

    controlHeight: 36,
  },
  components: {
    Layout: {
      siderBg: '#0a0f18',
      headerBg: '#0e141e',
      bodyBg: '#0e141e',
    },
    Menu: {
      darkItemBg: '#0a0f18',
      darkSubMenuItemBg: '#080e18',
      darkItemSelectedBg: 'rgba(0, 219, 231, 0.12)',
      darkItemSelectedColor: '#00f2ff',
      darkItemColor: '#b9cacb',
      darkItemHoverColor: '#dde2f1',
      itemBorderRadius: 4,
    },
    Card: {
      colorBgContainer: '#161e2d',
      colorBorderSecondary: 'rgba(0, 242, 255, 0.1)',
      borderRadiusLG: 4,
    },
    Table: {
      colorBgContainer: '#161e2d',
      headerBg: '#1a202a',
      headerColor: '#b9cacb',
      borderColor: '#242a35',
      rowHoverBg: '#1e2530',
    },
    Statistic: {
      colorText: '#dde2f1',
      colorTextDescription: '#b9cacb',
    },
    Tag: {
      defaultBg: '#242a35',
      defaultColor: '#b9cacb',
    },
    Button: {
      primaryShadow: '0 0 12px rgba(0, 219, 231, 0.45)',
      colorPrimaryHover: '#3ef0f9',
    },
    Input: {
      colorBgContainer: '#0e141e',
      colorBorder: '#3a494b',
      activeBorderColor: '#00dbe7',
      activeShadow: '0 0 0 2px rgba(0, 219, 231, 0.2)',
    },
    Select: {
      colorBgContainer: '#0e141e',
      colorBorder: '#3a494b',
      optionSelectedBg: 'rgba(0, 219, 231, 0.15)',
    },
    Modal: {
      contentBg: '#161e2d',
      headerBg: '#161e2d',
    },
    Progress: {
      defaultColor: '#00dbe7',
      remainingColor: '#242a35',
    },
    Tabs: {
      itemSelectedColor: '#00f2ff',
      inkBarColor: '#00dbe7',
      itemColor: '#b9cacb',
    },
    Descriptions: {
      colorTextSecondary: '#b9cacb',
      colorSplit: '#242a35',
    },
  },
};
