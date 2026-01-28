const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

// Danh sách file cần bảo vệ
const files = [
    path.join(__dirname, 'electron', 'main.js'),
    path.join(__dirname, 'electron', 'preload.js')
];

const mode = process.argv[2];

if (mode === 'restore') {
    console.log("♻️  ĐANG KHÔI PHỤC CODE GỐC...");
    files.forEach(filePath => {
        const backupPath = filePath + '.original';
        if (fs.existsSync(backupPath)) {
            fs.copyFileSync(backupPath, filePath);
            console.log(`   ✅ Restored: ${path.basename(filePath)}`);
        }
    });
    console.log("🎉 Code đã sạch sẽ để dev tiếp!");
} else {
    console.log("🛡️  ĐANG BẢO VỆ CODE (OBFUSCATION)...");
    files.forEach(filePath => {
        const backupPath = filePath + '.original';
        let sourceCode = '';

        // 1. Luôn ưu tiên lấy code từ bản backup (nếu có) để tránh lỗi làm rối chồng chéo
        if (fs.existsSync(backupPath)) {
            sourceCode = fs.readFileSync(backupPath, 'utf8');
        } else {
            sourceCode = fs.readFileSync(filePath, 'utf8');
            fs.writeFileSync(backupPath, sourceCode); // Tạo backup lần đầu
        }

        // 2. Cấu hình bảo mật cao
        const result = JavaScriptObfuscator.obfuscate(sourceCode, {
            target: 'node',
            compact: true,
            controlFlowFlattening: true,
            deadCodeInjection: true,
            debugProtection: false,
            disableConsoleOutput: true,
            selfDefending: true,
            stringArray: true,
            stringArrayEncoding: ['rc4']
        });

        fs.writeFileSync(filePath, result.getObfuscatedCode());
        console.log(`   🔒 Protected: ${path.basename(filePath)}`);
    });
    console.log("✅ Xong! Sẵn sàng build.");
}