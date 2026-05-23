const fs = require('fs');

const path = 'c:/Users/Jay Yan Tiongzon/Documents/React/School/NurseTracker/Mobile/NurseTrackMobile/src/screens/main/DutyAttendanceScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex3 = /Alert\.alert\(\s*'Bluetooth Required',\s*context === 'instructor'\s*\?\s*'Turn on Bluetooth before hosting the attendance signal\.'\s*:\s*'Turn on Bluetooth before scanning for your clinical instructor\.',\s*\[\s*\{\s*text:\s*'Cancel',\s*style:\s*'cancel'\s*\},\s*\{\s*text:\s*'Open Settings',\s*onPress:\s*\(\)\s*=>\s*void\s*openBluetoothSettings\(\)\s*\},\s*\{\s*text:\s*'Turn On Simulated',\s*onPress:\s*\(\)\s*=>\s*\{\s*setIsBluetoothOn\(true\);\s*BluetoothService\.setSimulatedState\(true\);\s*\},?\s*\},?\s*\]\s*\);/g;
content = content.replace(regex3, "setAlertConfig({ title: 'Bluetooth Required', message: context === 'instructor' ? 'Turn on Bluetooth before hosting the attendance signal.' : 'Turn on Bluetooth before scanning for your clinical instructor.', secondaryButtonText: 'Cancel', primaryButtonText: 'Settings', onPrimaryPress: () => void openBluetoothSettings() });");

const regex4 = /Alert\.alert\(\s*'Bluetooth Access Required',\s*`NurseTrack needs Bluetooth access to \$\{role === 'student' \? 'scan for' : 'host'\} the attendance signal\. Please enable it in Settings\.`,\s*\[\s*\{\s*text:\s*'Cancel',\s*style:\s*'cancel'\s*\},\s*\{\s*text:\s*'Open Settings',\s*onPress:\s*\(\)\s*=>\s*void\s*Linking\.openSettings\(\)\s*\}\s*\]\s*\);/g;
content = content.replace(regex4, "setAlertConfig({ title: 'Bluetooth Access Required', message: `NurseTrack needs Bluetooth access to ${role === 'student' ? 'scan for' : 'host'} the attendance signal. Please enable it in Settings.`, secondaryButtonText: 'Cancel', primaryButtonText: 'Settings', onPrimaryPress: () => void Linking.openSettings() });");

if (content.includes('</SlideUpView>') && !content.includes('<CustomAlert') && !content.includes('visible={!!alertConfig}')) {
    content = content.replace('</SlideUpView>', '  <CustomAlert \n    visible={!!alertConfig} \n    title={alertConfig?.title || \'\'} \n    message={alertConfig?.message || \'\'} \n    onClose={() => setAlertConfig(null)}\n    primaryButtonText={alertConfig?.primaryButtonText}\n    onPrimaryPress={alertConfig?.onPrimaryPress}\n    secondaryButtonText={alertConfig?.secondaryButtonText}\n    onSecondaryPress={alertConfig?.onSecondaryPress}\n  />\n    </SlideUpView>');
}

fs.writeFileSync(path, content, 'utf8');
