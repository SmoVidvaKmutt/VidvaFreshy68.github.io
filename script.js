// URL to your raw JSON data file on GitHub or another hosting service
const DATA_URL = 'https://raw.githubusercontent.com/SmoVidvaKmutt/VidvaFreshy68.github.io/main/students_by_hash_20250727_005444.json'; // <--- **สำคัญ: แก้ไข URL นี้**

let studentData = []; // To store all student data after fetching

// --- 1. Fetch data when the page loads ---
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        studentData = Object.values(jsonData);
        
        console.log("Data loaded successfully.");
    } catch (error) {
        console.error("Failed to load student data:", error);
        const resultsContainer = document.getElementById('results-container');
        resultsContainer.innerHTML = '<p style="color: #FFBABA;">เกิดข้อผิดพลาดในการโหลดข้อมูลนักศึกษา</p>';
    }
});

// Add event listener for 'Enter' key on the input field
document.getElementById('query').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        performSearch();
    }
});

// --- 2. Search Function (Determines and passes search method) ---
function performSearch() {
    const rawQuery = document.getElementById('query').value.trim();
    if (!rawQuery) {
        alert("กรุณากรอกข้อมูลเพื่อค้นหา (รหัสนักศึกษา, ชื่อ หรือเบอร์โทรศัพท์)");
        return;
    }

    // Prepare query formats for different data types
    const cleanQuery = rawQuery.replace(/\s/g, '');
    const lowerCaseQuery = cleanQuery.toLowerCase();

    const results = studentData.filter(student => {
        const studentId = String(student.student_id).replace(/\s/g, '');
        const fullName = (`${student.first_name}${student.last_name}`).toLowerCase().replace(/\s/g, '');
        
        let phoneMatch = false;
        if (student.phone) {
            const dataPhoneNumber = String(student.phone).replace(/\s/g, '');
            const coreQueryPhone = cleanQuery.startsWith('0') ? cleanQuery.substring(1) : cleanQuery;
            const coreDataPhone = dataPhoneNumber.startsWith('0') ? dataPhoneNumber.substring(1) : dataPhoneNumber;
            if (coreDataPhone === coreQueryPhone) {
                phoneMatch = true;
            }
        }
        
        return studentId === cleanQuery || fullName === lowerCaseQuery || phoneMatch;
    });

    // [แก้ไข] ตรวจสอบว่าผลลัพธ์ที่ได้มาจากการค้นหาด้วยวิธีใด
    let searchMethodMessage = '';
    if (results.length > 0) {
        const firstResult = results[0];
        const studentId = String(firstResult.student_id).replace(/\s/g, '');
        const fullName = (`${firstResult.first_name}${firstResult.last_name}`).toLowerCase().replace(/\s/g, '');
        
        // ตรวจสอบเบอร์โทรศัพท์ก่อน
        let phoneMatch = false;
        if (firstResult.phone) {
            const dataPhoneNumber = String(firstResult.phone).replace(/\s/g, '');
            const coreQueryPhone = cleanQuery.startsWith('0') ? cleanQuery.substring(1) : cleanQuery;
            const coreDataPhone = dataPhoneNumber.startsWith('0') ? dataPhoneNumber.substring(1) : dataPhoneNumber;
            if (coreDataPhone === coreQueryPhone) {
                phoneMatch = true;
            }
        }
        
        if (phoneMatch) {
            searchMethodMessage ;
        } else if (studentId === cleanQuery) {
            searchMethodMessage ;
        } else if (fullName === lowerCaseQuery) {
            searchMethodMessage ;
        }
    }
    
    // [แก้ไข] ส่งข้อความประเภทการค้นหาไปยัง showResults
    showResults(results, searchMethodMessage);
}

// --- 3. Display Results Function (Displays the search method) ---
function showResults(data, searchMethodMessage) { // [แก้ไข] รับพารามิเตอร์เพิ่ม
    const container = document.getElementById('results-container');
    
    if (data.length === 0) {
        container.innerHTML = '<div class="result"><p>ไม่พบข้อมูล</p></div>';
        return;
    }

    // [แก้ไข] สร้างส่วนหัวเพื่อแสดงประเภทการค้นหา
    let headerHtml = '';
    if (searchMethodMessage) {
        headerHtml = `<h3 style="margin-bottom: 1em; font-weight:normal;">${searchMethodMessage}</h3>`;
    }

    // สร้าง HTML สำหรับผลลัพธ์แต่ละรายการ
    const resultsHtml = data.map(item => `
        <div class="result">
            <p style="font-size: 22px; font-weight: bold; color: #FFD700; margin-bottom: 10px;">
                กลุ่ม ${item.group} <br> วันที่เข้าร่วม: ${item.join_date}
            </p>
            <p><strong>รหัสนักศึกษา:</strong> ${item.student_id}</p>
            <p><strong>ชื่อ:</strong> ${item.first_name} ${item.last_name}</p>
            <p><strong>ภาควิชา:</strong> ${item.department}</p>
            <p><strong>ไซซ์เสื้อ:</strong> ${item.shirt_size}</p>
            <p><strong>จุดลงทะเบียนช่วงเช้า:</strong> ${item.checkin_morning}</p>
            <p><strong>จุดลงทะเบียนช่วงบ่าย:</strong> ${item.checkin_afternoon}</p>
            <br>
            <p><strong>*หมายเหตุ:</strong> ${item.note_th || '-'}</p>
            <p><strong></strong> ${item.note_en || ''}</p>
        </div>
    `).join('');

    // รวมส่วนหัวและผลลัพธ์เข้าด้วยกันแล้วแสดงผล
    container.innerHTML = headerHtml + resultsHtml;
}