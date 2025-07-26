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

// --- 2. Search Function (Fixed phone number logic) ---
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
        // --- Prepare data from the student record ---
        const studentId = String(student.student_id).replace(/\s/g, '');
        const fullName = (`${student.first_name}${student.last_name}`).toLowerCase().replace(/\s/g, '');
        
        // --- Normalize phone numbers for robust comparison ---
        
        // 1. Get the phone number from the data source
        const dataPhoneNumber = String(student.phone).replace(/\s/g, '');
        
        // 2. Normalize both the query and the data phone number to a "core" version (without a leading '0')
        const coreQueryPhone = cleanQuery.startsWith('0') ? cleanQuery.substring(1) : cleanQuery;
        const coreDataPhone = dataPhoneNumber.startsWith('0') ? dataPhoneNumber.substring(1) : dataPhoneNumber;
        
        // --- Perform the search ---
        // Compare student ID, full name, and the normalized "core" phone numbers
        return studentId === cleanQuery || 
               fullName === lowerCaseQuery ||
               coreDataPhone === coreQueryPhone;
    });

    showResults(results);
}

// --- 3. Display Results Function (no changes needed here) ---
function showResults(data) {
    const container = document.getElementById('results-container');
    container.innerHTML = ''; 

    if (data.length === 0) {
        container.innerHTML = '<div class="result"><p>ไม่พบข้อมูล</p></div>';
        return;
    }

    data.forEach(item => {
        const resultHtml = `
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
        `;
        container.innerHTML += resultHtml;
    });
}