function searchStudent(query) {
  Logger.log("Query: " + query);
  const sheet = SpreadsheetApp.openById('1Qw4cx0NbOqM6Zs8pyYsQceEhhPPfmPPb0AO-GmvyyZ4')
               .getSheetByName('รวมกลุ่ม');
               if (!sheet) {
    throw new Error("ไม่พบชีทชื่อ 'Engineering Orientation Groups'");
  }

  const data = sheet.getDataRange().getValues();
  const results = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const sid = row[4].toString().trim();     // รหัสนักศึกษา
    const fname = row[2];    // ชื่อ
    const lname = row[3];    // นามสกุล
    const group = row[14]; // กลุ่ม
    const size = row[6];     // ไซซ์เสื้อ
    const day = row[15];
    const dep = row[5];
    const mark = row[16];
    const markeng = row[17];
    const checkin1 = row[18];
    const checkin2 = row[19];

    const fullName = fname + ' ' + lname;
    if (sid.includes(query) || fullName.includes(query)) {
      results.push({
        "รหัสนักศึกษา": sid,
        "ชื่อ": fname,
        "นามสกุล": lname,
        "กลุ่ม": group,
        "ไซซ์เสื้อ": size,
        "วันที่เข้าร่วมกิจกรรมสานสัมพันธ์": day,
        "ภาควิชา" : dep,
        "*หมายเหตุ" : mark,
        "*Remark" : markeng,
        "จุดลงทะเบียนช่วงเช้า" : checkin1,
        "จุดลงทะเบียนช่วงบ่าย" : checkin2
      });
    }
  }

  return results;
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

