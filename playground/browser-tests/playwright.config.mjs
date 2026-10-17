import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'.',testMatch:'*.spec.mjs',timeout:30000,workers:1,retries:0,
 reporter:[['list']],use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure',screenshot:'only-on-failure'},
 webServer:{command:'node server.mjs',url:'http://127.0.0.1:4173/playground/',reuseExistingServer:false},
 projects:[
  {name:'chromium',use:{...devices['Desktop Chrome']}},
  {name:'firefox',use:{...devices['Desktop Firefox']}},
  {name:'webkit',use:{...devices['Desktop Safari']}},
  {name:'android-layout',use:{...devices['Pixel 7']}},
  {name:'iphone-layout',use:{...devices['iPhone 13']}}
 ]
});
