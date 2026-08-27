// 1. Map the plan values submitted by index.html to their Google Drive folder IDs.
const PLAN_FOLDERS = {
  "Starter": "17zZRyqdhmlGP1sApQnYQCJ36eCS7KcVt",
  "Lover": "1Vga2HhwmHDOgvJEh4Uqtz8Hvf0tyBB1K",
  "Elite": "11hCp6cpn9HF5T5JFWAUvT32QNV_68CgH",
  "Family Circle": "1ugcilhjS8ByN6bvI8EWXEKiTXB6z2lyF",
  "Corporate Club": "1OcR6uQtIalY6ByDIfNPWBRJoBrGNYO9Y"
};

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Little\'s Circle registration endpoint is running.'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(event) {
  try {
    const record = JSON.parse(event.postData.contents);
    const planName = record.membership_plan || "Unknown Plan";
    const clientName = record.full_name || "New Client";
    const submittedDate = record.submitted_at ? new Date(record.submitted_at) : new Date();
    const joinDate = isNaN(submittedDate.getTime()) ? new Date() : submittedDate;
    const expiryDate = new Date(joinDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const timeZone = Session.getScriptTimeZone();
    const formattedJoinDate = Utilities.formatDate(joinDate, timeZone, 'dd MMMM yyyy');
    const formattedExpiryDate = Utilities.formatDate(expiryDate, timeZone, 'dd MMMM yyyy');

    // 2. Find the correct folder based on the selected plan.
    const targetFolderId = PLAN_FOLDERS[planName];
    
    if (!targetFolderId || targetFolderId.indexOf('PASTE_') === 0) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Folder ID not configured for plan: " + planName }))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    
    const folder = DriveApp.getFolderById(targetFolderId);

    // 3. SAVE THE PAYMENT SCREENSHOT IN THAT FOLDER
    let screenshotUrl = 'Not uploaded';
    if (record.payment_screenshot_data) {
      const parts = record.payment_screenshot_data.split(',');
      const base64 = parts.length > 1 ? parts[1] : parts[0];
      const match = record.payment_screenshot_data.match(/^data:(.*?);base64/);
      const contentType = match ? match[1] : 'image/png';
      const decodedData = Utilities.base64Decode(base64);
      
      const imgFileName = clientName + "_Payment_" + (record.payment_screenshot || 'screenshot.png');
      const imgBlob = Utilities.newBlob(decodedData, contentType, imgFileName);
      screenshotUrl = folder.createFile(imgBlob).getUrl();
    }

    // 4. CREATE A TEXT FILE WITH ALL CLIENT DATA INSIDE THAT SAME FOLDER
    const docFileName = clientName + " - Registration Profile.txt";
    const docContent = `=========================================
CLIENT REGISTRATION PROFILE (${planName.toUpperCase()})
=========================================
Submitted At: ${record.submitted_at || new Date()}
Plan Selected: ${planName}
Join Date: ${formattedJoinDate}
Expiry Date: ${formattedExpiryDate}
Membership Duration: 1 Year

[PERSONAL DETAILS]
Full Name: ${clientName}
Mobile: ${record.mobile || 'N/A'}
WhatsApp: ${record.whatsapp || 'N/A'}
Email: ${record.email || 'N/A'}
Date of Birth: ${record.dob || 'N/A'}
Anniversary: ${record.anniversary || 'N/A'}

[ADDRESS & LOCATION]
Address: ${record.address || 'N/A'}
City: ${record.city || 'N/A'}

[BUSINESS DETAILS]
Company Name: ${record.company_name || 'N/A'}
Designation: ${record.designation || 'N/A'}
GST Number: ${record.gst_number || 'N/A'}
Employee Count: ${record.employee_count || 'N/A'}
Business Requirements: ${record.business_requirements || 'N/A'}

[VERIFICATION]
Referral Code: ${record.referral_code || 'N/A'}
Payment Screenshot Link: ${screenshotUrl}
=========================================`;

    // Saves the document directly into the plan folder
    const profileFile = folder.createFile(docFileName, docContent, MimeType.PLAIN_TEXT);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      fileName: profileFile.getName(),
      fileUrl: profileFile.getUrl()
    }))
                         .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}
