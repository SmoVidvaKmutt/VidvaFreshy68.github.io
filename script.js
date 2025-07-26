// URL to your raw JSON data file on GitHub or another hosting service
const DATA_URL = 'https://raw.githubusercontent.com/SmoVidvaKmutt/VidvaFreshy68.github.io/refs/heads/main/students_by_hash_20250727_005444.json'; // <--- **สำคัญ: แก้ไข URL นี้**

let studentData = []; // To store all student data after fetching

// --- 1. Fetch data when the page loads ---
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // The original JSON is an object with hashed keys, we convert it to an array of student objects
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
        event.preventDefault(); // Prevent form submission
        performSearch();
    }
});


// --- 2. Search Function (replaces google.script.run) ---
function performSearch() {
    const query = document.getElementById('query').value.trim().toLowerCase();
    
    if (!query) {
        alert("กรุณากรอกข้อมูลก่อนค้นหา (Please enter Student ID or Name)");
        return;
    }

    // Play sound if you have one
    // document.getElementById('kmuttSong').play();

    const results = studentData.filter(student => {
        const studentId = String(student.student_id).trim();
        const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
        return studentId.includes(query) || fullName.includes(query);
    });

    showResults(results);
}

// --- 3. Display Results Function (adapted from your original code) ---
function showResults(data) {
    const container = document.getElementById('results-container');
    container.innerHTML = ''; // Clear previous results

    if (data.length === 0) {
        container.innerHTML = '<div class="result"><p>ไม่พบข้อมูล</p></div>';
        return;
    }

    data.forEach(item => {
        const resultHtml = `
            <div class="result">
                <p style="font-size: 22px; font-weight: bold; color: #FFD700; margin-bottom: 10px;">
                    กลุ่ม ${item.group} - วันที่เข้าร่วม: ${item.join_date}
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