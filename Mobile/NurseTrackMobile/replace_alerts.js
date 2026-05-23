const fs = require('fs');

const path = 'c:/Users/Jay Yan Tiongzon/Documents/React/School/NurseTracker/Mobile/NurseTrackMobile/src/screens/main/DutyAttendanceScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacements = [
    ["Alert.alert('BLE Signal Required', 'Scan and detect your Clinical Instructor\\'s BLE signal before connecting.');", "setAlertConfig({ title: 'BLE Signal Required', message: 'Scan and detect your Clinical Instructor\\'s BLE signal before connecting.' });"],
    ["Alert.alert('Connect First', 'Connect to your Clinical Instructor before recording attendance.');", "setAlertConfig({ title: 'Connect First', message: 'Connect to your Clinical Instructor before recording attendance.' });"],
    ["Alert.alert('BLE Signal Required', `Scan and connect to your Clinical Instructor before recording ${needsTimeOut ? 'time out' : 'time in'}.`);", "setAlertConfig({ title: 'BLE Signal Required', message: `Scan and connect to your Clinical Instructor before recording ${needsTimeOut ? 'time out' : 'time in'}.` });"],
    ["Alert.alert('Time Out Not Open', 'You can time out once the scheduled duty end time is reached.');", "setAlertConfig({ title: 'Time Out Not Open', message: 'You can time out once the scheduled duty end time is reached.' });"],
    ["Alert.alert('Attendance Not Recorded', needsTimeOut ? 'Please make sure time out is open and try again.' : 'Please make sure you are assigned to today\\'s duty schedule and try again.');", "setAlertConfig({ title: 'Attendance Not Recorded', message: needsTimeOut ? 'Please make sure time out is open and try again.' : 'Please make sure you are assigned to today\\'s duty schedule and try again.' });"],
    ["Alert.alert('Submit Not Open', 'Submit attendance after the scheduled time out.');", "setAlertConfig({ title: 'Submit Not Open', message: 'Submit attendance after the scheduled time out.' });"],
    ["Alert.alert('Attendance Submitted', 'Duty attendance was submitted.');", "setAlertConfig({ title: 'Attendance Submitted', message: 'Duty attendance was submitted.' });"],
    ["Alert.alert('Submit Failed', 'Attendance could not be submitted yet.');", "setAlertConfig({ title: 'Submit Failed', message: 'Attendance could not be submitted yet.' });"],
    ["Alert.alert('Turn Off Bluetooth', 'Please turn off Bluetooth in your device settings to host offline.');", "setAlertConfig({ title: 'Turn Off Bluetooth', message: 'Please turn off Bluetooth in your device settings to host offline.' });"],
    ["Alert.alert('Permission Required', 'Bluetooth permissions are required to check/enable Bluetooth.');", "setAlertConfig({ title: 'Permission Required', message: 'Bluetooth permissions are required to check/enable Bluetooth.' });"],
    ["Alert.alert('Bluetooth Required', 'Please turn on Bluetooth first before starting to host the attendance signal.');", "setAlertConfig({ title: 'Bluetooth Required', message: 'Please turn on Bluetooth first before starting to host the attendance signal.' });"],
    ["Alert.alert('No Duty Schedule Today', 'Duty attendance is only available when you have an assigned duty schedule today.');", "setAlertConfig({ title: 'No Duty Schedule Today', message: 'Duty attendance is only available when you have an assigned duty schedule today.' });"],
    ["Alert.alert('Choose Schedule', 'Select which duty schedule you want to use for attendance first.');", "setAlertConfig({ title: 'Choose Schedule', message: 'Select which duty schedule you want to use for attendance first.' });"],
    ["Alert.alert('Permission Denied', 'Please grant Bluetooth permissions to use this feature.');", "setAlertConfig({ title: 'Permission Denied', message: 'Please grant Bluetooth permissions to use this feature.' });"],
    ["Alert.alert('Bluetooth Offline', 'Please enable Bluetooth in your device settings first.');", "setAlertConfig({ title: 'Bluetooth Offline', message: 'Please enable Bluetooth in your device settings first.' });"],
    ["Alert.alert('Turn Off Bluetooth', 'Please turn off Bluetooth in your device settings.');", "setAlertConfig({ title: 'Turn Off Bluetooth', message: 'Please turn off Bluetooth in your device settings.' });"],
];

for (const [oldStr, newStr] of replacements) {
    content = content.replaceAll(oldStr, newStr);
}

// Complex multi-line ones
const regex1 = /Alert\.alert\(\s*nextHosting \? 'Hosting Failed' : 'Stop Hosting Failed',\s*nextHosting\s*\?\s*`NurseTrack could not start the BLE host signal\. \$\{errorMessage\(error\)\}`\s*:\s*`NurseTrack could not stop the BLE host signal\. \$\{errorMessage\(error\)\}`\s*\);/g;
content = content.replace(regex1, "setAlertConfig({ title: nextHosting ? 'Hosting Failed' : 'Stop Hosting Failed', message: nextHosting ? `NurseTrack could not start the BLE host signal. ${errorMessage(error)}` : `NurseTrack could not stop the BLE host signal. ${errorMessage(error)}` });");

const regex2 = /Alert\.alert\(\s*'Bluetooth Error',\s*'Failed to enable Bluetooth\. Please enable it in settings manually\.',\s*\[\{ text: 'OK' \}\]\s*\);/g;
content = content.replace(regex2, "setAlertConfig({ title: 'Bluetooth Error', message: 'Failed to enable Bluetooth. Please enable it in settings manually.' });");

const regex3 = /Alert\.alert\(\s*'Bluetooth Access Required',\s*`NurseTrack needs Bluetooth access to \$\{role === 'student' \? 'scan for' : 'host'\} the attendance signal\. Please enable it in Settings\.`,\s*\[\s*\{\s*text:\s*'Cancel',\s*style:\s*'cancel'\s*\},\s*\{\s*text:\s*'Open Settings',\s*onPress:\s*\(\)\s*=>\s*void\s*Linking\.openSettings\(\)\s*\}\s*\]\s*\);/g;
content = content.replace(regex3, "setAlertConfig({ title: 'Bluetooth Access Required', message: `NurseTrack needs Bluetooth access to ${role === 'student' ? 'scan for' : 'host'} the attendance signal. Please enable it in Settings.` });");

if (content.includes('</SlideUpView>') && !content.includes('<CustomAlert')) {
    content = content.replace('</SlideUpView>', '  <CustomAlert visible={!!alertConfig} title={alertConfig?.title || \'\'} message={alertConfig?.message || \'\'} onClose={() => setAlertConfig(null)} />\n    </SlideUpView>');
}

fs.writeFileSync(path, content, 'utf8');
