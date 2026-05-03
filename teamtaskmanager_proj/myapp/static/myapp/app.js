document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    
    // Check auth on main pages (not login)
    if (!token && !window.location.pathname.includes('/login/')) {
        window.location.href = '/login/';
        return;
    }
    
    // Load dashboard if we are on the home page
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        const role = localStorage.getItem('role') || 'MEMBER';
        
        loadDashboard();
        loadTasks();
        setupNavigation();
        setupModals();
        
        // Setup User Info
        document.getElementById('display-username').textContent = localStorage.getItem('username') || 'User';
        document.getElementById('display-role').textContent = role;
        
        // Show Admin Only items
        if (role === 'ADMIN') {
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'inline-block');
        }
    }

    // Auth forms
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData);
            
            try {
                const res = await fetch('/api/login/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                if (res.ok) {
                    const json = await res.json();
                    localStorage.setItem('token', json.token);
                    localStorage.setItem('username', data.username);
                    localStorage.setItem('role', json.role);
                    window.location.href = '/';
                } else {
                    alert('Invalid credentials');
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(signupForm);
            const data = Object.fromEntries(formData);
            
            try {
                const res = await fetch('/api/signup/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                if (res.ok) {
                    const json = await res.json();
                    localStorage.setItem('token', json.token);
                    localStorage.setItem('username', data.username);
                    localStorage.setItem('role', data.role);
                    window.location.href = '/';
                } else {
                    const errs = await res.json();
                    alert('Signup failed: ' + JSON.stringify(errs));
                }
            } catch (err) {
                console.error(err);
            }
        });
    }
});

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            const target = item.getAttribute('data-target');
            sections.forEach(sec => {
                sec.classList.remove('active');
                if (sec.id === target) {
                    sec.classList.add('active');
                }
            });
            
            if (target === 'projects-section') loadProjects();
        });
    });
}

function logout() {
    localStorage.clear();
    window.location.href = '/login/';
}

async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
        ...(options.headers || {})
    };
    
    const response = await fetch(endpoint, { ...options, headers });
    if (response.status === 401 || response.status === 403) {
        // Only logout if it's a hard 401/403 and we definitely should be allowed
        if (endpoint !== '/api/users/') { 
            // Users endpoint might be restricted depending on setup, but normally 401 means token expired
        }
    }
    return response;
}

async function loadDashboard() {
    try {
        const res = await fetchAPI('/api/dashboard/');
        if (!res.ok) return;
        const data = await res.json();
        
        document.getElementById('stat-total').textContent = data.total_tasks || 0;
        document.getElementById('stat-progress').textContent = data.in_progress_tasks || 0;
        document.getElementById('stat-completed').textContent = data.completed_tasks || 0;
        document.getElementById('stat-overdue').textContent = data.overdue_tasks || 0;
    } catch (e) {
        console.error("Dashboard error", e);
    }
}

async function loadTasks() {
    try {
        const res = await fetchAPI('/api/tasks/');
        if (!res.ok) return;
        const tasks = await res.json();
        
        const tbody = document.getElementById('tasks-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        if (tasks.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="empty-state">No tasks found. Start by creating a project and assigning tasks.</td></tr>`;
            return;
        }
        
        const today = new Date().toISOString().split('T')[0];

        tasks.forEach(task => {
            const tr = document.createElement('tr');
            
            let overdueBadge = '';
            if (task.due_date && task.due_date < today && task.status !== 'COMPLETED') {
                overdueBadge = '<span style="color: var(--danger); font-size: 0.8em; margin-left: 5px;">(Overdue)</span>';
            }

            tr.innerHTML = `
                <td>${task.title}</td>
                <td>Project #${task.project}</td>
                <td>${task.assignee_name || 'Unassigned'}</td>
                <td><span class="badge ${task.status.toLowerCase()}">${task.status.replace('_', ' ')}</span></td>
                <td>
                    <div style="background: rgba(255,255,255,0.1); width: 100px; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 5px;">
                        <div style="width: ${task.progress}%; background: var(--accent); height: 100%;"></div>
                    </div>
                    <small>${task.progress}%</small>
                </td>
                <td>${task.due_date || 'N/A'} ${overdueBadge}</td>
                <td>
                    <button class="btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" 
                            onclick="openUpdateModal(${task.id}, '${task.status}', ${task.progress}, ${task.assignee || 'null'})">Update</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error(e);
    }
}

async function loadProjects() {
    try {
        const res = await fetchAPI('/api/projects/');
        if(!res.ok) return;
        const projects = await res.json();
        const tbody = document.getElementById('projects-tbody');
        tbody.innerHTML = '';
        
        if (projects.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="empty-state">No projects found.</td></tr>`;
            return;
        }
        
        projects.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.name}</td>
                <td>${p.description}</td>
                <td>${p.created_by_name}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) { console.error(e); }
}

