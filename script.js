/**
 * MedGenAI - Clinical Pedigree Analysis Platform
 * Professional Medical-Grade JavaScript Implementation
 */

class MedGenAI {
    constructor() {
        this.apiBaseUrl = 'https://f5r95yyk12.execute-api.us-east-1.amazonaws.com/dev';
        this.proband = null;
        this.familyMembers = [];
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentMode = 'freehand';
        this.selectedSymbol = null;
        this.symbols = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupCanvas();
        this.updateAnalysisSummary();
        console.log('MedGenAI Clinical Platform Initialized');
    }

    setupEventListeners() {
        // Proband form
        document.getElementById('probandForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createProband();
        });

        // Family member management
        document.getElementById('addFamilyMember').addEventListener('click', () => {
            this.showFamilyModal();
        });

        document.getElementById('familyMemberForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createFamilyMember();
        });

        // Modal controls
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.hideFamilyModal();
        });

        document.getElementById('cancelMember').addEventListener('click', () => {
            this.hideFamilyModal();
        });

        // Drawing mode toggle
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setDrawingMode(e.target.dataset.mode);
            });
        });

        // Canvas controls
        document.getElementById('clearCanvas').addEventListener('click', () => {
            this.clearCanvas();
        });

        document.getElementById('brushSize').addEventListener('input', (e) => {
            document.getElementById('brushSizeValue').textContent = e.target.value + 'px';
        });

        // Symbol selection
        document.querySelectorAll('.symbol-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.selectSymbol(e.currentTarget.dataset.symbol);
            });
        });

        // Header actions
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportPedigree();
        });

        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.performAIAnalysis();
        });
    }

    setupCanvas() {
        // Set canvas size properly
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

        // Touch events for tablets/stylus
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

    async createProband() {
        const formData = {
            name: document.getElementById('probandName').value,
            sex: document.getElementById('probandSex').value,
            age: parseInt(document.getElementById('probandAge').value),
            diagnosis: document.getElementById('probandDiagnosis').value
        };

        try {
            this.showLoading('Registering proband...');
            
            const response = await fetch(`${this.apiBaseUrl}/proband`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            
            if (response.ok) {
                this.proband = result.data;
                this.displayProbandInfo();
                this.showNotification('Proband registered successfully', 'success');
                this.updateAnalysisSummary();
            } else {
                throw new Error(result.error || 'Failed to create proband');
            }
        } catch (error) {
            console.error('Error creating proband:', error);
            this.showNotification('Error registering proband: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async createFamilyMember() {
        if (!this.proband) {
            this.showNotification('Please register proband first', 'warning');
            return;
        }

        const formData = {
            name: document.getElementById('memberName').value,
            sex: document.getElementById('memberSex').value,
            relationship: document.getElementById('memberRelationship').value,
            proband_id: this.proband.id,
            age: parseInt(document.getElementById('memberAge').value) || null
        };

        try {
            this.showLoading('Adding family member...');
            
            const response = await fetch(`${this.apiBaseUrl}/family`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            
            if (response.ok) {
                await this.loadFamilyMembers();
                this.hideFamilyModal();
                this.showNotification('Family member added successfully', 'success');
                document.getElementById('familyMemberForm').reset();
                this.updateAnalysisSummary();
            } else {
                throw new Error(result.error || 'Failed to add family member');
            }
        } catch (error) {
            console.error('Error creating family member:', error);
            this.showNotification('Error adding family member: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadFamilyMembers() {
        if (!this.proband) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/family/proband/${this.proband.id}`);
            const result = await response.json();
            
            if (response.ok) {
                this.familyMembers = result.family_members || [];
                this.displayFamilyMembers();
            }
        } catch (error) {
            console.error('Error loading family members:', error);
        }
    }

    displayProbandInfo() {
        // Show proband info in sidebar
        const probandSection = document.querySelector('.sidebar-section');
        let infoDiv = probandSection.querySelector('.proband-info');
        
        if (!infoDiv) {
            infoDiv = document.createElement('div');
            infoDiv.className = 'proband-info';
            infoDiv.style.cssText = `
                background: #e3f2fd;
                padding: 1rem;
                border-radius: 8px;
                margin-top: 1rem;
                border-left: 4px solid var(--primary-color);
            `;
            probandSection.appendChild(infoDiv);
        }

        infoDiv.innerHTML = `
            <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">✓ Registered Proband</h4>
            <p><strong>Name:</strong> ${this.proband.name}</p>
            <p><strong>MRN:</strong> ${this.proband.id}</p>
            <p><strong>Sex:</strong> ${this.proband.sex}</p>
            <p><strong>Age:</strong> ${this.proband.age} years</p>
            <p><strong>Diagnosis:</strong> ${this.proband.diagnosis}</p>
        `;
        
        // Update form button
        const form = document.getElementById('probandForm');
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Proband Registered';
        submitBtn.disabled = true;
        submitBtn.classList.add('btn-success');
    }

    displayFamilyMembers() {
        const familyList = document.getElementById('familyList');
        familyList.innerHTML = '';

        this.familyMembers.forEach((member, index) => {
            const memberDiv = document.createElement('div');
            memberDiv.className = 'family-member';
            memberDiv.innerHTML = `
                <div class="member-header">
                    <span class="member-name">${member.name}</span>
                    <span class="member-status status-unaffected">
                        ${this.formatRelationship(member.relationship)}
                    </span>
                </div>
                <div class="member-details">
                    <div><strong>Sex:</strong> ${member.sex}</div>
                    ${member.age ? `<div><strong>Age:</strong> ${member.age} years</div>` : ''}
                </div>
                <button class="btn-danger" style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; font-size: 0.75rem;" 
                        onclick="app.removeFamilyMember('${member.id}')">
                    <i class="fas fa-trash"></i> Remove
                </button>
            `;
            familyList.appendChild(memberDiv);
        });
    }

    async removeFamilyMember(memberId) {
        if (!confirm('Are you sure you want to remove this family member?')) return;

        try {
            this.showLoading('Removing family member...');
            
            const response = await fetch(`${this.apiBaseUrl}/family/member/${memberId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await this.loadFamilyMembers();
                this.showNotification('Family member removed successfully', 'success');
                this.updateAnalysisSummary();
            } else {
                throw new Error('Failed to remove family member');
            }
        } catch (error) {
            console.error('Error removing family member:', error);
            this.showNotification('Error removing family member: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    setDrawingMode(mode) {
        this.currentMode = mode;
        
        // Update toggle buttons
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        // Show/hide symbol palette
        const palette = document.getElementById('symbolPalette');
        if (mode === 'symbols') {
            palette.classList.add('active');
            this.canvas.style.cursor = 'pointer';
        } else {
            palette.classList.remove('active');
            this.canvas.style.cursor = 'crosshair';
        }
    }

    selectSymbol(symbolType) {
        this.selectedSymbol = symbolType;
        
        // Update selected state
        document.querySelectorAll('.symbol-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelector(`[data-symbol="${symbolType}"]`).classList.add('selected');
    }

    handleCanvasClick(e) {
        if (this.currentMode === 'symbols' && this.selectedSymbol) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.drawSymbol(x, y, this.selectedSymbol);
        }
    }

    drawSymbol(x, y, symbolType) {
        const size = 30;
        this.ctx.save();
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.lineWidth = 2;
        
        switch (symbolType) {
            case 'male':
                this.ctx.strokeRect(x - size/2, y - size/2, size, size);
                break;
            case 'female':
                this.ctx.beginPath();
                this.ctx.arc(x, y, size/2, 0, 2 * Math.PI);
                this.ctx.stroke();
                break;
            case 'affected-male':
                this.ctx.fillRect(x - size/2, y - size/2, size, size);
                this.ctx.strokeRect(x - size/2, y - size/2, size, size);
                break;
            case 'affected-female':
                this.ctx.beginPath();
                this.ctx.arc(x, y, size/2, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.stroke();
                break;
            case 'carrier-female':
                this.ctx.beginPath();
                this.ctx.arc(x, y, size/2, 0, 2 * Math.PI);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.arc(x, y, size/4, 0, 2 * Math.PI);
                this.ctx.fill();
                break;
            case 'deceased':
                this.ctx.strokeRect(x - size/2, y - size/2, size, size);
                this.ctx.beginPath();
                this.ctx.moveTo(x - size/2, y - size/2);
                this.ctx.lineTo(x + size/2, y + size/2);
                this.ctx.stroke();
                break;
        }
        
        this.ctx.restore();
        
        // Store symbol data
        this.symbols.push({
            x, y, type: symbolType, size
        });
    }

    startDrawing(e) {
        if (this.currentMode !== 'freehand') return;
        
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    draw(e) {
        if (!this.isDrawing || this.currentMode !== 'freehand') return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const color = document.getElementById('colorPicker').value;
        const size = document.getElementById('brushSize').value;

        this.ctx.lineWidth = size;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = color;
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    stopDrawing() {
        this.isDrawing = false;
        this.ctx.beginPath();
    }

    clearCanvas() {
        if (confirm('Are you sure you want to clear the pedigree canvas?')) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.symbols = [];
            this.showNotification('Canvas cleared', 'info');
        }
    }

    exportPedigree() {
        const link = document.createElement('a');
        link.download = `pedigree_${this.proband?.name || 'unknown'}_${new Date().toISOString().split('T')[0]}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
        
        this.showNotification('Pedigree exported successfully', 'success');
    }

    async performAIAnalysis() {
        if (!this.proband) {
            this.showNotification('Please register proband first', 'warning');
            return;
        }

        this.showLoading('Performing AI genetic analysis...');
        
        // Simulate AI analysis (replace with actual AI endpoint)
        setTimeout(() => {
            const patterns = ['Autosomal Dominant', 'Autosomal Recessive', 'X-linked', 'Mitochondrial', 'Complex'];
            const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
            
            document.getElementById('inheritancePattern').textContent = randomPattern;
            
            this.hideLoading();
            this.showNotification('AI analysis completed', 'success');
        }, 3000);
    }

    updateAnalysisSummary() {
        const generations = this.calculateGenerations();
        const affected = this.familyMembers.filter(m => m.status === 'affected').length + 
                        (this.proband ? 1 : 0);
        
        document.getElementById('generationCount').textContent = generations;
        document.getElementById('affectedCount').textContent = affected;
    }

    calculateGenerations() {
        if (!this.familyMembers.length) return this.proband ? 1 : 0;
        
        const relationships = this.familyMembers.map(m => m.relationship);
        let generations = 1; // Proband generation
        
        if (relationships.some(r => r.includes('father') || r.includes('mother'))) {
            generations = Math.max(generations, 2);
        }
        if (relationships.some(r => r.includes('grandfather') || r.includes('grandmother'))) {
            generations = Math.max(generations, 3);
        }
        if (relationships.some(r => r.includes('son') || r.includes('daughter'))) {
            generations = Math.max(generations, 2);
        }
        
        return generations;
    }

    showFamilyModal() {
        document.getElementById('familyModal').classList.remove('hidden');
    }

    hideFamilyModal() {
        document.getElementById('familyModal').classList.add('hidden');
    }

    showLoading(message = 'Processing...') {
        const overlay = document.getElementById('loadingOverlay');
        overlay.querySelector('p').textContent = message;
        overlay.classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        return colors[type] || '#3498db';
    }

    formatRelationship(relationship) {
        return relationship.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .btn-success {
        background: var(--success-color) !important;
    }
`;
document.head.appendChild(style);

// Initialize application
const app = new MedGenAI();

// Global error handling
window.addEventListener('error', (e) => {
    console.error('Application Error:', e.error);
    app.showNotification('An unexpected error occurred', 'error');
});

console.log('MedGenAI Clinical Platform Ready');