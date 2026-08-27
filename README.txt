# Little's Circle Membership Registration Website

A responsive, single-page membership registration design for Little's Bakes | Bistro.

## Files
- index.html — page structure and vanilla JS interactions
- styles.css — theme, layout, responsive styling
- littles-logo.png — supplied Little's Bakes | Bistro logo

## How to use
Open `index.html` in a browser.

Starter is free: it does not show a QR code or request a payment screenshot. Paid plans show the
payment QR code and request a screenshot before the registration is submitted.

To save customer details as a text profile in the selected Google Drive plan folder, deploy a Google Apps Script web app and set
`GOOGLE_APPS_SCRIPT_URL` near the top of the script in `index.html`. The submitted record includes
the customer's details, membership plan/category, payment screenshot filename and screenshot data.
Until that URL is configured, submissions are kept in the browser's pending local storage as an
offline fallback; this is not a shared database.

Owner setup:
1. Open `script.google.com`, create a standalone Apps Script project, and add the contents of
	`google-apps-script.gs`.
2. Create the five plan folders and replace the IDs in `PLAN_FOLDERS` with the real folder IDs.
	Make sure the Apps Script account can access those folders.
3. Deploy the script as a Web app, execute as yourself, and allow access to anyone with the link.
4. Paste the deployed Web app URL into `GOOGLE_APPS_SCRIPT_URL` in `index.html`.
5. Submit a test registration. A text profile is created in the selected plan folder;
	paid screenshots are saved in that same folder.

The QR code currently uses a temporary QR-generation URL containing the business name and amount.
Replace the `paymentQr.src` URL in `index.html` with the final business QR image or UPI URL.