// Modal handling
function setupModals() {
    const modals = document.querySelectorAll('.modal');
    // Ensure all close buttons work
    const closeBtns = document.querySelectorAll('.close-btn');
    closeBtns.forEach(btn => {
        btn.onclick = function() {
            closeModals();
        }
    });
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}

async function openCreateModal() {
    try {
        // Fetch users
        const resUsers = await fetchAPI('/api/users/');
        if (resUsers.ok) {
            const users = await resUsers.json();
            const select = document.getElementById('assignee-select');
            select.innerHTML = '<option value="">-- Unassigned --</option>';
            users.forEach(u => {
                select.innerHTML += `<option value="${u.id}">${u.username} (${u.role})</option>`;
            });
        }

        // Fetch projects
        const resProjects = await fetchAPI('/api/projects/');
        if (resProjects.ok) {
            const projects = await resProjects.json();
            const projectSelect = document.getElementById('project-select');
            projectSelect.innerHTML = '';
            
            if (projects.length === 0) {
                alert("Please create a Project first before creating a task!");
                return;
            }
            
            projects.forEach(p => {
                projectSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
            });
        }
    } catch (e) { console.error(e); }
    
    document.getElementById('taskModal').classList.add('active');
}

function openModal(id) {
    document.getElementById(id).classList.add('active');
}

async function openUpdateModal(taskId, status, progress, currentAssignee) {
    document.getElementById('update-task-id').value = taskId;
    document.getElementById('update-status').value = status;
    document.getElementById('update-progress').value = progress;
    document.getElementById('progress-display').textContent = progress;
    
    const role = localStorage.getItem('role') || 'MEMBER';
    if (role === 'ADMIN') {
        const group = document.getElementById('update-assignee-group');
        group.style.display = 'block';
        
        try {
            const resUsers = await fetchAPI('/api/users/');
            if (resUsers.ok) {
                const users = await resUsers.json();
                const select = document.getElementById('update-assignee');
                select.innerHTML = '<option value="">-- Unassigned --</option>';
                users.forEach(u => {
                    select.innerHTML += `<option value="${u.id}">${u.username} (${u.role})</option>`;
                });
                if (currentAssignee && currentAssignee !== 'null') {
                    select.value = currentAssignee;
                }
            }
        } catch (e) { console.error(e); }
    }
    
    document.getElementById('updateTaskModal').classList.add('active');
}

async function submitTask(e) {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form));
    
    if (!data.assignee) {
        delete data.assignee;
    }

    try {
        const res = await fetchAPI('/api/tasks/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        if (res.ok) {
            closeModals();
            form.reset();
            loadTasks();
            loadDashboard();
        } else {
            alert("Error creating task. Ensure project ID exists.");
        }
    } catch (e) { console.error(e); }
}

async function submitUpdateTask(e) {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form));
    const taskId = data.id;
    
    const payload = {
        status: data.status,
        progress: parseInt(data.progress)
    };
    
    const role = localStorage.getItem('role') || 'MEMBER';
    if (role === 'ADMIN' && data.assignee !== undefined) {
        payload.assignee = data.assignee || null;
    }
    
    try {
        const res = await fetchAPI(`/api/tasks/${taskId}/`, {
            method: 'PATCH',
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            closeModals();
            loadTasks();
            loadDashboard();
        } else {
            alert("Error updating task.");
        }
    } catch (e) { console.error(e); }
}

async function submitProject(e) {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form));
    
    try {
        const res = await fetchAPI('/api/projects/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        if (res.ok) {
            closeModals();
            form.reset();
            loadProjects();
        } else {
            alert("Error creating project.");
        }
    } catch (e) { console.error(e); }
}
