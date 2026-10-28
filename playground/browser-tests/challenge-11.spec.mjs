import {test,expect} from '@playwright/test';
test('Challenge 11 preserves observation and supports reveal, navigation and submission',async({page})=>{
 await page.goto('/challenge-11.html');
 const images=page.locator('img[src="challenge-11-observation.svg"]');
 await expect(images).toHaveCount(2);
 await expect(images.nth(0)).toBeVisible();
 await expect(images.nth(1)).not.toBeVisible();
 await page.getByText('2. Ready? Reveal the cue and look again',{exact:true}).click();
 await expect(images.nth(1)).toBeVisible();
 await page.getByText('Show the six arches',{exact:true}).click();
 await expect(page.locator('img[src="challenge-11-highlight.svg"]')).toBeVisible();
 await expect(page.getByRole('link',{name:'Share your interpretation',exact:true})).toHaveAttribute('href','submit.html?challenge=11');
 await page.goto('/challenges.html');
 await page.locator('#preview-number').fill('11');await page.locator('#preview-jump button').click();
 await expect(page.locator('#preview-11')).toBeVisible();
 await page.goto('/gallery.html#challenge-11');
 await expect(page.locator('#challenge-11')).toHaveAttribute('open','');
 await expect(page.locator('#challenge-11 article')).toHaveCount(3);
});
