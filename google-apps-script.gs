const SHEET_NAME = 'Registrations';
const DRIVE_FOLDER_ID = 'PASTE_YOUR_DRIVE_FOLDER_ID_HERE';

function doPost(event) {
  const record = JSON.parse(event.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
    || SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
  const screenshotUrl = saveScreenshot(record);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Submitted At', 'Membership Plan', 'Full Name', 'Mobile', 'WhatsApp', 'Email',
      'Date of Birth', 'Anniversary', 'Address', 'City', 'Referral Code',
      'Company', 'Designation', 'GST Number', 'Employee Count', 'Business Requirements',
      'Payment Screenshot'
    ]);
  }

  sheet.appendRow([
    record.submitted_at || new Date(), record.membership_plan || '', record.full_name || '',
    record.mobile || '', record.whatsapp || '', record.email || '', record.dob || '',
    record.anniversary || '', record.address || '', record.city || '', record.referral_code || '',
    record.company_name || '', record.designation || '', record.gst_number || '',
    record.employee_count || '', record.business_requirements || '', screenshotUrl
  ]);

  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function saveScreenshot(record) {
  if (!record.payment_screenshot_data || DRIVE_FOLDER_ID === 'PASTE_YOUR_DRIVE_FOLDER_ID_HERE') {
    return record.payment_screenshot || 'Not required';
  }

  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const base64 = record.payment_screenshot_data.split(',')[1];
  const contentType = record.payment_screenshot_data.match(/^data:(.*?);base64,/)[1];
  const blob = Utilities.newBlob(Utilities.base64Decode(base64), contentType, record.payment_screenshot);
  return folder.createFile(blob).getUrl();
}
