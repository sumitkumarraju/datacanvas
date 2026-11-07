async page => {
 const f=page.frames().find(f=>f.url().startsWith('https://localhost:5244/'));
 await f.getByRole('button',{name:'Help',exact:true}).click();
 await f.getByRole('dialog').waitFor();
 await page.screenshot({path:'/Users/skr/jarvis/datacanvas/submission/reviewer/1.0.1/help.png'});
 await f.getByRole('button',{name:'Close help'}).click();
 await f.getByRole('button',{name:'Export with data',exact:true}).click();
 await f.getByRole('button',{name:'Cancel',exact:true}).click();
 await f.getByRole('button',{name:'Export with data',exact:true}).click();
 const d=page.waitForEvent('download');
 await f.getByRole('button',{name:'Download recipe with data',exact:true}).click();
 await (await d).saveAs('/Users/skr/jarvis/datacanvas/submission/reviewer/1.0.1/host-recipe.json');
 await f.getByRole('button',{name:'Dismiss notification'}).click();
 await f.getByLabel('Import recipe file').setInputFiles('/Users/skr/jarvis/datacanvas/submission/reviewer/1.0.1/no-data-recipe.json');
 await f.getByRole('heading',{name:'Import CSV to continue'}).waitFor();
 const disabled=await f.getByRole('button',{name:'Export with data',exact:true}).isDisabled();
 const hidden=await f.getByLabel('Category',{exact:true}).count()===0;
 await page.screenshot({path:'/Users/skr/jarvis/datacanvas/submission/reviewer/1.0.1/no-data.png'});
 await f.getByLabel('Import CSV file').setInputFiles('/Users/skr/jarvis/datacanvas/submission/reviewer/sample.csv');
 await f.getByRole('button',{name:'Add chart to Adobe Express',exact:true}).click();
 await f.getByText('Chart inserted into the current Adobe Express page as a flat PNG image.',{exact:true}).waitFor();
 const copyBlocked=await f.locator('h1').evaluate(el=>!el.dispatchEvent(new Event('copy',{bubbles:true,cancelable:true})));
 const editingAllowed=await f.getByLabel('Title',{exact:true}).evaluate(el=>el.dispatchEvent(new Event('copy',{bubbles:true,cancelable:true})));
 return {hostHelp:true,hostDownload:true,noDataExportDisabled:disabled,noStaleMapping:hidden,sourceImportAndChartInsert:true,copyBlocked,editingAllowed};
}
