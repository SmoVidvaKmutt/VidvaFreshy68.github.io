function testListSheets() {
  const ss = SpreadsheetApp.openById('1Qw4cx0NbOqM6Zs8pyYsQceEhhPPfmPPb0AO-GmvyyZ4');
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    Logger.log(sheets[i].getName());
  }
}
