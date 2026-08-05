import { ConfigProvider, App as AntApp, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { antdTheme } from './theme/antdTheme';

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{ algorithm: theme.darkAlgorithm, ...antdTheme }}
    >
      <AntApp>
        <RouterProvider router={router} />
      </AntApp>
    </ConfigProvider>
  );
}
