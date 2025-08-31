class PedigreeApp {
    constructor() {
        this.proband = null;
        this.familyMembers = [];
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupCanvas();
    }

    setupEventListeners() {
        // Proband form submission
        document.getElementById('probandForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProband();
        });

        // Add family member button
        document.getElementById('addFamilyMember').addEventListener('click', () => {
            this.addFamilyMember();
        });

        // Canvas clear button
        document.getElementById('clearCanvas').addEventListener('click', () => {
            this.clearCanvas();
        });
    }

    setupCanvas() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch events for mobile/stylus
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });
    }

    addProband() {
        const name = document.getElementById('probandName').value;
        const id = document.getElementById('probandId').value;
        const sex = document.getElementById('probandSex').value;
        const age = document.getElementById('probandAge').value;
        const diagnosis = document.getElementById('probandDiagnosis').value;

        // Check if ID is unique
        if (this.isIdExists(id)) {
            alert('ID already exists. Please use a unique ID.');
            return;
        }

        this.proband = { name, id, sex, age, diagnosis, type: 'proband' };
        this.displayProbandInfo();
        document.getElementById('probandForm').reset();
    }

    addFamilyMember() {
        const name = prompt('Enter family member name:');
        const id = prompt('Enter unique ID:');
        const sex = prompt('Enter sex (male/female):');
        const relationship = prompt('Enter relationship (father/mother/sibling/child):');

        if (name && id && sex && relationship) {
            if (this.isIdExists(id)) {
                alert('ID already exists. Please use a unique ID.');
                return;
            }

            const member = { name, id, sex, relationship, type: 'family' };
            this.familyMembers.push(member);
            this.displayFamilyMembers();
        }
    }

    isIdExists(id) {
        if (this.proband && this.proband.id === id) return true;
        return this.familyMembers.some(member => member.id === id);
    }

    displayProbandInfo() {
        const probandSection = document.querySelector('.proband-section');
        let infoDiv = probandSection.querySelector('.proband-info');
        
        if (!infoDiv) {
            infoDiv = document.createElement('div');
            infoDiv.className = 'proband-info';
            probandSection.appendChild(infoDiv);
        }

        infoDiv.innerHTML = `
            <h3>Proband Information</h3>
            <p><strong>Name:</strong> ${this.proband.name}</p>
            <p><strong>ID:</strong> ${this.proband.id}</p>
            <p><strong>Sex:</strong> ${this.proband.sex}</p>
            <p><strong>Age:</strong> ${this.proband.age}</p>
            <p><strong>Diagnosis:</strong> ${this.proband.diagnosis}</p>
        `;
    }

    displayFamilyMembers() {
        const familyList = document.getElementById('familyList');
        familyList.innerHTML = '';

        this.familyMembers.forEach((member, index) => {
            const memberDiv = document.createElement('div');
            memberDiv.className = 'family-member';
            memberDiv.innerHTML = `
                <p><strong>${member.name}</strong> (${member.relationship})</p>
                <p>ID: ${member.id} | Sex: ${member.sex}</p>
                <button onclick="app.removeFamilyMember(${index})">Remove</button>
            `;
            familyList.appendChild(memberDiv);
        });
    }

    removeFamilyMember(index) {
        this.familyMembers.splice(index, 1);
        this.displayFamilyMembers();
    }

    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    draw(e) {
        if (!this.isDrawing) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const color = document.getElementById('colorPicker').value;
        const size = document.getElementById('brushSize').value;

        this.ctx.lineWidth = size;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = color;
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    stopDrawing() {
        this.isDrawing = false;
        this.ctx.beginPath();
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Initialize the app
const app = new PedigreeApp();