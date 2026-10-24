import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const {items}=JSON.parse(fs.readFileSync(new URL('../../challenge-catalogue.json',import.meta.url)));
test.use({ignoreHTTPSErrors:true}); // Local ephemeral test certificate only.
test('all ten challenge pages have matching descriptions, images and usable starters',async({page},testInfo)=>{
 for(const c of items){
  await page.goto('https://127.0.0.1:4174/'+c.page);
  await expect(page.locator('#challenge-description')).toHaveText(c.description);
  await expect(page.locator('#starter-description')).toHaveText(c.alt);
  const image=page.locator('main img').first();
  await expect(image).toHaveAttribute('alt',c.alt);
  await expect.poll(()=>image.evaluate(img=>img.complete && img.naturalWidth>0),{message:'Starter image '+c.id+' loads'}).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(c.id==='08')await page.screenshot({path:testInfo.outputPath('challenge-08.png'),fullPage:true});
  await page.goto('https://127.0.0.1:4174/playground/?challenge='+c.id);
  await expect(page.locator('#challenge')).toHaveValue(c.id);
  await expect(page.locator('#prompt')).toHaveText(c.description);
  await expect(page.locator('#starter-description')).toHaveText(c.alt);
  await expect(page.locator('#drawing')).toHaveAttribute('aria-label',c.id+' · '+c.title+'. '+c.alt);
  await expect(page.locator('#download')).toBeEnabled();
 }
 const values=await page.locator('#challenge option').evaluateAll(xs=>xs.map(x=>x.value));
 expect(values).toEqual([...items.map(c=>c.id),'blank']);
});
